import { resolveLocalAsset } from './localAssetRegistry';

const assetExtensionPattern = /\.(?:png|jpe?g|webp|svg)$/i;

type UnknownRecord = Record<string, unknown>;

const isPlainObject = (value: unknown): value is UnknownRecord => {
  return (
    typeof value === 'object' &&
    value !== null &&
    ((value as { constructor?: unknown }).constructor === Object || Object.getPrototypeOf(value) === null)
  );
};

const normalizeValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (isPlainObject(value)) {
    const result: UnknownRecord = {};
    for (const [key, nested] of Object.entries(value)) {
      result[key] = normalizeValue(nested);
    }
    return result;
  }

  if (typeof value === 'string' && assetExtensionPattern.test(value)) {
    return resolveLocalAsset(value);
  }

  return value;
};

export const normalizeContentAssets = <T>(data: T): T => normalizeValue(data) as T;
