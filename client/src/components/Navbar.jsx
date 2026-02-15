import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DarkModeToggle from './DarkModeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const linkBase =
    'text-sm font-medium text-slate-700 hover:text-primary-600 dark:text-slate-200 dark:hover:text-primary-300';

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm">
            ♻️
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Smart Dustbin
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Reward System
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-4 sm:flex">
            <NavLink to="/leaderboard" className={linkBase}>
              Leaderboard
            </NavLink>
            {user && (
              <NavLink to="/dashboard" className={linkBase}>
                Dashboard
              </NavLink>
            )}
            {user && user.role === 'admin' && (
              <NavLink to="/admin" className={linkBase}>
                Admin
              </NavLink>
            )}
          </div>

          <div className="flex items-center gap-3">
            <DarkModeToggle />
            {user ? (
              <>
                <span className="hidden text-xs text-slate-600 dark:text-slate-300 sm:inline">
                  Hi, <span className="font-semibold">{user.name}</span>
                </span>
                <button
                  onClick={logout}
                  className="btn-outline hidden text-xs sm:inline-flex"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  state={{ from: location }}
                  className="btn-outline hidden text-xs sm:inline-flex"
                >
                  Login
                </Link>
                <Link to="/signup" className="btn-primary text-xs">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}


