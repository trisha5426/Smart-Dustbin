import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/70 py-4 text-xs text-slate-500 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <p>
          © {new Date().getFullYear()} Smart Dustbin Reward System · Built for cleaner cities.
        </p>
        <div className="flex items-center gap-4">
          <Link to="/leaderboard" className="hover:text-primary-500">
            Leaderboard
          </Link>
          <Link to="/dashboard" className="hover:text-primary-500">
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}


