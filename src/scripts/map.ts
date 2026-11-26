// Valara haritası: sürükle, tekerlek/kıstırma ile yakınlaştır; bölge ve mekân kartları.
type Place={id:string;name:string;district:string;x:number;y:number;chapter:number;text:string};
type District={name:string;side:string;x:number;y:number};
const data=JSON.parse(document.getElementById('map-data')!.textContent||'{}') as {districts:District[];places:Place[]};
const stage=document.getElementById('map-stage') as HTMLElement;
const world=document.getElementById('map-world') as HTMLElement;
const W=world.offsetWidth||1600,H=world.offsetHeight||2000;
const card=document.getElementById('map-card') as HTMLElement;
const $=(id:string)=>document.getElementById(id) as HTMLElement;

// --- okuma durumu (karakter sayfasıyla aynı anahtarlar)
const read=(k:string,d:any)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v??d;}catch{return d;}};
const num=(x:string)=>{const m=String(x).match(/(\d+)$/);return m?+m[1]:0;};
const showAll=()=>read('noir-atlas-all',false)===true;
function reached(){let h=num(read('noir-last',''));const p=read('noir-progress',{});for(const k in p)h=Math.max(h,num(k));return h;}
const open=(p:Place)=>showAll()||p.chapter<=reached();
function refreshPins(){
 let n=0;
 document.querySelectorAll<HTMLElement>('.map-pin').forEach(el=>{const p=data.places.find(x=>x.id===el.dataset.place)!;const on=open(p);el.hidden=!on;if(on)n++;});
 $('map-mode').textContent=showAll()?'Yalnızca okuduklarım':'Tüm mekânları göster';
 $('map-scope').textContent=showAll()?'Spoiler korumasını kapattın: tüm mekânlar gösteriliyor.':n?`Okuduğun bölümlere göre ${n} mekân işaretli. Okudukça yenileri eklenir.`:'Bölge adlarına dokunabilirsin. Mekânlar okudukça belirir.';
 $('map-empty').hidden=n>0;
 return n;
}

// --- görünüm
let s=1,tx=0,ty=0,minS=.2;const maxS=3;
function fitScale(){const r=stage.getBoundingClientRect();return Math.min(r.width/W,r.height/H);}
function clamp(){
 const r=stage.getBoundingClientRect();const w=W*s,h=H*s;
 tx=w<=r.width?(r.width-w)/2:Math.min(0,Math.max(r.width-w,tx));
 ty=h<=r.height?(r.height-h)/2:Math.min(0,Math.max(r.height-h,ty));
}
function apply(){clamp();world.style.transform=`translate(${tx}px,${ty}px) scale(${s})`;world.style.setProperty('--inv',String(1/s));}
function zoomAt(f:number,cx:number,cy:number){const ns=Math.min(maxS,Math.max(minS,s*f));const k=ns/s;tx=cx-(cx-tx)*k;ty=cy-(cy-ty)*k;s=ns;apply();}
function center(){const r=stage.getBoundingClientRect();return [r.width/2,r.height/2];}
function reset(){minS=fitScale();s=minS;tx=0;ty=0;apply();}
function focus(x:number,y:number,scale=Math.max(s,minS*2.2)){const r=stage.getBoundingClientRect();s=Math.min(maxS,scale);tx=r.width/2-x*s;ty=r.height/2-y*s;world.classList.add('glide');apply();setTimeout(()=>world.classList.remove('glide'),420);}

