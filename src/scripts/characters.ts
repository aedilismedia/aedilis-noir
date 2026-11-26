// Portre ızgarası: fare olan cihazlarda kart üzerine gelince (CSS), dokunmatik cihazlarda dokununca açılır.
const tiles=[...document.querySelectorAll<HTMLElement>('.char-tile')];
const touch=window.matchMedia('(hover: none)');
// Kart, portrenin yanında açılır; sağda yer yoksa sola geçer.
function placeCard(tile:HTMLElement){
 const card=tile.querySelector<HTMLElement>('.char-card');if(!card)return;
 const box=tile.getBoundingClientRect();const room=window.innerWidth-box.right;
 tile.classList.toggle('card-left',room<card.offsetWidth+16&&box.left>room);
}
function closeAll(except?:HTMLElement){tiles.forEach(t=>{if(t!==except)t.classList.remove('is-open');});}
tiles.forEach(tile=>{
 ['mouseenter','focusin','touchstart'].forEach(name=>tile.addEventListener(name,()=>placeCard(tile),{passive:true}));
 tile.addEventListener('click',()=>{
  if(!touch.matches)return;
  const open=!tile.classList.contains('is-open');
  closeAll(tile);tile.classList.toggle('is-open',open);document.body.classList.toggle('char-sheet-open',open);
 });
 tile.addEventListener('keydown',event=>{
  if(event.key==='Escape'){tile.classList.remove('is-open');document.body.classList.remove('char-sheet-open');tile.blur();}
  if((event.key==='Enter'||event.key===' ')&&touch.matches){event.preventDefault();tile.click();}
 });
});
document.addEventListener('click',event=>{
 if(!(event.target as HTMLElement).closest('.char-tile')){closeAll();document.body.classList.remove('char-sheet-open');}
});

// --- Okuma durumuna göre açılan karakterler (mekanlarla aynı kural ve aynı anahtar) ---
const refresh=()=>(window as any).kutCharacters?.();
const readFlag=()=>{try{return JSON.parse(localStorage.getItem('kut-atlas-all')||'false')===true;}catch{return false;}};
const writeFlag=(on:boolean)=>{try{localStorage.setItem('kut-atlas-all',JSON.stringify(on));}catch{/* Gizli gezinmede seçim kaydedilmez. */}};
const modeButton=document.querySelector<HTMLButtonElement>('#char-mode');
const spoiler=document.querySelector<HTMLDialogElement>('#char-spoiler');
let returnFocus:HTMLElement|null=null;
const ask=(from:HTMLElement)=>{returnFocus=from;spoiler?.showModal();};
modeButton?.addEventListener('click',()=>{if(readFlag()){writeFlag(false);refresh();closeAll();return;}ask(modeButton);});
document.querySelector<HTMLElement>('#char-empty-all')?.addEventListener('click',event=>ask(event.currentTarget as HTMLElement));
document.querySelector('#char-spoiler-cancel')?.addEventListener('click',()=>spoiler?.close());
document.querySelector('#char-spoiler-accept')?.addEventListener('click',()=>{writeFlag(true);spoiler?.close();refresh();});
spoiler?.addEventListener('close',()=>{(readFlag()?modeButton:returnFocus)?.focus();});
// Geri/ileri ile dönüldüğünde okuma durumu değişmiş olabilir.
window.addEventListener('pageshow',event=>{if(event.persisted)refresh();});
