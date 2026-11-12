import { defineConfig } from 'astro/config';
export default defineConfig({output:'static',site:'https://portfolio.youkai-ou.com',trailingSlash:'always',vite:{build:{assetsInlineLimit:0}},server:{port:4321}});
