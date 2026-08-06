import type { BookmarkNode, ThemeMode } from '@/types';

const BOOKMARKS_KEY = 'markhub:bookmarks';
const THEME_KEY = 'markhub:theme';
const ENGINE_KEY = 'markhub:engine';
const COLLAPSED_KEY = 'markhub:collapsed';

export function loadBookmarks(): BookmarkNode[] | null {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as BookmarkNode[];
  } catch {
    return null;
  }
}

export function saveBookmarks(nodes: BookmarkNode[]): void {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(nodes));
  } catch {
    /* ignore quota errors */
  }
}

export function loadTheme(): ThemeMode {
  const t = localStorage.getItem(THEME_KEY);
  if (t === 'day' || t === 'night') return t;
  // default to system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'night';
  }
  return 'day';
}

export function saveTheme(theme: ThemeMode): void {
  localStorage.setItem(THEME_KEY, theme);
}

export function loadEngine(): string {
  return localStorage.getItem(ENGINE_KEY) || 'google';
}

export function saveEngine(engine: string): void {
  localStorage.setItem(ENGINE_KEY, engine);
}

export function loadCollapsed(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(COLLAPSED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCollapsed(map: Record<string, boolean>): void {
  try {
    localStorage.setItem(COLLAPSED_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}
