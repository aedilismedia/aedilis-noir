import {absolute} from '../lib/content';
export function GET(){return new Response(`User-agent: *\nAllow: /\nSitemap: ${absolute('sitemap.xml')}\n`);}
