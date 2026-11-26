// Sözlük işaretleri: (*) üzerine gelince, odaklanınca veya dokununca anlam balonu gösterilir.
const items=document.querySelectorAll<HTMLElement>('.gloss');
if(items.length){
const tip=document.createElement('div');tip.id='gloss-tip';tip.setAttribute('role','tooltip');tip.hidden=true;document.body.appendChild(tip);
let current:HTMLElement|null=null;
items.forEach(el=>el.removeAttribute('title'));
function place(el:HTMLElement){
 const r=el.getBoundingClientRect();const w=tip.offsetWidth;const h=tip.offsetHeight;const gap=10;
 let left=r.left+r.width/2-w/2;left=Math.max(12,Math.min(left,window.innerWidth-w-12));
 let top=r.top-h-gap;let below=false;if(top<12){top=r.bottom+gap;below=true;}
 tip.style.left=`${left}px`;tip.style.top=`${top}px`;tip.dataset.side=below?'below':'above';
 tip.style.setProperty('--arrow',`${Math.max(14,Math.min(w-14,r.left+r.width/2-left))}px`);
}
function show(el:HTMLElement){
 if(current&&current!==el)current.removeAttribute('aria-describedby');
 current=el;tip.textContent=el.dataset.gloss||'';tip.hidden=false;el.setAttribute('aria-describedby','gloss-tip');place(el);
}
function hide(){if(current)current.removeAttribute('aria-describedby');current=null;tip.hidden=true;}
const target=(e:Event)=>(e.target as HTMLElement|null)?.closest?.('.gloss') as HTMLElement|null;
document.addEventListener('pointerover',e=>{const el=target(e);if(el&&(e as PointerEvent).pointerType==='mouse')show(el);});
document.addEventListener('pointerout',e=>{const el=target(e);if(el&&(e as PointerEvent).pointerType==='mouse'&&el!==document.activeElement)hide();});
let touch=false;
document.addEventListener('pointerdown',e=>{touch=e.pointerType!=='mouse';},true);
document.addEventListener('focusin',e=>{const el=target(e);if(el&&!touch)show(el);});
document.addEventListener('focusout',e=>{if(target(e))hide();});
document.addEventListener('click',e=>{
 const el=target(e);
 if(!el){hide();return;}
 if(!touch)return;
 if(current===el&&!tip.hidden)hide();else show(el);
});
document.addEventListener('keydown',e=>{touch=false;if(e.key==='Escape')hide();});
window.addEventListener('scroll',()=>{if(current)hide();},{passive:true});
window.addEventListener('resize',hide);
}
