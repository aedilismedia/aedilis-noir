import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import sharp from 'sharp';

// Bütün statik sayfalardaki yerel img kaynaklarını optimize eder.
// Markdown içindeki görseller de son HTML üzerinden aynı işleme girer.
export default function optimizeImages(){
 let base='/';
 return {name:'noir-local-images',hooks:{
  'astro:config:done':({config})=>{base=config.base.replace(/\/$/,'')+'/'},
  'astro:build:done':async({dir,logger})=>{
   const root=fileURLToPath(dir),cache=new Map();let count=0;
   async function optimize(src,page){
    if(/^(?:[a-z]+:|\/\/|#)/i.test(src))return src;
    const clean=decodeURIComponent(src.split(/[?#]/)[0]);
    const file=clean.startsWith('/')?path.resolve(root,clean.startsWith(base)?clean.slice(base.length):clean.slice(1)):path.resolve(path.dirname(page),clean);
    if(!file.startsWith(root)||! /\.(?:png|jpe?g|webp|avif)$/i.test(file)||file.includes('/mekan-gorselleri/')||file.includes('/_optimized/'))return src;
    if(cache.has(file))return cache.get(file);
    try{
     const input=await fs.readFile(file);const metadata=await sharp(input).metadata();
     // Animasyonlu kaynakların karelerini kaybetmemek için dönüştürülmez.
     if((metadata.pages||1)>1)return src;
     const buffer=await sharp(input).rotate().resize({width:1200,height:1200,fit:'inside',withoutEnlargement:true}).webp({quality:78,effort:4}).toBuffer();
     const hash=createHash('sha256').update(buffer).digest('hex').slice(0,20);
     await fs.mkdir(path.join(root,'_optimized'),{recursive:true});
     await fs.writeFile(path.join(root,'_optimized',hash+'.webp'),buffer);
     const url=base+'_optimized/'+hash+'.webp';cache.set(file,url);count++;return url;
    }catch(error){logger.warn(`Görsel korunarak atlandı: ${src} (${error.message})`);return src;}
   }
   async function walk(folder){
    for(const entry of await fs.readdir(folder,{withFileTypes:true})){
     const file=path.join(folder,entry.name);
     if(entry.isDirectory()){if(entry.name!=='_optimized')await walk(file);continue;}
     if(!entry.name.endsWith('.html'))continue;
     const html=await fs.readFile(file,'utf8');let output='',cursor=0;
     const pattern=/<img\b[^>]*>/gi;
     for(const match of html.matchAll(pattern)){
      let tag=match[0];const source=tag.match(/\bsrc=(['"])(.*?)\1/i);
      if(source){const url=await optimize(source[2],file);tag=tag.replace(source[0],`src=${source[1]}${url}${source[1]}`);}
      output+=html.slice(cursor,match.index)+tag;cursor=match.index+match[0].length;
     }
     output+=html.slice(cursor);if(output!==html)await fs.writeFile(file,output);
    }
   }
   await walk(root);logger.info(`${count} yerel görsel WebP olarak hazırlandı.`);
  }
 }};
}
