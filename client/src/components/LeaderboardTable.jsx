import React from 'react';

export default function LeaderboardTable({ data }) {
  return (
    <div className="glass-card overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-emerald-50/80 dark:bg-slate-900/70">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Rank
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              User
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Points
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white/60 dark:divide-slate-800 dark:bg-slate-950/40">
          {data.map((row) => {
            const isTop3 = row.rank <= 3;
            return (
              <tr
                key={row.rank + row.name}
                className={isTop3 ? 'bg-emerald-50/70 dark:bg-emerald-900/20' : ''}
              >
                <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-100">
                  {row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : row.rank === 3 ? '🥉' : row.rank}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                  {row.name}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-primary-700 dark:text-primary-300">
                  {row.totalPoints}
                </td>
              </tr>
            );
          })}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={3}
                className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                No participants yet. Be the first to earn rewards!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}


