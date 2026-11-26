import { defineConfig } from 'astro/config';
import optimizeImages from './integrations/optimize-images.mjs';
import book from './kitap.json' with { type: 'json' };
export default defineConfig({integrations:[optimizeImages()],site:process.env.SITE_URL || book.siteUrl, base:book.base || '/', output:'static', trailingSlash:'always', server:{host:true,port:4173}});
