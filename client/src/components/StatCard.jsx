import React from 'react';

export default function StatCard({ label, value, icon, accent }) {
  return (
    <div className="glass-card flex flex-1 flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </p>
        {icon && (
          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${accent}`}>
            {icon}
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{value}</p>
    </div>
  );
}


