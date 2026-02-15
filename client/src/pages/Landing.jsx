import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="flex w-full flex-col items-center justify-center gap-10 lg:flex-row">
      <section className="flex-1 space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Smart City · Waste to Rewards
        </div>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-50">
          Turn every throw into{' '}
          <span className="bg-gradient-to-r from-emerald-500 to-lime-400 bg-clip-text text-transparent">
            reward points
          </span>
          .
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Scan the QR code on any smart dustbin in your city to instantly earn points for disposing
          waste responsibly. Climb the leaderboard, unlock perks, and help keep public spaces clean.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link to={user ? '/scan?dustbinId=DB101' : '/login'} className="btn-primary">
            Scan QR &amp; Earn Points
          </Link>
          <Link to="/leaderboard" className="btn-outline">
            View Leaderboard
          </Link>
          {!user && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              New here?{' '}
              <Link to="/signup" className="font-semibold text-primary-600 dark:text-primary-400">
                Create your account
              </Link>
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-emerald-100 text-center text-[11px] leading-6 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              10
            </span>
            <span>Points for every valid scan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Protected against spam with smart cooldowns</span>
          </div>
        </div>
      </section>

      <section className="flex flex-1 justify-center lg:justify-end">
        <div className="relative w-full max-w-sm">
          <div className="glass-card relative overflow-hidden p-6">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-200/50 blur-3xl dark:bg-emerald-500/20" />
            <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-lime-200/50 blur-3xl dark:bg-lime-500/10" />

            <div className="relative space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Live Snapshot
              </p>

              <div className="rounded-xl border border-dashed border-emerald-500/40 bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-4 text-center dark:from-slate-900 dark:via-slate-950 dark:to-emerald-950/40">
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  City Smart Dustbin
                </p>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Scan QR on dustbin lid to earn rewards
                </p>
                <div className="mt-4 inline-flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <div className="mb-2 h-16 w-16 rounded-lg border border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                    <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,_#0f172a_1px,_transparent_0)] [background-size:6px_6px] dark:bg-[radial-gradient(circle_at_1px_1px,_#e5e7eb_1px,_transparent_0)]" />
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Example QR code
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-xs text-slate-100 shadow-inner dark:bg-black/70">
                <div>
                  <p className="font-semibold">Last 24 hours</p>
                  <p className="text-[11px] text-slate-300">
                    132 scans · 1.3 kg waste diverted from streets
                  </p>
                </div>
                <div className="flex h-10 items-end gap-1">
                  {[20, 32, 16, 40, 28].map((h, i) => (
                    <span
                      // eslint-disable-next-line react/no-array-index-key
                      key={i}
                      style={{ height: `${h}px` }}
                      className="w-1.5 rounded-full bg-gradient-to-t from-emerald-500 to-lime-400"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


