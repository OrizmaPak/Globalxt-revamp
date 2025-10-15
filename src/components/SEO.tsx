import React, { useEffect } from 'react';
import { canonicalForPath, getSiteUrl } from '../utils/seo';

type SEOProps = {
  title?: string;
  description?: string;
  image?: string;
  pathname?: string;
  canonical?: string;
  noindex?: boolean;
  locale?: string; // e.g. en_NG
  type?: 'website' | 'article' | 'product';
  structuredData?: Record<string, any> | Record<string, any>[];
};

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image,
  pathname,
  canonical,
  noindex,
  locale = 'en_NG',
  type = 'website',
  structuredData,
}) => {
  const siteUrl = getSiteUrl();
  const url = canonical || canonicalForPath(pathname || (typeof window !== 'undefined' ? window.location.pathname : '/'));

  const ogImage = image || `${siteUrl}/favicon.png`;
  const metaTitle = title || 'Global XT Limited';
  const metaDesc = description || "Global XT Limited exports premium African agro commodities and provides export consulting, training, and brokerage services.";

  const jsonLdArray = Array.isArray(structuredData) ? structuredData : structuredData ? [structuredData] : [];

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Title
    document.title = metaTitle;

    // Helper to upsert meta tags
    const upsertMeta = (selector: string, attrs: Record<string, string>) => {
      let el = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
        document.head.appendChild(el);
      } else {
        Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
      }
      return el;
    };

    const metas: (HTMLElement | null)[] = [];
    metas.push(upsertMeta('meta[name="description"]', { name: 'description', content: metaDesc }));
    metas.push(upsertMeta('meta[name="robots"]', { name: 'robots', content: noindex ? 'noindex, nofollow' : 'index, follow' }));

    // Canonical link
    let linkCanonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', url);

    // Open Graph
    metas.push(upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type } as any));
    metas.push(upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'Global XT Limited' } as any));
    metas.push(upsertMeta('meta[property="og:title"]', { property: 'og:title', content: metaTitle } as any));
    metas.push(upsertMeta('meta[property="og:description"]', { property: 'og:description', content: metaDesc } as any));
    metas.push(upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url } as any));
    metas.push(upsertMeta('meta[property="og:image"]', { property: 'og:image', content: ogImage } as any));
    metas.push(upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: locale } as any));

    // Twitter
    metas.push(upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' }));
    metas.push(upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: metaTitle }));
    metas.push(upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: metaDesc }));
    metas.push(upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: ogImage }));

    // JSON-LD: remove existing inserted by this component, then add fresh
    const existingLd = Array.from(document.head.querySelectorAll('script[data-seo-jsonld="true"]'));
    existingLd.forEach((el) => el.parentElement?.removeChild(el));
    jsonLdArray.forEach((obj) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-jsonld', 'true');
      script.text = JSON.stringify(obj);
      document.head.appendChild(script);
    });

    // Cleanup function only removes JSON-LD we added (meta tags persist for performance and consistency)
    return () => {
      const ld = Array.from(document.head.querySelectorAll('script[data-seo-jsonld="true"]'));
      ld.forEach((el) => el.parentElement?.removeChild(el));
    };
  }, [metaTitle, metaDesc, ogImage, url, noindex, locale, type, JSON.stringify(jsonLdArray)]);

  return null;
};

export default SEO;
