const stage=document.querySelector<HTMLElement>('.game-cover');
const button=document.querySelector<HTMLButtonElement>('#cover-motion');
if(stage&&button){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=false;try{paused=localStorage.getItem('noir-cover-motion')==='off'}catch{}
 const sync=()=>{
  stage.dataset.motion=paused||reduced.matches?'off':'on';
  button.hidden=reduced.matches;
  button.setAttribute('aria-pressed',String(paused));
  button.textContent=paused?'Hareketi aç':'Hareketi durdur';
 };
 sync();button.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('noir-cover-motion',paused?'off':'on')}catch{}sync()});
 reduced.addEventListener('change',sync);
}
