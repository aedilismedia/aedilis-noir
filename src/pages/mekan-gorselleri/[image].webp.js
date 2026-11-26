import sharp from 'sharp';
import {imageJobs} from '../../lib/places';
export function getStaticPaths(){
 return [...imageJobs].map(([image,job])=>({params:{image},props:job}));
}
export async function GET({props}){
 const buffer=await sharp(props.source).rotate().resize({width:1200,height:1200,fit:'inside',withoutEnlargement:true}).webp({quality:78,effort:4}).toBuffer();
 return new Response(new Uint8Array(buffer),{headers:{'Content-Type':'image/webp'}});
}
