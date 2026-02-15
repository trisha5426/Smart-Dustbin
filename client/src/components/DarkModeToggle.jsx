import React, { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (enabled) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [enabled]);

  return (
    <button
      type="button"
      onClick={() => setEnabled((v) => !v)}
      className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white/70 px-2 py-1 text-xs font-medium text-slate-700 shadow-sm hover:border-primary-500 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:text-primary-300"
    >
      <span className="relative flex h-4 w-4 items-center justify-center">
        <span className="absolute h-4 w-4 rounded-full border border-slate-400 bg-slate-100 dark:hidden" />
        <span className="absolute hidden h-4 w-4 rounded-full border border-amber-300 bg-amber-400 dark:block" />
      </span>
      <span>{enabled ? 'Dark' : 'Light'}</span>
    </button>
  );
}


