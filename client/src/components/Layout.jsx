import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 pb-10 pt-24 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}