// --- etkileşim: sürükleme ve kıstırma
const pts=new Map<number,{x:number;y:number}>();let moved=0,pinch=0;
stage.addEventListener('pointerdown',e=>{pts.set(e.pointerId,{x:e.clientX,y:e.clientY});moved=0;if(pts.size===2){const [a,b]=[...pts.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y);}});
stage.addEventListener('pointermove',e=>{
 const prev=pts.get(e.pointerId);if(!prev)return;
 if(pts.size===1){const dx=e.clientX-prev.x,dy=e.clientY-prev.y;moved+=Math.abs(dx)+Math.abs(dy);if(moved>4){stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');}tx+=dx;ty+=dy;apply();}
 pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pts.size===2){const [a,b]=[...pts.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);const r=stage.getBoundingClientRect();if(pinch)zoomAt(d/pinch,(a.x+b.x)/2-r.left,(a.y+b.y)/2-r.top);pinch=d;moved=99;}
});
const end=(e:PointerEvent)=>{pts.delete(e.pointerId);if(pts.size<2)pinch=0;if(!pts.size)stage.classList.remove('dragging');};
stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
stage.addEventListener('wheel',e=>{e.preventDefault();const r=stage.getBoundingClientRect();zoomAt(Math.exp(-e.deltaY*0.0015),e.clientX-r.left,e.clientY-r.top);},{passive:false});
stage.addEventListener('keydown',e=>{
 const step=80;const [cx,cy]=center();
 if(e.key==='+'||e.key==='=')zoomAt(1.3,cx,cy);else if(e.key==='-')zoomAt(1/1.3,cx,cy);
 else if(e.key==='ArrowLeft'){tx+=step;apply();}else if(e.key==='ArrowRight'){tx-=step;apply();}
 else if(e.key==='ArrowUp'){ty+=step;apply();}else if(e.key==='ArrowDown'){ty-=step;apply();}
 else if(e.key==='Escape'){closeCard();}else return;
 e.preventDefault();
});
$('map-in').addEventListener('click',()=>{const [cx,cy]=center();zoomAt(1.4,cx,cy);});
$('map-out').addEventListener('click',()=>{const [cx,cy]=center();zoomAt(1/1.4,cx,cy);});
$('map-reset').addEventListener('click',reset);

// --- kartlar
let selected:Element|null=null;
function select(el:Element|null){selected?.classList.remove('is-selected');selected=el;el?.classList.add('is-selected');}
function showDistrict(name:string){
 const d=data.districts.find(x=>x.name===name);if(!d)return;
 select(document.querySelector(`[data-district="${CSS.escape(name)}"]`));
 $('map-card-kicker').textContent=d.side.toLocaleUpperCase('tr-TR');
 $('map-card-title').textContent=d.name;
 const here=data.places.filter(p=>p.district===d.name&&open(p));
 $('map-card-text').textContent=here.length?'Okuduğun bölümlerde geçen yerler:':'Bu bölgede henüz açılmış bir mekân yok.';
 const ul=$('map-card-list');ul.replaceChildren(...here.map(p=>{const li=document.createElement('li');const b=document.createElement('button');b.type='button';b.textContent=p.name;b.addEventListener('click',()=>showPlace(p.id,true));li.append(b);return li;}));
 card.hidden=false;
}
function showPlace(id:string,move=false){
 const p=data.places.find(x=>x.id===id);if(!p||!open(p))return;
 select(document.getElementById(`yer-${p.id}`));
 $('map-card-kicker').textContent=`${p.district.toLocaleUpperCase('tr-TR')} · ${p.chapter}. BÖLÜM`;
 $('map-card-title').textContent=p.name;$('map-card-text').textContent=p.text;$('map-card-list').replaceChildren();
 card.hidden=false;if(move)focus(p.x,p.y);
 history.replaceState(null,'',`#yer-${p.id}`);
}
function closeCard(){card.hidden=true;select(null);if(location.hash)history.replaceState(null,'',location.pathname);}
$('map-card-close').addEventListener('click',closeCard);
world.addEventListener('click',e=>{
 if(moved>4)return;
 const t=e.target as HTMLElement;
 const pin=t.closest<HTMLElement>('.map-pin');if(pin){showPlace(pin.dataset.place!);return;}
 const path=t.closest<SVGPathElement>('[data-district]');if(path){showDistrict(path.dataset.district!);return;}
});
document.querySelectorAll<HTMLButtonElement>('[data-goto]').forEach(b=>b.addEventListener('click',()=>{const d=data.districts.find(x=>x.name===b.dataset.goto)!;showDistrict(d.name);focus(d.x,d.y);stage.scrollIntoView({block:'nearest',behavior:'smooth'});}));

// --- spoiler anahtarı
const dialog=document.getElementById('map-spoiler') as HTMLDialogElement;
const writeAll=(on:boolean)=>{try{localStorage.setItem('noir-atlas-all',JSON.stringify(on));}catch{/* gizli gezinme */}};
$('map-mode').addEventListener('click',()=>{if(showAll()){writeAll(false);refreshPins();closeCard();}else dialog.showModal();});
$('map-spoiler-cancel').addEventListener('click',()=>dialog.close());
$('map-spoiler-accept').addEventListener('click',()=>{writeAll(true);dialog.close();refreshPins();});

// --- başlangıç
reset();refreshPins();
window.addEventListener('resize',()=>{const was=s<=minS*1.01;minS=fitScale();if(was)s=minS;apply();});
window.addEventListener('pageshow',e=>{if(e.persisted)refreshPins();});
const hash=location.hash.match(/^#yer-(.+)$/);
if(hash){const p=data.places.find(x=>x.id===decodeURIComponent(hash[1]));if(p&&open(p))showPlace(p.id,true);}
