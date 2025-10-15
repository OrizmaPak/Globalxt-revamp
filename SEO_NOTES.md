SEO improvements implemented

- Per-route SEO component (`src/components/SEO.tsx`) sets title, description, canonical URLs, robots, Open Graph, and Twitter tags.
- Structured data (JSON-LD) added for:
  - Organization on Home
  - Product on product detail pages
  - Article on blog detail pages
  - BreadcrumbList on product category pages
- Default, global fallback meta is injected in `src/components/Layout.tsx`.
- `public/robots.txt` created to allow indexing and disallow /admin and /chat; it references the sitemap.
- Build-time sitemap generator (`scripts/generate-sitemap.ts`) outputs `public/sitemap.xml` for core static routes. It runs as part of `npm run build`.

Usage

- Set your public site origin in `.env` as `VITE_SITE_URL` (e.g., https://globalxtltd.com). The sitemap generator and canonical URLs use this.
- Generate the sitemap manually: `npm run sitemap` (automatically runs on `npm run build`).
- Deploy normally. Robots and sitemap are served as static files from `public`.

Notes and next steps

- This is a Vite + React SPA (no SSR). Helmet-like behavior is handled via a lightweight DOM-based SEO component; crawlers that execute JS will see full tags. For critical SEO, consider adding SSR or static pre-rendering.
- The current sitemap generator includes core pages. If you want all dynamic routes (products, categories, articles, etc.), we can either:
  - Enhance the generator to read a JSON export of slugs, or
  - Add a Vercel Function that builds a sitemap from your CMS/Firestore at request time.
- Update `public/robots.txt` sitemap URL if your domain differs.

