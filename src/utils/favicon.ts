import type { BookmarkNode } from '@/types';

const cache = new Map<string, string>();
let seq = 0;

function uid(): string {
  return `__fav_${(seq++).toString(36)}`;
}

/**
 * Get a usable favicon URL for a bookmark. Prefers an existing icon,
 * otherwise derives a Google s2 favicon URL from the bookmark's domain.
 */
export function getFavicon(node: Pick<BookmarkNode, 'url' | 'icon'>): string {
  const url = node.url || '';
  if (node.icon && node.icon.startsWith('http')) return node.icon;
  if (cache.has(url)) return cache.get(url)!;

  let fav: string;
  try {
    const u = new URL(url);
    fav = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(u.hostname)}&sz=64`;
  } catch {
    fav = '';
  }
  if (fav) cache.set(url, fav);
  return fav;
}

/**
 * A readable label for the bookmark's domain, used as fallback when no
 * favicon is available and for card subtitles.
 */
export function getDomainLabel(url?: string): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Generate a deterministic gradient class pair for fallback avatar tiles
 * when a favicon fails to load. Returns two hex colors.
 */
const gradients = [
  ['#3b82f6', '#1d4ed8'],
  ['#10b981', '#047857'],
  ['#f59e0b', '#b45309'],
  ['#ef4444', '#b91c1c'],
  ['#8b5cf6', '#6d28d9'],
  ['#06b6d4', '#0e7490'],
  ['#ec4899', '#be185d'],
  ['#14b8a6', '#0f766e'],
];

export function getGradient(url?: string): [string, string] {
  let hash = 0;
  const s = url || uid();
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return gradients[Math.abs(hash) % gradients.length] as [string, string];
}
