import L from 'leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';
import {setWorkerUrl} from 'maplibre-gl';
import maplibreWorker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import '@maplibre/maplibre-gl-leaflet';
import {enhanceImage} from './image-loading';
import {readStorage,writeStorage} from './common';
import places from '../data/mekanlar.json';
const labels={kurgu:'Kurgu mekanı · Yaklaşık konum',ani:'Anılarda & kayıtlarda',yol:'Şehrin içinde'};
const dialog=document.querySelector<HTMLDialogElement>('#place-dialog')!;
const status=document.querySelector<HTMLElement>('#map-status')!;
// Vite ile paketlenen harita işçisi (varsayılan konumu derlemede üretilmediği için açıkça verilir).
setWorkerUrl(maplibreWorker);
const styleUrls={light:'https://tiles.openfreemap.org/styles/positron',dark:'https://tiles.openfreemap.org/styles/dark'};
const styleForTheme=()=>document.documentElement.dataset.theme==='dark'?styleUrls.dark:styleUrls.light;
type Place=typeof places[number];
type Cluster={members:Place[];marker:L.Marker};
const pad=(n:number)=>String(n).padStart(2,'0');
const numberOf=(p:Place)=>places.indexOf(p)+1;
const entryOf=(id:string)=>document.getElementById(`yer-${id}`) as HTMLElement|null;
const mode=document.querySelector<HTMLButtonElement>('#atlas-mode')!;
const scope=document.querySelector<HTMLElement>('#atlas-scope')!;
const countLabel=document.querySelector<HTMLElement>('#place-count')!;
const emptyCard=document.querySelector<HTMLElement>('#map-empty')!;
const spoiler=document.querySelector<HTMLDialogElement>('#spoiler-dialog')!;

// --- Okuma durumu: hangi bölümlere girildiyse o bölümlerin mekanları açık sayılır. ---
const chapterNumber=(slug:unknown)=>{const n=Number(String(slug).match(/(\d+)$/)?.[1]);return Number.isFinite(n)?n:0;};
const highestRead=()=>{
 const progress=readStorage('kut-progress');
 const found=Object.keys(progress).map(chapterNumber);
 found.push(chapterNumber(readStorage('kut-last',null)));
 return Math.max(0,...found);
};
let highest=highestRead();
let allMode=readStorage('kut-atlas-all',false)===true;
const isVisible=(p:Place)=>allMode||Math.min(...p.chapters)<=highest;
const visiblePlaces=()=>places.filter(isVisible);

let map:L.Map|undefined;let returnFocus:HTMLElement|null=null;
let activeId:string|null=null;let hoverIds=new Set<string>();
let clusters:Cluster[]=[];const markerLayer=L.layerGroup();

function applyStates(){
 for(const c of clusters){
  const el=c.marker.getElement();if(!el)continue;
  el.classList.toggle('is-active',c.members.some(p=>p.id===activeId));
  el.classList.toggle('is-hover',c.members.some(p=>hoverIds.has(p.id)));
 }
 document.querySelectorAll<HTMLElement>('.place-entry').forEach(e=>{
  const id=e.id.replace(/^yer-/,'');
  e.classList.toggle('is-active',id===activeId);e.classList.toggle('is-hover',hoverIds.has(id));
 });
}
function setActive(id:string|null,reveal=true){
 activeId=id;applyStates();
 if(id&&reveal)entryOf(id)?.scrollIntoView({block:'nearest'});
}
function setHover(ids:string[]){hoverIds=new Set(ids);applyStates();}

function showPlace(id:string,opener?:HTMLElement){
 const index=places.findIndex(p=>p.id===id);const p=places[index];if(!p)return;
 returnFocus=opener||document.activeElement as HTMLElement;
 setActive(id);
 const values={'place-title':p.title,'place-area':p.area,'place-category':labels[p.kind],'place-no':pad(index+1),'place-description':p.text,'place-note':p.note};
 Object.entries(values).forEach(([key,value])=>document.getElementById(key)!.textContent=value);
 const photo=document.getElementById('place-photo')!;
 photo.hidden=true;photo.replaceChildren();photo.removeAttribute('aria-busy');photo.classList.remove('image-waiting','image-failed');
 const entry=entryOf(p.id)!;
 if(entry.dataset.image){
  photo.hidden=false;
  const img=new Image();img.alt=entry.dataset.imageAlt||p.title;img.decoding='async';
  const width=Number(entry.dataset.imageWidth),height=Number(entry.dataset.imageHeight);
  if(width&&height){img.width=width;img.height=height;}
  photo.append(img);enhanceImage(img,photo);img.src=entry.dataset.image;
 }
 dialog.scrollTop=0;
 // Spoiler korumalı modda henüz okunmamış bölümler kartta da gösterilmez.
 const shown=allMode?p.chapters:p.chapters.filter(n=>n<=highest);
 const chapters=document.getElementById('place-chapters')!;chapters.replaceChildren(...shown.map(n=>{const el=document.createElement('span');el.textContent=`Bölüm ${pad(n)}`;return el;}));
 if(!dialog.open)dialog.showModal();
}
dialog.querySelector('button')!.addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>returnFocus?.focus());

