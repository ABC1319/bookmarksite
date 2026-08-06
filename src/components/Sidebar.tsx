import { useMemo } from 'react';
import { ChevronRight, Folder, FolderOpen, Globe, Home, Bookmark as BookmarkIcon } from 'lucide-react';
import type { BookmarkNode } from '@/types';

interface SidebarProps {
  tree: BookmarkNode[];
  activeId: string | null;
  collapsed: Record<string, boolean>;
  onToggleFolder: (id: string) => void;
  onSelectCategory: (id: string | null) => void;
  stats: { total: number; folders: number };
  onClose?: () => void;
}

interface TreeNodeProps {
  node: BookmarkNode;
  depth: number;
  activeId: string | null;
  collapsed: Record<string, boolean>;
  onToggleFolder: (id: string) => void;
  onSelectCategory: (id: string | null) => void;
}

/** Count leaf bookmarks under a folder node */
function countLeaves(node: BookmarkNode): number {
  if (!node.isFolder) return 1;
  return (node.children || []).reduce((s, c) => s + countLeaves(c), 0);
}

function TreeNode({ node, depth, activeId, collapsed, onToggleFolder, onSelectCategory }: TreeNodeProps) {
  const isOpen = !collapsed[node.id];
  const isActive = activeId === node.id;
  const leafCount = useMemo(() => countLeaves(node), [node]);

  if (!node.isFolder) return null;

  const pad = 8 + depth * 14;

  return (
    <div className="select-none">
      <button
        onClick={() => {
          onToggleFolder(node.id);
          onSelectCategory(node.id);
        }}
        className={`group flex w-full items-center gap-2 rounded-lg py-2 pr-2 text-left transition-colors ${
          isActive
            ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300'
            : 'text-slate-600 hover:bg-slate-500/10 dark:text-slate-300 dark:hover:bg-slate-400/10'
        }`}
        style={{ paddingLeft: pad }}
      >
        <ChevronRight
          size={14}
          className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''} ${
            isActive ? 'text-brand-500' : 'text-slate-400'
          }`}
        />
        {isOpen ? (
          <FolderOpen size={16} className={isActive ? 'text-brand-500' : 'text-amber-500 dark:text-amber-400'} />
        ) : (
          <Folder size={16} className={isActive ? 'text-brand-500' : 'text-amber-500 dark:text-amber-400'} />
        )}
        <span className="flex-1 truncate text-sm font-medium">{node.title}</span>
        <span
          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
            isActive
              ? 'bg-brand-500/20 text-brand-600 dark:text-brand-300'
              : 'bg-slate-500/10 text-slate-400 dark:bg-slate-400/10'
          }`}
        >
          {leafCount}
        </span>
      </button>

      {isOpen && node.children && node.children.length > 0 && (
        <div className="animate-fade-in">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              activeId={activeId}
              collapsed={collapsed}
              onToggleFolder={onToggleFolder}
              onSelectCategory={onSelectCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({
  tree,
  activeId,
  collapsed,
  onToggleFolder,
  onSelectCategory,
  stats,
  onClose,
}: SidebarProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand header */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/30">
          <Globe size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold leading-tight text-slate-800 dark:text-slate-100">MarkHub</h1>
          <p className="text-[11px] leading-tight text-slate-400 dark:text-slate-500">书签导航</p>
        </div>
      </div>

      {/* All bookmarks button */}
      <div className="px-3">
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
            activeId === null
              ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300'
              : 'text-slate-600 hover:bg-slate-500/10 dark:text-slate-300 dark:hover:bg-slate-400/10'
          }`}
        >
          <Home size={16} className={activeId === null ? 'text-brand-500' : 'text-slate-400'} />
          <span className="flex-1 text-sm font-medium">全部书签</span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
              activeId === null
                ? 'bg-brand-500/20 text-brand-600 dark:text-brand-300'
                : 'bg-slate-500/10 text-slate-400 dark:bg-slate-400/10'
            }`}
          >
            {stats.total}
          </span>
        </button>
      </div>

      <div className="mx-3 my-2 border-t border-slate-200/70 dark:border-slate-700/60" />

      {/* Tree */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
        <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          分类目录
        </p>
        {tree.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            activeId={activeId}
            collapsed={collapsed}
            onToggleFolder={onToggleFolder}
            onSelectCategory={onSelectCategory}
          />
        ))}
      </nav>

      {/* Footer stats */}
      <div className="border-t border-slate-200/70 px-5 py-3 dark:border-slate-700/60">
        <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
          <BookmarkIcon size={12} />
          <span className="tabular-nums">{stats.total}</span>
          <span>个书签</span>
          <span className="mx-1">·</span>
          <Folder size={12} />
          <span className="tabular-nums">{stats.folders}</span>
          <span>个分类</span>
        </div>
      </div>

      {/* Close button for mobile */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-500/10 lg:hidden"
          aria-label="关闭"
        >
          <ChevronRight size={18} className="rotate-180" />
        </button>
      )}
    </div>
  );
}
