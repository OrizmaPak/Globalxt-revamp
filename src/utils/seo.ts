export const getSiteUrl = (): string => {
  // Prefer explicit config, fallback to current origin in browser
  const envUrl = (import.meta as any)?.env?.VITE_SITE_URL as string | undefined;
  if (envUrl && /^https?:\/\//i.test(envUrl)) return envUrl.replace(/\/$/, "");
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  // Reasonable default if running in SSR/build contexts
  return "https://globalxtltd.com";
};

export const canonicalForPath = (pathname: string): string => {
  const site = getSiteUrl();
  try {
    const url = new URL(pathname || "/", site);
    return url.toString();
  } catch {
    return `${site}${pathname?.startsWith("/") ? "" : "/"}${pathname || ""}`;
  }
};

export const stripHtml = (html?: string, maxLen = 300): string | undefined => {
  if (!html) return undefined;
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text;
};

