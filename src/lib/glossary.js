import entries from '../data/sozluk.json';

// Sözlük: okurun bilmeyebileceği sözcüklerin yanına (*) konur, üzerine gelince anlamı çıkar.
// Her giriş yalnızca "chapters" listesindeki bölümlerde aranır. Bir sözcük kitapta ilk geçtiği yerde,
// sonra da son işaretten en az REPEAT bölüm sonra ilk geçtiği yerde işaretlenir.
const REPEAT=3;
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const html=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const cap=s=>s.charAt(0).toLocaleUpperCase('tr-TR')+s.slice(1);
const prepared=entries.map(e=>{
  const forms=[...new Set(e.forms.flatMap(f=>[f,cap(f)]))].sort((a,b)=>b.length-a.length);
  return {key:e.key,chapters:new Set(e.chapters),meaning:e.meaning,re:new RegExp(`(?<![\\p{L}\\p{N}])(?:${forms.map(esc).join('|')})(?![\\p{L}\\p{N}])`,'u')};
});

/** Bölüm HTML'ini (sırayla çağrılmalı) sözlük işaretleriyle zenginleştirir; durum `state` içinde taşınır. */
export function glossify(source,number,state){
  const parts=source.split(/(<[^>]+>)/);
  const todo=prepared.filter(e=>e.chapters.has(number)&&(!(e.key in state)||number-state[e.key]>=REPEAT));
  // Her giriş için en erken eşleşmeyi bul.
  const hits=[];
  for(const e of todo){
    let offset=0;
    for(let i=0;i<parts.length;i++){
      const p=parts[i];
      if(i%2===1||!p){offset+=p.length;continue;}
      const m=e.re.exec(p);
      if(m){hits.push({e,part:i,index:m.index,length:m[0].length,text:m[0]});break;}
      offset+=p.length;
    }
  }
  // Çakışan eşleşmelerde uzun olan kazanır.
  hits.sort((a,b)=>a.part-b.part||a.index-b.index||b.length-a.length);
  const chosen=[];
  for(const h of hits){
    const clash=chosen.some(c=>c.part===h.part&&h.index<c.index+c.length&&c.index<h.index+h.length);
    if(!clash)chosen.push(h);
  }
  const byPart=new Map();
  for(const h of chosen){(byPart.get(h.part)||byPart.set(h.part,[]).get(h.part)).push(h);state[h.e.key]=number;}
  for(const [i,list] of byPart){
    list.sort((a,b)=>b.index-a.index);
    let p=parts[i];
    for(const h of list){
      const tip=html(h.e.meaning);
      p=p.slice(0,h.index)+`<span class="gloss" tabindex="0" title="${tip}" data-gloss="${tip}"><span class="gloss-word">${h.text}</span><span class="gloss-star" aria-hidden="true">*</span></span>`+p.slice(h.index+h.length);
    }
    parts[i]=p;
  }
  return parts.join('');
}
