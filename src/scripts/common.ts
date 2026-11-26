export const readStorage=(key:string,fallback:any={})=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback;}catch{return fallback;}};
export const writeStorage=(key:string,value:any)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Gizli gezinmede okuma çalışmaya devam eder. */}};
import {gateOff} from './gate';
const visited=readStorage('kut-progress');
const resume=document.querySelector<HTMLAnchorElement>('#resume-link');
if(resume){const last=readStorage('kut-last',null);const chapter=JSON.parse(resume.dataset.chapters||'[]').find((c:any)=>c.slug===last);if(chapter){resume.href=chapter.url+'?devam=1';resume.textContent='Kaldığın Yerden Devam Et';}}
const gateSlugs:string[]=[];
document.querySelectorAll<HTMLAnchorElement>('[data-chapter-link]').forEach(el=>{const slug=el.dataset.chapterLink!;const done=visited[slug]?.done===true;if(done)el.querySelector<HTMLElement>('.read-mark')!.hidden=false;if(!gateOff()&&gateSlugs.some(s=>visited[s]?.done!==true)){el.classList.add('is-locked');el.setAttribute('aria-disabled','true');el.dataset.href=el.getAttribute('href')||'';el.removeAttribute('href');el.querySelector<HTMLElement>('.lock-mark')!.hidden=false;}gateSlugs.push(slug);});
const media=matchMedia('(prefers-color-scheme: dark)');
media.addEventListener('change',()=>{if(!readStorage('kut-settings').theme)document.documentElement.dataset.theme=media.matches?'dark':'light';});
// Yerleşik details menüsü JavaScript olmadan da açılır; Esc/dış tıklama ek kolaylıktır.
const mobileMenu=document.querySelector<HTMLDetailsElement>('.mobile-menu');
if(mobileMenu){document.addEventListener('click',e=>{if(!mobileMenu.contains(e.target as Node))mobileMenu.open=false;});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mobileMenu.open){mobileMenu.open=false;mobileMenu.querySelector<HTMLElement>('summary')?.focus();}});}
