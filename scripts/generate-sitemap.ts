/*
  Simple sitemap generator for Vite SPA using static content sources.
  Outputs public/sitemap.xml with key routes and dynamic slugs from src/data/siteContent.ts
*/
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SITE_URL = (process.env.VITE_SITE_URL && /^https?:\/\//i.test(process.env.VITE_SITE_URL)
  ? process.env.VITE_SITE_URL
  : 'https://globalxtltd.com').replace(/\/$/, '');

const today = new Date().toISOString().split('T')[0];

type Entry = { loc: string; lastmod?: string; changefreq?: string; priority?: string };

const entries: Entry[] = [];

const add = (path: string, opts: Partial<Entry> = {}) => {
  const loc = `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  entries.push({ loc, lastmod: today, changefreq: 'weekly', priority: '0.7', ...opts });
};

// Core pages (static)
[
  '/',
  '/about',
  '/products',
  '/consulting',
  '/industries',
  '/resources',
  '/contact',
  // Legal/basic
  '/privacy',
  '/terms',
  '/sitemap',
].forEach((p) => add(p, p === '/privacy' || p === '/terms' ? { changefreq: 'yearly', priority: '0.2' } : {}));

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  entries
    .map(e =>
      [
        '  <url>',
        `    <loc>${e.loc}</loc>`,
        e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : '',
        e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : '',
        e.priority ? `    <priority>${e.priority}</priority>` : '',
        '  </url>',
      ].filter(Boolean).join('\n')
    )
    .join('\n') +
  `\n</urlset>\n`;

const outPath = resolve(process.cwd(), 'public', 'sitemap.xml');
writeFileSync(outPath, xml, 'utf8');
console.log(`✔ Wrote ${entries.length} entries to public/sitemap.xml using SITE_URL=${SITE_URL}`);
