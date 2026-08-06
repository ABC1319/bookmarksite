import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import type { FlatBookmark } from '@/types';
import { getFavicon, getDomainLabel, getGradient } from '@/utils/favicon';

interface BookmarkCardProps {
  bookmark: FlatBookmark;
  index: number;
}

export default function BookmarkCard({ bookmark, index }: BookmarkCardProps) {
  const [imgError, setImgError] = useState(false);
  const fav = getFavicon(bookmark);
  const domain = getDomainLabel(bookmark.url);
  const [c1, c2] = getGradient(bookmark.url);
  const firstChar = bookmark.title.charAt(0).toUpperCase();

  return (
    <a
      href={bookmark.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group animate-fade-in relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-300/60 hover:shadow-xl hover:shadow-brand-500/10 dark:border-slate-700/70 dark:bg-slate-800/60 dark:hover:border-brand-500/40 dark:hover:shadow-brand-500/10"
      style={{ animationDelay: `${Math.min(index * 30, 400)}ms` }}
    >
      {/* Accent bar */}
      <span
        className="absolute left-0 top-0 h-full w-1 origin-top scale-y-0 transition-transform duration-300 group-hover:scale-y-100"
        style={{ background: `linear-gradient(${c1}, ${c2})` }}
      />

      <div className="flex items-start gap-3">
        {/* Favicon / avatar */}
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5">
          {!imgError && fav ? (
            <img
              src={fav}
              alt=""
              className="h-7 w-7 object-contain"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-sm font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
            >
              {firstChar}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-slate-800 transition-colors group-hover:text-brand-600 dark:text-slate-100 dark:group-hover:text-brand-300">
            {bookmark.title}
          </h3>
          <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">{domain}</p>
        </div>

        <ExternalLink
          size={15}
          className="mt-0.5 shrink-0 text-slate-300 opacity-0 transition-all duration-200 group-hover:opacity-100 dark:text-slate-600"
        />
      </div>

      {/* Folder path breadcrumb */}
      {bookmark.path.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
          {bookmark.path.map((p, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-slate-300 dark:text-slate-600">/</span>}
              <span className="rounded bg-slate-500/5 px-1.5 py-0.5 dark:bg-slate-400/10">{p}</span>
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
