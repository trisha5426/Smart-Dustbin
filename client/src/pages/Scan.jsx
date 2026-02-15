import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ScanSuccessAnimation from '../components/ScanSuccessAnimation';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export default function Scan() {
  const { user, loading: authLoading } = useAuth();
  const query = useQuery();
  const dustbinId = query.get('dustbinId');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // Redirect to login; on success they go to dashboard but can navigate back via QR
      navigate('/login', { replace: true, state: { from: { pathname: `/scan?dustbinId=${dustbinId || ''}` } } });
    }
  }, [authLoading, user, navigate, dustbinId]);

  useEffect(() => {
    const runScan = async () => {
      if (!user || !dustbinId) return;
      try {
        setStatus('loading');
        setMessage('');
        const res = await api.post('/scan', { dustbinId });
        setStatus('success');
        setMessage(res.data?.message || 'You earned 10 points for responsible disposal!');
      } catch (e) {
        console.error(e);
        setStatus('error');
        setMessage(
          e.response?.data?.message ||
            'Unable to record this scan right now. Please try again in a moment.'
        );
      }
    };
    runScan();
  }, [dustbinId, user]);

  if (!dustbinId) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Scan a smart dustbin
        </h1>
        <div className="glass-card space-y-3 p-5 text-sm text-slate-600 dark:text-slate-300">
          <p>This page opens automatically when you scan a QR code on a supported dustbin.</p>
          <p className="text-xs">
            Each QR code contains a unique dustbin ID like{' '}
            <span className="rounded bg-slate-900 px-1 py-0.5 font-mono text-[11px] text-slate-50">
              /scan?dustbinId=DB101
            </span>
            . Make sure you&apos;re scanning from a valid Smart Dustbin sticker.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Recording your scan
        </h1>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
          Dustbin ID: <span className="font-mono">{dustbinId}</span>
        </p>
      </div>

      {status === 'loading' && (
        <div className="glass-card flex flex-col items-center gap-3 p-6 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Verifying dustbin and adding your reward points…
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            To prevent abuse, repeated scans on the same dustbin within a short time may not be
            rewarded.
          </p>
        </div>
      )}

      {status === 'success' && <ScanSuccessAnimation message={message} />}

      {status === 'error' && (
        <div className="glass-card space-y-3 p-6 text-sm">
          <p className="font-semibold text-red-600 dark:text-red-300">Scan not rewarded</p>
          <p className="text-slate-600 dark:text-slate-300">{message}</p>
        </div>
      )}
    </div>
  );
}


