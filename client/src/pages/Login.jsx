import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading, error } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(form.email.trim(), form.password);
  };

  const fromScan = location.state?.from?.pathname?.startsWith('/scan');

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Login</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {fromScan
            ? 'Login to claim your smart dustbin scan rewards.'
            : 'Welcome back. Continue earning rewards for responsible disposal.'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass-card space-y-4 p-6"
        autoComplete="on"
        noValidate
      >
        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-medium text-slate-700 dark:text-slate-200"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-xs font-medium text-slate-700 dark:text-slate-200"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex w-full items-center justify-center disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        New to Smart Dustbin?{' '}
        <Link to="/signup" className="font-semibold text-primary-600 dark:text-primary-400">
          Create an account
        </Link>
      </p>
    </div>
  );
}


