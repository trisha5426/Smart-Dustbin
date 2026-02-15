import React, { useEffect, useState } from 'react';
import api from '../services/api';
import LeaderboardTable from '../components/LeaderboardTable';

export default function Leaderboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get('/leaderboard');
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Community leaderboard
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Top citizens keeping the city clean
          </h1>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Ranked by total reward points from valid smart dustbin scans.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <LeaderboardTable data={data} />
      )}
    </div>
  );
}


