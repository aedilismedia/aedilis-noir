import sharp from 'sharp';
import {book,escapeXml as e} from '../lib/content';
export async function GET(){
 const size=book.title.length>22?68:110;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#181e34"/><rect x="30" y="30" width="1140" height="570" fill="none" stroke="#dfa13c" stroke-opacity=".4"/><g stroke="#dfa13c" fill="none"><circle cx="600" cy="160" r="56"/><path d="M600 105l55 55-55 55-55-55z"/><path d="M600 124v74m-20-58v25l20 16 20-16v-25" stroke-width="3"/></g><text x="600" y="345" text-anchor="middle" font-family="serif" font-size="${size}" fill="#f5e6cf">${e(book.title)}</text><text x="600" y="408" text-anchor="middle" font-family="sans-serif" font-size="22" letter-spacing="5" fill="#dfa13c">${e(book.author.toLocaleUpperCase('tr-TR'))}</text><path d="M565 447h70" stroke="#dfa13c"/><text x="600" y="505" text-anchor="middle" font-family="serif" font-size="26" fill="#a2a9be">${e(book.subtitle)}</text></svg>`;
 const png=await sharp(Buffer.from(svg)).png().toBuffer();
 return new Response(new Uint8Array(png),{headers:{'Content-Type':'image/png'}});
}
