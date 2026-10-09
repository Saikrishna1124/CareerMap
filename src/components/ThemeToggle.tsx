import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'compact' | 'segmented' | 'expanded';
  className?: string;
  showLabels?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'compact',
  className = '',
  showLabels = false
}) => {
  const { theme, setTheme, toggleTheme, activeDarkTheme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'segmented') {
    return (
      <div
        role="radiogroup"
        aria-label="Theme selection"
        className={`inline-flex items-center p-1 rounded-xl bg-warm-bg dark:bg-stone-950 border border-warm-border/80 dark:border-stone-800 ${className}`}
      >
        <button
          type="button"
          role="radio"
          aria-checked={!isDark}
          onClick={() => setTheme('light')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            !isDark
              ? 'bg-white dark:bg-stone-800 text-amber-700 dark:text-amber-300 shadow-sm border border-warm-border/60'
              : 'text-warm-secondary dark:text-stone-400 hover:text-warm-text dark:hover:text-stone-200'
          }`}
        >
          <Sun size={14} className={!isDark ? 'text-amber-500' : ''} />
          <span>Light</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={isDark}
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            isDark
              ? 'bg-stone-900 text-indigo-300 shadow-sm border border-stone-700'
              : 'text-warm-secondary dark:text-stone-400 hover:text-warm-text dark:hover:text-stone-200'
          }`}
        >
          <Moon size={14} className={isDark ? 'text-indigo-400' : ''} />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  if (variant === 'expanded') {
    return (
      <div
        className={`grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-warm-bg dark:bg-stone-950 border border-warm-border/80 dark:border-stone-800 ${className}`}
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`relative flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            !isDark
              ? 'bg-white text-stone-900 shadow-md border border-amber-300/40 ring-2 ring-amber-400/20'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
          }`}
        >
          <div className={`p-1.5 rounded-lg ${!isDark ? 'bg-amber-100 text-amber-600' : 'bg-stone-800 text-stone-400'}`}>
            <Sun size={16} />
          </div>
          <div className="text-left">
            <div className="font-bold">Executive Light</div>
            <div className="text-[10px] font-medium opacity-70">Clean & crisp ivory</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`relative flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            isDark
              ? 'bg-stone-900 text-white shadow-md border border-indigo-500/40 ring-2 ring-indigo-500/20'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
          }`}
        >
          <div className={`p-1.5 rounded-lg ${isDark ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/40' : 'bg-stone-100 text-stone-500'}`}>
            <Moon size={16} />
          </div>
          <div className="text-left">
            <div className="font-bold">Midnight Obsidian</div>
            <div className="text-[10px] font-medium opacity-70">Deep focused dark</div>
          </div>
        </button>
      </div>
    );
  }

  // Default compact pill switch
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-1.5 p-1 rounded-full bg-stone-100 dark:bg-stone-900/90 border border-warm-border/80 dark:border-stone-800 hover:border-brand-purple/40 transition-all cursor-pointer shadow-sm group ${className}`}
      title={`Active: ${isDark ? 'Dark Mode' : 'Light Mode'} (Click to toggle)`}
    >
      {/* Sun indicator */}
      <span
        className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 ${
          !isDark
            ? 'bg-white text-amber-600 shadow-sm scale-100'
            : 'text-stone-400 group-hover:text-amber-500 opacity-60 scale-90'
        }`}
      >
        <Sun size={13} strokeWidth={2.5} />
      </span>

      {/* Moon indicator */}
      <span
        className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 ${
          isDark
            ? 'bg-stone-800 text-indigo-300 shadow-sm scale-100 border border-indigo-500/30'
            : 'text-stone-400 group-hover:text-indigo-600 opacity-60 scale-90'
        }`}
      >
        <Moon size={13} strokeWidth={2.5} />
      </span>

      {showLabels && (
        <span className="text-[11px] font-bold px-1.5 text-warm-secondary dark:text-stone-300 select-none">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};
