import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const { user, refetchUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await refetchUser();
        const res = await api.get('/leaderboard');
        setLeaderboard(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refetchUser]);

  const rank = useMemo(() => {
    if (!user || !leaderboard.length) return '-';
    const entry = leaderboard.find((u) => u.name === user.name && u.totalPoints === user.totalPoints);
    return entry?.rank ?? '-';
  }, [leaderboard, user]);

  if (!user) return null;

  const recentScans = user.scanHistory?.slice(0, 5) || [];

  return (
    <div className="flex w-full flex-col gap-6">
      {user.role === 'admin' && (
        <div className="glass-card flex items-center justify-between rounded-lg border-2 border-purple-500/30 bg-purple-50/50 p-4 dark:bg-purple-900/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                Administrator Account
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                Access the admin dashboard to manage users, view scans, and system analytics.
              </p>
            </div>
          </div>
          <Link
            to="/admin"
            className="btn-primary whitespace-nowrap text-xs"
          >
            Go to Admin Panel →
          </Link>
        </div>
      )}
      
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Your impact
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Welcome back, {user.name}
          </h1>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Track your points, rank, and recent smart dustbin scans.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total points"
          value={user.totalPoints ?? 0}
          icon="⚡"
          accent="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
        />
        <StatCard
          label="Leaderboard rank"
          value={loading ? '…' : rank}
          icon="🏆"
          accent="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
        />
        <StatCard
          label="Total scans"
          value={user.scanHistory?.length ?? 0}
          icon="🗑️"
          accent="bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Recent scans
          </h2>
          <div className="glass-card divide-y divide-slate-200/70 p-4 text-sm dark:divide-slate-800">
            {recentScans.length === 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You haven&apos;t scanned any dustbins yet. Scan a QR code on a smart dustbin to earn
                your first reward.
              </p>
            )}
            {recentScans.map((scan) => {
              const date = new Date(scan.timestamp);
              return (
                <div
                  key={scan.timestamp + scan.dustbinId}
                  className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">
                      Dustbin {scan.dustbinId}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {date.toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    +10 pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            How to earn more points
          </h2>
          <div className="glass-card space-y-3 p-4 text-xs text-slate-600 dark:text-slate-300">
            <p>
              Look for{' '}
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                Smart Dustbin
              </span>{' '}
              QR stickers on public dustbins across parks, metro stations, malls, and campuses.
            </p>
            <ul className="list-disc space-y-1 pl-4">
              <li>Scan the QR code only when you actually dispose of waste.</li>
              <li>
                You&apos;ll receive <span className="font-semibold">10 points</span> for each valid
                scan.
              </li>
              <li>
                Scanning the <span className="font-semibold">same dustbin</span> repeatedly within a
                short time won&apos;t give extra points due to cooldown protection.
              </li>
              <li>Check the leaderboard to see how you compare with other citizens.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