// Listeden seçim ve liste ile harita arasında vurgu eşleşmesi
document.querySelectorAll<HTMLElement>('[data-place]').forEach(el=>{
 const id=el.dataset.place!;
 el.addEventListener('click',e=>{e.preventDefault();const p=places.find(p=>p.id===id)!;setActive(id,false);map?.setView([p.lat,p.lng],Math.max(map.getZoom(),15),{animate:false});showPlace(p.id,el);});
 el.addEventListener('mouseenter',()=>setHover([id]));el.addEventListener('mouseleave',()=>setHover([]));
 el.addEventListener('focus',()=>setHover([id]));el.addEventListener('blur',()=>setHover([]));
});

// --- İşaretçiler: yakın olanlar tek sayılı rozette birleşir (zoom'a göre). ---
function buildGroups(list:Place[]){
 const z=map!.getZoom();const radius=44;
 const groups:{members:Place[];xs:number[];ys:number[]}[]=[];
 for(const p of list){
  const pt=map!.project([p.lat,p.lng],z);
  let g=groups.find(g=>Math.hypot(avg(g.xs)-pt.x,avg(g.ys)-pt.y)<radius);
  if(!g){g={members:[],xs:[],ys:[]};groups.push(g);}
  g.members.push(p);g.xs.push(pt.x);g.ys.push(pt.y);
 }
 return groups.map(g=>g.members);
}
const avg=(a:number[])=>a.reduce((x,y)=>x+y,0)/a.length;
function memberList(members:Place[],marker:L.Marker){
 const list=document.createElement('div');list.className='shared-place';
 for(const p of members){
  const b=document.createElement('button');b.type='button';b.textContent=`${pad(numberOf(p))} · ${p.title}`;
  b.addEventListener('click',()=>{map!.closePopup();showPlace(p.id,marker.getElement());});list.append(b);
 }
 return list;
}
function onMarkerClick(c:Cluster){
 const first=c.members[0];
 if(c.members.length===1){showPlace(first.id,c.marker.getElement());return;}
 const sameSpot=c.members.every(p=>p.lat===first.lat&&p.lng===first.lng);
 if(sameSpot||map!.getZoom()>=17){
  L.popup({closeButton:true}).setLatLng(c.marker.getLatLng()).setContent(memberList(c.members,c.marker)).openOn(map!);
 }else{
  map!.fitBounds(L.latLngBounds(c.members.map(p=>[p.lat,p.lng] as [number,number])),{padding:[90,90],maxZoom:17,animate:false});
 }
}
function renderMarkers(){
 if(!map)return;
 markerLayer.clearLayers();clusters=[];
 for(const members of buildGroups(visiblePlaces())){
  const single=members.length===1;const first=members[0];
  const lat=avg(members.map(p=>p.lat)),lng=avg(members.map(p=>p.lng));
  const size=single?(first.kind==='kurgu'?46:44):50;
  const icon=L.divIcon({className:single?`story-marker ${first.kind}`:'story-marker cluster',html:`<span><b>${single?pad(numberOf(first)):members.length}</b></span>`,iconSize:[size,size],iconAnchor:[size/2,size/2]});
  const names=members.map(p=>p.title).join(' / ');
  const label=single?names:`${members.length} mekan: ${names}`;
  const marker=L.marker([lat,lng],{icon,title:label,keyboard:true}).addTo(markerLayer);
  marker.on('add',()=>marker.getElement()?.setAttribute('aria-label',label));
  const cluster={members,marker};clusters.push(cluster);
  marker.on('click',()=>onMarkerClick(cluster));
  marker.on('mouseover',()=>setHover(members.map(p=>p.id)));marker.on('mouseout',()=>setHover([]));
 }
 applyStates();
}
function fitVisible(){
 if(!map)return;map.closePopup();
 const vis=visiblePlaces();
 if(!vis.length){map.setView([41.014,28.957],11,{animate:false});return;}
 map.fitBounds(L.latLngBounds(vis.map(p=>[p.lat,p.lng] as [number,number])),{padding:[45,65],maxZoom:15,animate:false});
}

