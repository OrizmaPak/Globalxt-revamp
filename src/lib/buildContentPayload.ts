import * as local from '../data/siteContent';
import defaultHeroImage from '../assets/image3.jpg';
import type { SiteContent } from './contentTypes';

export type CloudinaryMap = Record<string, string>;

const normalizeMap = (mapObj: CloudinaryMap | undefined) => {
  const out = new Map<string, string>();
  if (!mapObj) return out;
  Object.entries(mapObj).forEach(([k, v]) => out.set(k.toLowerCase(), v));
  return out;
};

const tryMap = (src: string, map: Map<string, string>): string => {
  try {
    const url = new URL(src, window.location.origin);
    const file = url.pathname.split('/').pop() ?? src;
    const key = file.toLowerCase();
    return map.get(key) ?? '';
  } catch {
    const file = src.split('/').pop() ?? src;
    return map.get(file.toLowerCase()) ?? '';
  }
};

export const buildContentPayload = (cloudMap?: CloudinaryMap): SiteContent => {
  // Optional import of mapping via Vite glob (works in browser) or direct param
  const map = normalizeMap(cloudMap);

  const companyInfo = (local as any).companyInfo;
  const heroSlides = (local as any).heroSlides.map((s: any) => ({
    ...s,
    image: tryMap(s.image, map) || s.image,
  }));
  const productCategories = (local as any).productCategories.map((c: any) => ({
    ...c,
    heroImage: tryMap(c.heroImage, map) || c.heroImage,
    products: c.products.map((p: any) => {
      const mappedImage = tryMap(p.image, map) || p.image;
      const mappedImages = Array.isArray(p.images) && p.images.length
        ? p.images.map((img: string) => tryMap(img, map) || img)
        : undefined;
      return {
        ...p,
        image: mappedImage,
        ...(mappedImages ? { images: mappedImages } : {}),
      };
    }),
  }));
  const industrySegments = (local as any).industrySegments;
  const resourceArticles = (local as any).resourceArticles.map((a: any) => ({
    ...a,
    image: tryMap(a.image, map) || a.image,
  }));
  const serviceOfferings = (local as any).serviceOfferings;
  const contactChannels = (local as any).contactChannels;
  const whyChooseUs = (local as any).whyChooseUs;
  const navItems = (local as any).navItems;
  const quickLinks = (local as any).quickLinks;
  const pageImages = {
    defaultHero: tryMap(defaultHeroImage as unknown as string, map) || (defaultHeroImage as unknown as string),
  } as Record<string, string>;
  const pageCopy = (local as any).pageCopy;

  return {
    companyInfo,
    heroSlides,
    productCategories,
    industrySegments,
    resourceArticles,
    serviceOfferings,
    contactChannels,
    whyChooseUs,
    navItems,
    quickLinks,
    pageImages,
    pageCopy,
  } as SiteContent;
};

