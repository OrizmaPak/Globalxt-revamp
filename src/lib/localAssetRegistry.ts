import fallbackPlaceholder from '../assets/images/placeholder.jpg';
import heroLogistics from '../assets/images/hero_logistics.jpg';
import heroQuality from '../assets/images/hero_quality.jpg';
import heroTraining from '../assets/images/hero_training.jpg';
import catSpicesHerbs from '../assets/images/cat_spices_herbs.jpg';
import catSeedsGrains from '../assets/images/cat_seeds_grains.jpg';
import catNutsMore from '../assets/images/cat_nuts_more.jpg';
import prodGinger from '../assets/images/ginger.jpg';
import prodHibiscus from '../assets/images/hibiscus.jpg';
import prodBlackStoneFlower from '../assets/images/black_stone_flower.jpg';
import prodTurmeric from '../assets/images/turmeric.jpg';
import prodRedChilli from '../assets/images/red_chilli.jpg';
import prodPepper from '../assets/images/pepper.jpg';
import prodGarlic from '../assets/images/garlic.jpg';
import prodCloves from '../assets/images/cloves.jpg';
import prodSesame from '../assets/images/sesame.jpg';
import prodPopcorn from '../assets/images/popcorn.jpg';
import prodMaizeDerivatives from '../assets/images/maize_derivatives.jpg';
import prodSheaButter from '../assets/images/shea_butter.jpg';
import prodBlackEyedBeans from '../assets/images/black_eyed_beans.jpg';
import prodPeanuts from '../assets/images/peanuts.jpg';
import prodMoringaSeeds from '../assets/images/moringa_seeds.jpg';
import prodCocoaBeans from '../assets/images/cocoa_beans.jpg';
import prodMillet from '../assets/images/millet.jpg';
import prodSoybeans from '../assets/images/soybeans.jpg';
import prodBreadfruit from '../assets/images/breadfruit.jpg';
import prodTigerNuts from '../assets/images/tiger_nuts.jpg';
import prodBitterKola from '../assets/images/bitter_kola.jpg';
import prodKolaNut from '../assets/images/kola_nut.jpg';
import prodAlmond from '../assets/images/almond.jpg';
import prodDates from '../assets/images/dates.jpg';
import prodGumArabic from '../assets/images/gum_arabic.jpg';
import prodPKO from '../assets/images/palm_kernel_oil.jpg';
import prodPeanutOil from '../assets/images/peanut_oil.jpg';
import prodPalmOil from '../assets/images/palm_oil.jpg';
import prodNaturalRubber from '../assets/images/natural_rubber.jpg';
import articleSesame from '../assets/images/article_sesame.jpg';
import articleCashew from '../assets/images/article_cashew.jpg';
import articleExports from '../assets/images/article_exports.jpg';
import siteFallbackImage from '../assets/image3.jpg';
import logo from '../assets/logo.png';

interface AssetEntry {
  key: string;
  base: string;
  ext: string;
  value: string;
}

const createAssetEntry = (name: string, value: string): AssetEntry => {
  const lower = name.toLowerCase();
  const lastDot = lower.lastIndexOf('.');
  const base = lastDot >= 0 ? lower.slice(0, lastDot) : lower;
  const ext = lastDot >= 0 ? lower.slice(lastDot) : '';
  return { key: lower, base, ext, value };
};

