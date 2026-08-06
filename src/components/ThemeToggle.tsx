import { Sun, Moon } from 'lucide-react';
import type { ThemeMode } from '@/types';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isNight = theme === 'night';
  return (
    <button
      onClick={onToggle}
      aria-label={isNight ? '切换到白天模式' : '切换到黑夜模式'}
      className="relative flex h-9 w-16 items-center rounded-full border border-slate-200/80 bg-white/80 p-1 shadow-sm transition-colors dark:border-slate-700/70 dark:bg-slate-800/70"
    >
      {/* Track icons */}
      <Sun size={14} className="ml-0.5 shrink-0 text-amber-400" />
      <Moon size={14} className="ml-auto mr-0.5 shrink-0 text-slate-400 dark:text-indigo-300" />

      {/* Knob */}
      <span
        className={`absolute top-1 flex h-7 w-7 items-center justify-center rounded-full shadow-md transition-all duration-300 ${
          isNight
            ? 'left-[34px] bg-slate-800'
            : 'left-1 bg-gradient-to-br from-amber-300 to-amber-500'
        }`}
      >
        {isNight ? <Moon size={14} className="text-indigo-200" /> : <Sun size={14} className="text-white" />}
      </span>
    </button>
  );
}
