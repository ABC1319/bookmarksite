import { useEffect, useMemo, useState } from 'react';
import { Menu, Database, Sparkles } from 'lucide-react';
import type { BookmarkNode, ThemeMode, FlatBookmark } from '@/types';
import Sidebar from '@/components/Sidebar';
import BookmarkCard from '@/components/BookmarkCard';
import SearchBar, { type SearchScope } from '@/components/SearchBar';
import BackToTop from '@/components/BackToTop';
import ThemeToggle from '@/components/ThemeToggle';
import DataModal from '@/components/DataModal';
import { flattenBookmarks, countTree } from '@/utils/bookmarkParser';
import { getDomainLabel } from '@/utils/favicon';
import {
  loadBookmarks,
  saveBookmarks,
  loadTheme,
  saveTheme,
  loadEngine,
  saveEngine,
  loadCollapsed,
  saveCollapsed,
} from '@/utils/storage';
import { seedBookmarks } from '@/utils/seedData';

const ENGINES: Record<string, (q: string) => string> = {
  google: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  bing: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
  baidu: (q) => `https://www.baidu.com/s?wd=${encodeURIComponent(q)}`,
};

/** Collect all leaf bookmarks inside a given folder node (by id). Returns null for "all". */
function collectInFolder(node: BookmarkNode, id: string | null): BookmarkNode[] | null {
  if (id === null) return null;
  if (node.id === id) return node.isFolder ? node.children || [] : [node];
  if (node.children) {
    for (const c of node.children) {
      const r = collectInFolder(c, id);
      if (r) return r;
    }
  }
  return null;
}

function findFolderTitle(tree: BookmarkNode[], id: string | null): string | null {
  if (id === null) return null;
  for (const n of tree) {
    if (n.id === id) return n.title;
    if (n.children) {
      const r = findFolderTitle(n.children, id);
      if (r) return r;
    }
  }
  return null;
}