const assetEntries: AssetEntry[] = [
  createAssetEntry('placeholder.jpg', fallbackPlaceholder),
  createAssetEntry('hero_logistics.jpg', heroLogistics),
  createAssetEntry('hero_quality.jpg', heroQuality),
  createAssetEntry('hero_training.jpg', heroTraining),
  createAssetEntry('cat_spices_herbs.jpg', catSpicesHerbs),
  createAssetEntry('cat_seeds_grains.jpg', catSeedsGrains),
  createAssetEntry('cat_nuts_more.jpg', catNutsMore),
  createAssetEntry('ginger.jpg', prodGinger),
  createAssetEntry('hibiscus.jpg', prodHibiscus),
  createAssetEntry('black_stone_flower.jpg', prodBlackStoneFlower),
  createAssetEntry('turmeric.jpg', prodTurmeric),
  createAssetEntry('red_chilli.jpg', prodRedChilli),
  createAssetEntry('pepper.jpg', prodPepper),
  createAssetEntry('garlic.jpg', prodGarlic),
  createAssetEntry('cloves.jpg', prodCloves),
  createAssetEntry('sesame.jpg', prodSesame),
  createAssetEntry('popcorn.jpg', prodPopcorn),
  createAssetEntry('maize_derivatives.jpg', prodMaizeDerivatives),
  createAssetEntry('shea_butter.jpg', prodSheaButter),
  createAssetEntry('black_eyed_beans.jpg', prodBlackEyedBeans),
  createAssetEntry('peanuts.jpg', prodPeanuts),
  createAssetEntry('moringa_seeds.jpg', prodMoringaSeeds),
  createAssetEntry('cocoa_beans.jpg', prodCocoaBeans),
  createAssetEntry('millet.jpg', prodMillet),
  createAssetEntry('soybeans.jpg', prodSoybeans),
  createAssetEntry('breadfruit.jpg', prodBreadfruit),
  createAssetEntry('tiger_nuts.jpg', prodTigerNuts),
  createAssetEntry('bitter_kola.jpg', prodBitterKola),
  createAssetEntry('kola_nut.jpg', prodKolaNut),
  createAssetEntry('almond.jpg', prodAlmond),
  createAssetEntry('dates.jpg', prodDates),
  createAssetEntry('gum_arabic.jpg', prodGumArabic),
  createAssetEntry('palm_kernel_oil.jpg', prodPKO),
  createAssetEntry('peanut_oil.jpg', prodPeanutOil),
  createAssetEntry('palm_oil.jpg', prodPalmOil),
  createAssetEntry('natural_rubber.jpg', prodNaturalRubber),
  createAssetEntry('article_sesame.jpg', articleSesame),
  createAssetEntry('article_cashew.jpg', articleCashew),
  createAssetEntry('article_exports.jpg', articleExports),
  createAssetEntry('image3.jpg', siteFallbackImage),
  createAssetEntry('logo.png', logo),
];

const assetMap = new Map(assetEntries.map((entry) => [entry.key, entry.value]));
const extensionPattern = /\.(?:png|jpe?g|webp|svg)$/i;
const localPrefixes = ['/assets/', 'assets/', '/src/assets/', 'src/assets/'];

const extractFileName = (value: string): string | null => {
  const sanitized = value.split(/[?#]/)[0];
  const segments = sanitized.split('/');
  return segments.pop() ?? null;
};

const isLikelyLocalAssetPath = (value: string): boolean => {
  if (!extensionPattern.test(value)) return false;

  if (localPrefixes.some((prefix) => value.includes(prefix))) return true;
  if (value.startsWith('.') || value.startsWith('..')) return true;
  if (!value.startsWith('http://') && !value.startsWith('https://')) return true;

  if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
    try {
      const url = new URL(value, window.location.href);
      return url.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  return false;
};

export const resolveLocalAsset = (value: string): string => {
  if (!isLikelyLocalAssetPath(value)) return value;

  const fileName = extractFileName(value)?.toLowerCase();
  if (!fileName) return value;

  const direct = assetMap.get(fileName);
  if (direct) return direct;

  for (const entry of assetEntries) {
    if (fileName === entry.key) return entry.value;
    if (fileName.startsWith(`${entry.base}-`) && fileName.endsWith(entry.ext)) {
      return entry.value;
    }
  }

  return value;
};

export const resolveOptionalLocalAsset = <T extends string | null | undefined>(value: T): string | undefined => {
  if (typeof value !== 'string') return undefined;
  return resolveLocalAsset(value);
};