// --- Atlas görünümü: spoiler korumalı (varsayılan) veya tüm mekanlar ---
function renderAtlas(fit=true){
 const vis=visiblePlaces();const ids=new Set(vis.map(p=>`yer-${p.id}`));
 document.querySelectorAll<HTMLElement>('.place-entry').forEach(e=>{e.hidden=!ids.has(e.id);});
 if(activeId&&!vis.some(p=>p.id===activeId))activeId=null;
 countLabel.textContent=allMode?`${pad(places.length)} kayıt`:`${pad(vis.length)} / ${pad(places.length)} kayıt`;
 mode.textContent=allMode?'Yalnızca okuduklarım':'Tüm mekanları göster';
 scope.textContent=allMode?'Spoiler korumasını kapattın: tüm mekanlar gösteriliyor.':(vis.length?`Okuduğun bölümlere göre ${vis.length} mekan açık. Okudukça yenileri eklenir.`:'Henüz açılmış mekan yok. Bölümleri okudukça mekanlar haritaya eklenir.');
 emptyCard.hidden=vis.length>0;
 if(map){if(fit)fitVisible();renderMarkers();}
}
mode.addEventListener('click',()=>{
 if(allMode){allMode=false;writeStorage('kut-atlas-all',false);renderAtlas();return;}
 returnFocus=mode;spoiler.showModal();
});
document.querySelector('#empty-show-all')?.addEventListener('click',e=>{returnFocus=e.currentTarget as HTMLElement;spoiler.showModal();});
document.querySelector('#spoiler-cancel')!.addEventListener('click',()=>spoiler.close());
document.querySelector('#spoiler-accept')!.addEventListener('click',()=>{allMode=true;writeStorage('kut-atlas-all',true);spoiler.close();renderAtlas();});
spoiler.addEventListener('close',()=>{(allMode?mode:returnFocus)?.focus();});
// Geri/ileri ile dönüldüğünde okuma durumu değişmiş olabilir.
window.addEventListener('pageshow',e=>{if(e.persisted){highest=highestRead();renderAtlas();}});

try{
 map=L.map('story-map',{scrollWheelZoom:true,zoomControl:false,maxZoom:19}).setView([41.014,28.957],13);
 L.control.zoom({position:'bottomright',zoomInTitle:'Yakınlaştır',zoomOutTitle:'Uzaklaştır'}).addTo(map);
 L.control.scale({imperial:false,position:'bottomleft'}).addTo(map);
 map.attributionControl.setPrefix(false);
 // Ana harita: OpenFreeMap vektör stili (anahtarsız, limitsiz). Tema değişince stil de değişir.
 let loaded=false,fellBack=false;let gl:any;
 const markLoaded=()=>{loaded=true;status.hidden=true;};
 const showFailure=()=>{if(!loaded){status.hidden=false;status.textContent='Harita yüklenemedi. Mekan kartlarını listeden açabilirsiniz.';}};
 // WebGL yoksa veya stil yüklenemezse OpenStreetMap karolarına dönülür.
 const fallbackToRaster=()=>{
  if(fellBack)return;fellBack=true;
  try{if(gl)map!.removeLayer(gl);}catch{/* katman zaten kaldırılmış olabilir */}
  const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> katkıda bulunanlar'}).addTo(map!);
  tiles.on('tileload',markLoaded);tiles.on('tileerror',showFailure);
 };
 try{
  gl=(L as any).maplibreGL({style:styleForTheme()}).addTo(map);
  const glMap=gl.getMaplibreMap();
  glMap.on('load',markLoaded);
  glMap.on('error',()=>{if(!loaded)fallbackToRaster();});
  new MutationObserver(()=>{if(!fellBack)glMap.setStyle(styleForTheme());}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 }catch{fallbackToRaster();}
 map.on('zoomend',renderMarkers);
 markerLayer.addTo(map);
 document.getElementById('map-reset')!.addEventListener('click',()=>{setActive(null);fitVisible();});
 new ResizeObserver(()=>map?.invalidateSize()).observe(document.getElementById('story-map')!);
}catch{status.textContent='Harita açılamadı. Mekan kartlarını listeden açabilirsiniz.';}

renderAtlas();
// Bölüm sonundaki "Kilidi açılanlar" bağlantısı (#yer-...) ilgili mekan kartını açar.
const linked=decodeURIComponent(location.hash).match(/^#yer-(.+)$/)?.[1];
const linkedPlace=linked?places.find(p=>p.id===linked):undefined;
if(linkedPlace&&isVisible(linkedPlace)){setActive(linkedPlace.id);showPlace(linkedPlace.id);}
