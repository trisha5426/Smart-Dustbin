import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
      <p className="text-7xl font-semibold text-emerald-500">404</p>
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
        Page not found
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        The page you’re looking for doesn’t exist. Try going back to the dashboard or home.
      </p>
      <div className="flex gap-3">
        <Link to="/" className="btn-outline">
          Go home
        </Link>
        <Link to="/dashboard" className="btn-primary">
          Dashboard
        </Link>
      </div>
    </div>
  );
}


