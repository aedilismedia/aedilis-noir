/** Aynı mühür, portrelerde, kapakta, Markdown görsellerinde ve mekan kartlarında. */
export function enhanceImage(img:HTMLImageElement,container?:HTMLElement){
 if(img.dataset.enhanced==='true')return;
 img.dataset.enhanced='true';
 const host=container||document.createElement('span');
 if(!container){
  host.className='image-reveal';
  if(img.classList.contains('cover-image'))host.classList.add('cover-image-reveal');
  img.before(host);host.append(img);
 }else host.classList.add('image-reveal');
 const loader=document.createElement('span');loader.className='seal-loader';loader.setAttribute('role','status');
 const mark=document.createElement('span');mark.className='loading-seal';mark.setAttribute('aria-hidden','true');
 const text=document.createElement('span');text.className='loading-label';text.textContent='Görsel yükleniyor…';loader.append(mark,text);
 const complete=()=>{
  if(!host.contains(img))return;
  host.removeAttribute('aria-busy');host.classList.remove('image-waiting','image-failed');loader.remove();
  img.classList.remove('image-pending');img.classList.add('image-arrived');
 };
 const fail=()=>{
  if(!host.contains(img))return;
  host.removeAttribute('aria-busy');host.classList.remove('image-waiting');host.classList.add('image-failed');
  img.classList.add('image-pending');mark.remove();text.textContent='Görsel yüklenemedi.';
 };
 host.append(loader);host.setAttribute('aria-busy','true');host.classList.add('image-waiting');img.classList.add('image-pending');
 img.addEventListener('load',complete,{once:true});img.addEventListener('error',fail,{once:true});
 if(img.complete&&img.currentSrc){if(img.naturalWidth)complete();else fail();}
}
document.querySelectorAll<HTMLImageElement>('img').forEach(img=>{
 // Harita karoları Leaflet tarafından yönetilir; konum işaretleri görsel değildir.
 if(!img.closest('.leaflet-container,#place-photo'))enhanceImage(img);
});
