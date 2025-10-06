import type { PageCopy } from '../data/pageCopy';
import type {
  ContactChannel,
  HeroSlide,
  IndustrySegment,
  NavItem,
  ProductCategory,
  ResourceArticle,
  ServiceOffering,
} from '../types/content';

export interface CompanyInfo {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  rcNumber: string;
  exportLicense: string;
  mapUrl: string;
  socialLinks: { label: string; href: string }[];
}

export interface WhyChooseItem {
  title: string;
  description: string;
  icon: string; // icon name
}

export interface SiteContent {
  companyInfo: CompanyInfo;
  heroSlides: HeroSlide[];
  productCategories: ProductCategory[];
  industrySegments: IndustrySegment[];
  resourceArticles: ResourceArticle[];
  serviceOfferings: ServiceOffering[];
  contactChannels: ContactChannel[];
  whyChooseUs: WhyChooseItem[];
  navItems: NavItem[];
  quickLinks: NavItem[];
  pageImages?: Record<string, string>;
  pageCopy: PageCopy;
}




