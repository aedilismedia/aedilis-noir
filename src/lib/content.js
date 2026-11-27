import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import book from '../../kitap.json';
import {glossify} from './glossary';
import sceneData from '../data/sahneler.json';
export {book};
export const href=(p='')=>`${import.meta.env.BASE_URL.replace(/\/$/,'')}/${p.replace(/^\//,'')}`;
export const absolute=(p='')=>new URL(href(p),process.env.SITE_URL || book.siteUrl).href;
export const escapeXml=s=>String(s).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
export function cleanObsidian(text){
  // Metin içeriği korunur; Obsidian bağlantı sözdizimi görünür etikete dönüştürülür.
  return text.replace(/!?\[\[([^\]]+)\]\]/g,(_,v)=>v.includes('|')?v.split('|').slice(1).join('|'):v)
    .replace(/%%[\s\S]*?%%/g,'').replace(/^>\s*\[![^\]]+\][+-]?\s*/gm,'> ')
    .replace(/^\s*(?:\*\s*){3,}\s*$|^\s*-{3,}\s*$/gm,'\n\n<hr>\n\n');
}
export function render(text){return sanitizeHtml(marked.parse(cleanObsidian(text)),{allowedTags:sanitizeHtml.defaults.allowedTags.concat(['img']),allowedAttributes:{...sanitizeHtml.defaults.allowedAttributes,img:['src','alt','title','width','height','loading']},allowedSchemes:['http','https','mailto'],transformTags:{img:(tag,attrs)=>({tagName:tag,attribs:{...attrs,loading:'lazy'}})}});}

// Sahne görselleri: bölüm metni değişmez; görsel, eşleşen paragrafın arkasına derlemede eklenir.
const decode=s=>s.replace(/&#39;|&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ');
function addScenes(html,number){
 for(const sc of sceneData.scenes.filter(x=>x.chapter===number)){
  let done=false;
  html=html.replace(/<p>[\s\S]*?<\/p>/g,m=>{
   if(done||!decode(m.replace(/<[^>]+>/g,'')).includes(sc.after))return m;
   done=true;
   const src=w=>href(`sahneler/${sc.image}-${w}.webp`);
   const alt=sc.alt.replace(/"/g,'&quot;');
   return `${m}\n<figure class="scene-figure"><img src="${src(1600)}" srcset="${src(800)} 800w, ${src(1600)} 1600w" sizes="(min-width: 1000px) 960px, calc(100vw - 32px)" width="${sc.width}" height="${sc.height}" alt="${alt}" loading="lazy" decoding="async"></figure>`;
  });
  if(!done)throw new Error(`Sahne görseli yerleştirilemedi (Bölüm ${number}, ${sc.image}): "${sc.after}" metinde bulunamadı.`);
 }
 return html;
}
function parseFile(file){
 const raw=fs.readFileSync(file,'utf8');
 try{return matter(raw);}catch(e){console.warn(`Ön bilgi okunamadı (${file}); metin korunarak devam ediliyor.`);return {data:{},content:raw};}
}
export function chapters(){
 const dir=path.resolve('bolumler');
 const list=fs.readdirSync(dir).filter(f=>/\.md$/i.test(f)).map(file=>{
  const number=Number(file.match(/\d+/)?.[0]);
  if(!Number.isFinite(number)||number<1){console.warn(`Numarasız bölüm atlandı: ${file}`);return null;}
  const {data,content}=parseFile(path.join(dir,file));
  if(data.draft===true||data.draft==='true')return null;
  const heading=content.match(/^#\s+(.+)$/m);
  const firstLine=content.split('\n').find(l=>l.trim())?.replace(/^#+\s*/,'').trim();
  const title=String(data.title || heading?.[1] || (firstLine&&firstLine.length<=100?firstLine:path.basename(file,'.md')));
  const body=heading&&!data.title?content.replace(heading[0],''):content.replace(new RegExp('^# '+title.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*\\n'), '');
  const plain=cleanObsidian(body).replace(/<[^>]*>/g,'').replace(/[#*_`>]/g,'').trim();
  const words=plain.split(/\s+/).length;
  // Başlık yalnızca "Bölüm N" ise ve alt başlık varsa, alt başlık asıl başlık olur; numara ayrıca gösterilir.
  const subtitleText=String(data.subtitle||'').trim();
  const numberOnly=/^b[öo]l[üu]m\s*\d+$/i.test(title.trim())&&subtitleText;
  const shownTitle=numberOnly?subtitleText:title;
  const documentTitle=numberOnly?`Bölüm ${number} · ${subtitleText}`:title;
  return {number,book:Math.max(1,Math.floor(Number(data.kitap??data.book)||1)),file,title:shownTitle,documentTitle,subtitle:numberOnly?'':subtitleText,epigraph:String(data.epigraph||''),date:data.date?new Date(data.date):null,minutes:Math.max(1,Math.ceil(words/210)),words,html:render(body),slug:`bolum-${String(number).padStart(2,'0')}`,description:plain.slice(0,155).replace(/\s+\S*$/,'')+'…'};
 }).filter(Boolean).sort((a,b)=>a.number-b.number);
 const glossState={};for(const c of list)c.html=addScenes(glossify(c.html,c.number,glossState),c.number);
 const seen=new Set();for(const c of list){if(seen.has(c.number))throw new Error(`Aynı bölüm numarası iki kez kullanılmış: ${c.number}. Dosyaları kontrol edin.`);seen.add(c.number);}
 return list;
}
export function universe(){return render(parseFile(path.resolve('evren.md')).content);}
export function info(name){const file=path.resolve(`${name}.md`);return fs.existsSync(file)?render(parseFile(file).content):'';}
