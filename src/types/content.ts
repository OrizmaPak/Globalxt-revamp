export interface NavItem {
  label: string;
  path: string;
  description?: string;
  children?: NavItem[];
  isExternal?: boolean;
  megaMenu?: MegaMenuColumn[];
}

export interface MegaMenuColumn {
  title: string;
  items: MegaMenuLink[];
}

export interface MegaMenuLink {
  label: string;
  path: string;
  description?: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
}

export interface ProductCategory {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  heroImage: string;
  highlights: string[];
  products: Product[];
}

export interface Product {
  slug: string;
  name: string;
  summary: string;
  description: string;
  image: string;
  /**
   * Optional gallery images. If provided, the UI will render these in the product gallery.
   * If omitted, the single `image` field will be used.
   */
  images?: string[];
  origins: string[];
  specifications: string[];
  packaging: string[];
  logistics?: string[];
  applications?: string[];
}

export interface ServiceOffering {
  slug: string;
  name: string;
  summary: string;
  details: string[];
}

export interface IndustrySegment {
  slug: string;
  name: string;
  summary: string;
  opportunities: string[];
}

export interface ResourceArticle {
  slug: string;
  title: string;
  summary: string;
  category: string;
  publishedOn: string;
  image: string;
  author: string;
  readTime: string;
  tags: string[];
  content: string; // full blog post body
}

export interface ContactChannel {
  label: string;
  value: string;
  href: string;
}

