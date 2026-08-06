import { useEffect, useRef, useState } from 'react';
import { Search, X, Globe } from 'lucide-react';

export type SearchScope = 'site' | 'web';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  scope: SearchScope;
  onScopeChange: (s: SearchScope) => void;
  engine: string;
  onEngineChange: (e: string) => void;
  onWebSearch: (query: string) => void;
  placeholder?: string;
}

const ENGINES: { id: string; label: string; url: (q: string) => string }[] = [
  { id: 'google', label: 'Google', url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
  { id: 'bing', label: 'Bing', url: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}` },
  { id: 'baidu', label: '百度', url: (q) => `https://www.baidu.com/s?wd=${encodeURIComponent(q)}` },
];

export default function SearchBar({
  value,
  onChange,
  scope,
  onScopeChange,
  engine,
  onEngineChange,
  onWebSearch,
  placeholder,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [engineOpen, setEngineOpen] = useState(false);

  // Cmd/Ctrl+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const currentEngine = ENGINES.find((e) => e.id === engine) || ENGINES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scope === 'web' && value.trim()) {
      onWebSearch(value.trim());
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      {/* Scope toggle */}
      <div className="mb-2.5 flex items-center gap-1.5">
        <button
          onClick={() => onScopeChange('site')}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
            scope === 'site'
              ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
              : 'bg-white/70 text-slate-500 hover:bg-white dark:bg-slate-800/70 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Search size={13} />
          站内搜索
        </button>
        <button
          onClick={() => onScopeChange('web')}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
            scope === 'web'
              ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
              : 'bg-white/70 text-slate-500 hover:bg-white dark:bg-slate-800/70 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Globe size={13} />
          站外搜索
        </button>

        {/* Engine selector — only visible in web mode */}
        {scope === 'web' && (
          <div className="relative ml-auto">
            <button
              onClick={() => setEngineOpen((o) => !o)}
              className="flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-white dark:bg-slate-800/70 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              {currentEngine.label}
              <ChevronDownSmall />
            </button>
            {engineOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setEngineOpen(false)} />
                <div className="absolute right-0 z-20 mt-1 w-32 animate-scale-in overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                  {ENGINES.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => {
                        onEngineChange(e.id);
                        setEngineOpen(false);
                      }}
                      className={`flex w-full items-center px-3 py-1.5 text-left text-xs transition-colors ${
                        e.id === engine
                          ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Search input */}
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || (scope === 'site' ? '搜索书签标题或网址…' : `使用 ${currentEngine.label} 搜索全网…`)}
            className="w-full rounded-2xl border border-slate-200/80 bg-white/80 py-3 pl-11 pr-10 text-sm text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 dark:border-slate-700/70 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-500/10 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="清除"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>
      <p className="mt-1.5 hidden text-[10px] text-slate-400 sm:block dark:text-slate-500">
        按 <kbd className="rounded bg-slate-500/10 px-1 font-sans">⌘/Ctrl + K</kbd> 快速聚焦搜索框
      </p>
    </div>
  );
}

function ChevronDownSmall() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
