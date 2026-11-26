import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const a='bolumler/Bölüm 98.md',b='bolumler/Bölüm 99.md';
if(fs.existsSync(a)||fs.existsSync(b))throw Error('Kontrol için 98 ve 99 numaraları boş olmalı.');
const build=()=>execFileSync('npm',['run','build'],{stdio:'pipe',env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'}});
const read=p=>fs.readFileSync(`dist/${p}`,'utf8');
// Mevcut son gerçek bölüm (98'den küçük en büyük numara); komşu bağlantı ve sıra kontrolü buna göre yapılır.
const lastNumber=fs.readdirSync('bolumler').map(f=>f.match(/(\d+)\.md$/i)?.[1]).filter(Boolean).map(Number).filter(n=>n>=1&&n<98).sort((x,y)=>x-y).pop();
if(!lastNumber)throw Error('Kontrol için en az bir gerçek bölüm (98 öncesi numaralı) gerekir.');
const lastSlug=`bolum-${String(lastNumber).padStart(2,'0')}`;
try{
 fs.writeFileSync(a,'# Otomatik ekleme denemesi\n\nİ ı ş ğ ç ö ü. Değişmeyen özgün deneme cümlesi.\n\n---\n\n[[Yer|Görünen ad]]\n');
 fs.writeFileSync(b,'---\ntitle: "Gizli taslak denemesi"\ndraft: true\n---\n\nYayımlanmamalı.');
 build();
 const toc=read('icindekiler/index.html');const chapter=read('bolum/bolum-98/index.html');
 assert(toc.includes('Otomatik ekleme denemesi'));assert(!toc.includes('Gizli taslak denemesi'));
 assert(!fs.existsSync('dist/bolum/bolum-99/index.html'));
 assert(chapter.includes('Değişmeyen özgün deneme cümlesi.'));assert(chapter.includes('Görünen ad'));assert(!chapter.includes('[[Yer'));assert(chapter.includes('<hr'));
 assert(read(`bolum/${lastSlug}/index.html`).includes('/bolum/bolum-98/'));
 assert(read('rss.xml').includes('Otomatik ekleme denemesi'));assert(read('sitemap.xml').includes('bolum-98'));
 assert(toc.indexOf(lastSlug)<toc.indexOf('bolum-98'));
 console.log('BAŞARILI: yeni dosya, numaralı sıra, ön bilgisiz başlık, taslak gizleme, komşu bağlantı, RSS, sitemap, Obsidian, ayraç, Türkçe metin.');
}finally{fs.rmSync(a,{force:true});fs.rmSync(b,{force:true});build();}
assert(!fs.existsSync('dist/bolum/bolum-98/index.html'));
assert(!read('rss.xml').includes('Otomatik ekleme denemesi'));
console.log('BAŞARILI: silinen bölüm tüm çıktıdan kalktı; gerçek bölümlerle asıl yayın geri yüklendi.');