export default function App() {
  const [tree, setTree] = useState<BookmarkNode[]>(() => loadBookmarks() || seedBookmarks);
  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme());
  const [engine, setEngine] = useState<string>(() => loadEngine());
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => loadCollapsed());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<SearchScope>('site');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dataModalOpen, setDataModalOpen] = useState(false);

  // Persist
  useEffect(() => saveBookmarks(tree), [tree]);
  useEffect(() => saveTheme(theme), [theme]);
  useEffect(() => saveEngine(engine), [engine]);
  useEffect(() => saveCollapsed(collapsed), [collapsed]);

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'night') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  const stats = useMemo(() => {
    const { bookmarks, folders } = countTree(tree);
    return { total: bookmarks, folders };
  }, [tree]);

  // The set of bookmarks to display: either a specific folder subtree, or all
  const visibleTree = useMemo<BookmarkNode[]>(() => {
    if (activeId === null) return tree;
    for (const n of tree) {
      const r = collectInFolder(n, activeId);
      if (r) return r;
    }
    return tree;
  }, [tree, activeId]);

  const allFlat = useMemo(() => flattenBookmarks(visibleTree), [visibleTree]);

  // Site search filters
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allFlat;
    return allFlat.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.url?.toLowerCase().includes(q) ||
        getDomainLabel(b.url).toLowerCase().includes(q) ||
        b.path.some((p: string) => p.toLowerCase().includes(q))
    );
  }, [allFlat, search]);

  // Group filtered results by their immediate parent folder for display
  const grouped = useMemo(() => {
    const map = new Map<string, FlatBookmark[]>();
    for (const b of filtered) {
      const key = b.path[b.path.length - 1] || '未分类';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const activeFolderTitle = useMemo(() => findFolderTitle(tree, activeId), [tree, activeId]);

  const toggleTheme = () => setTheme((t) => (t === 'day' ? 'night' : 'day'));
  const toggleFolder = (id: string) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));

  const handleWebSearch = (q: string) => {
    const fn = ENGINES[engine] || ENGINES.google;
    window.open(fn(q), '_blank', 'noopener,noreferrer');
  };

  const handleImport = (nodes: BookmarkNode[], mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      setTree(nodes);
    } else {
      setTree((prev) => [...prev, ...nodes]);
    }
    setActiveId(null);
  };

  const handleClearAll = () => {
    setTree([]);
    setActiveId(null);
  };

  const isEmpty = tree.length === 0;

  return (
    <div className={`min-h-screen ${theme === 'day' ? 'bg-day' : 'bg-night'} transition-colors duration-500`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200/70 bg-white/90 backdrop-blur-md transition-transform duration-300 dark:border-slate-700/60 dark:bg-slate-900/90 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <Sidebar
          tree={tree}
          activeId={activeId}
          collapsed={collapsed}
          onToggleFolder={toggleFolder}
          onSelectCategory={(id) => {
            setActiveId(id);
            setSidebarOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          stats={stats}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/70 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/70">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-500/10 lg:hidden"
              aria-label="打开菜单"
            >
              <Menu size={20} />
            </button>

            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={setSearch}
                scope={scope}
                onScopeChange={setScope}
                engine={engine}
                onEngineChange={setEngine}
                onWebSearch={handleWebSearch}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDataModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-brand-300 hover:text-brand-600 dark:border-slate-700/70 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-brand-500 dark:hover:text-brand-300"
              >
                <Database size={14} />
                <span className="hidden sm:inline">导入 / 导出</span>
              </button>
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="px-4 py-6 sm:px-8 sm:py-8">
          {/* Heading */}
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 sm:text-2xl">
                {search.trim() && scope === 'site'
                  ? `搜索结果`
                  : activeFolderTitle
                  ? activeFolderTitle
                  : '全部书签'}
              </h2>
              <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                {search.trim() && scope === 'site'
                  ? `找到 ${filtered.length} 个匹配的书签`
                  : `共 ${filtered.length} 个书签`}
              </p>
            </div>
          </div>

          {isEmpty ? (
            <EmptyState onOpenModal={() => setDataModalOpen(true)} />
          ) : filtered.length === 0 ? (
            <NoResults query={search} scope={scope} onWebSearch={handleWebSearch} />
          ) : (
            <div className="space-y-8">
              {grouped.map(([groupName, items]) => (
                <section key={groupName}>
                  <div className="mb-3 flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{groupName}</h3>
                    <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] font-semibold text-slate-400 dark:bg-slate-400/10">
                      {items.length}
                    </span>
                    <div className="ml-2 h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700" />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.map((b, i) => (
                      <BookmarkCard key={b.id} bookmark={b} index={i} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* Web search hint when in web mode with no site results needed */}
          {scope === 'web' && search.trim() && (
            <WebSearchPanel query={search} engine={engine} onSearch={handleWebSearch} />
          )}
        </main>
      </div>

      <BackToTop />
      <DataModal
        open={dataModalOpen}
        onClose={() => setDataModalOpen(false)}
        tree={tree}
        onImport={handleImport}
        onClearAll={handleClearAll}
      />
    </div>
  );
}

function EmptyState({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 py-16 text-center dark:border-slate-700 dark:bg-slate-800/30">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/30">
        <Sparkles size={26} className="text-white" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">还没有任何书签</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-400 dark:text-slate-500">
        从浏览器导出书签 HTML 文件，然后导入到这里，即可生成你的专属导航页。
      </p>
      <button
        onClick={onOpenModal}
        className="mt-5 flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/30 transition-colors hover:bg-brand-600"
      >
        <Database size={16} />
        立即导入书签
      </button>
    </div>
  );
}

function NoResults({
  query,
  scope,
  onWebSearch,
}: {
  query: string;
  scope: SearchScope;
  onWebSearch: (q: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 py-14 text-center dark:border-slate-700 dark:bg-slate-800/30">
      <p className="text-sm text-slate-400 dark:text-slate-500">
        没有找到与「<span className="font-medium text-slate-600 dark:text-slate-300">{query}</span>」匹配的书签
      </p>
      {scope === 'site' && (
        <button
          onClick={() => onWebSearch(query)}
          className="mt-4 rounded-xl border border-brand-300 bg-brand-50/50 px-4 py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:border-brand-700 dark:bg-brand-900/20 dark:text-brand-300 dark:hover:bg-brand-900/30"
        >
          改用搜索引擎查找「{query}」
        </button>
      )}
    </div>
  );
}

function WebSearchPanel({
  query,
  engine,
  onSearch,
}: {
  query: string;
  engine: string;
  onSearch: (q: string) => void;
}) {
  const engineLabel = engine === 'baidu' ? '百度' : engine === 'bing' ? 'Bing' : 'Google';
  return (
    <div className="mt-6 flex items-center justify-between rounded-2xl border border-brand-200 bg-brand-50/50 px-5 py-4 dark:border-brand-800/50 dark:bg-brand-900/20">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        即将使用 <span className="font-semibold text-brand-600 dark:text-brand-300">{engineLabel}</span> 搜索「{query}」
      </p>
      <button
        onClick={() => onSearch(query)}
        className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/30 transition-colors hover:bg-brand-600"
      >
        前往搜索
      </button>
    </div>
  );
}
