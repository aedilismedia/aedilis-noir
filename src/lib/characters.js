import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {render} from './content';

/** Her karakter tek Markdown dosyasıdır; order veya dosya numarasıyla sıralanır. */
export function characters(){
 const directory=path.resolve('karakterler');
 if(!fs.existsSync(directory))return [];
 return fs.readdirSync(directory).filter(file=>/\.md$/i.test(file)).map(file=>{
  const {data,content}=matter(fs.readFileSync(path.join(directory,file),'utf8'));
  if(data.draft===true||data.draft==='true')return null;
  const fallback=path.basename(file,'.md').replace(/^\d+[- _]*/, '');
  const name=String(data.name||data.title||fallback);
  const slug=path.basename(file,'.md').toLocaleLowerCase('tr-TR').replace(/ı/g,'i').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const requestedImage=String(data.image||'').replace(/^\//,'');
  const imagePath=path.resolve('public',requestedImage);
  const validImage=requestedImage&&imagePath.startsWith(path.resolve('public')+path.sep)&&fs.existsSync(imagePath);
  const order=Number(data.order??file.match(/^\d+/)?.[0]??999);
  const imagePosition=/^\d{1,3}% \d{1,3}%$/.test(String(data.imagePosition))?String(data.imagePosition):'50% 35%';
  return {slug,name,role:String(data.role||''),age:data.age?String(data.age):'',image:validImage?requestedImage:'',imageAlt:String(data.imageAlt||`${name} portresi`),imagePosition,portraitNote:String(data.portraitNote||''),order:Number.isFinite(order)?order:999,chapter:Math.max(1,Number(data.chapter)||1),html:render(content)};
 }).filter(Boolean).sort((a,b)=>a.order-b.order||a.name.localeCompare(b.name,'tr'));
}
