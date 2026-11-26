import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import records from '../data/mekanlar.json';
import {href} from './content';
const formats=['webp','jpg','jpeg','png','avif'];
export const imageJobs=new Map();
export const places=await Promise.all(records.map(async place=>{
 const requested=typeof place.image==='string'?place.image.replace(/^\/+/, ''):'';
 const candidates=[requested,...formats.map(ext=>`mekanlar/${place.id}.${ext}`)].filter(Boolean);
 const file=candidates.find(file=>{
  const target=path.resolve('public',file);
  return target.startsWith(path.resolve('public')+path.sep)&&fs.existsSync(target)&&fs.statSync(target).isFile();
 });
 let imageUrl='',imageWidth=0,imageHeight=0;
 if(file){
  const source=path.resolve('public',file);
  try{
   // Dönüştürme derleme sırasında gerçekleşir; asıl yüklenen dosya korunur.
   const input=fs.readFileSync(source);
   const meta=await sharp(input).metadata();
   const swapped=[5,6,7,8].includes(meta.orientation);
   const width=swapped?meta.height:meta.width,height=swapped?meta.width:meta.height;
   if(!width||!height)throw new Error('Görsel boyutları okunamadı');
   const ratio=Math.min(1,1200/width,1200/height);
   imageWidth=Math.round(width*ratio);imageHeight=Math.round(height*ratio);
   const key=createHash('sha256').update(input).update('kut-webp-v1-1200-q78').digest('hex').slice(0,20);
   imageJobs.set(key,{source});
   imageUrl=href(`mekan-gorselleri/${key}.webp`);
  }catch(error){console.warn(`Mekan görseli işlenemedi: ${file}`,error.message);}
 }
 return {...place,imageUrl,imageWidth,imageHeight,imageAlt:place.imageAlt||place.title};
}));
