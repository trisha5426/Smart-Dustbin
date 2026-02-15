import React from 'react';

export default function ScanSuccessAnimation({ message }) {
  return (
    <div className="glass-card mx-auto flex max-w-md flex-col items-center gap-4 p-6 text-center">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute h-20 w-20 animate-ping rounded-full bg-emerald-400/30" />
        <div className="absolute h-16 w-16 animate-pulse rounded-full bg-emerald-500/80 shadow-lg" />
        <span className="relative text-3xl">🎉</span>
      </div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
        Points Added!
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
      <p className="text-xs text-emerald-600 dark:text-emerald-300">
        Thank you for disposing waste responsibly. Every scan keeps your city cleaner.
      </p>
    </div>
  );
}


