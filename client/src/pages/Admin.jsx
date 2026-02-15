import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const { user, refetchUser, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', totalPoints: '', role: '' });

  const loadData = useCallback(async () => {
    console.log('Admin: loadData called', { user, activeTab, userRole: user?.role });
    if (!user) {
      console.log('Admin: No user object');
      setLoading(false);
      return;
    }
    if (user.role !== 'admin') {
      console.log('Admin: User role is not admin', { role: user.role });
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('Admin: Loading data for tab:', activeTab);

      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.error('Admin: Request timeout');
        setError('Request timed out. Please check your connection.');
        setLoading(false);
      }, 10000); // 10 second timeout

      let res;
      if (activeTab === 'overview') {
        res = await api.get('/admin/stats');
        console.log('Admin: Stats loaded', res.data);
        setStats(res.data);
      } else if (activeTab === 'scans') {
        res = await api.get('/admin/recent-scans?limit=100');
        console.log('Admin: Recent scans loaded', res.data.length);
        setRecentScans(res.data);
      } else if (activeTab === 'users') {
        res = await api.get('/admin/users');
        console.log('Admin: Users loaded', res.data.length);
        setAllUsers(res.data);
      } else if (activeTab === 'leaderboard') {
        res = await api.get('/admin/leaderboard');
        console.log('Admin: Leaderboard loaded', res.data.length);
        setLeaderboard(res.data);
      }
      
      clearTimeout(timeoutId);
    } catch (e) {
      console.error('Admin data load error:', e);
      const errorMsg = e.response?.data?.message || e.message || 'Unable to load data';
      console.error('Error details:', {
        status: e.response?.status,
        statusText: e.response?.statusText,
        data: e.response?.data,
        message: errorMsg,
        url: e.config?.url,
      });
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [user, activeTab]);

  useEffect(() => {
    console.log('Admin: useEffect triggered', { user, userRole: user?.role, activeTab });
    if (user && user.role === 'admin') {
      console.log('Admin: Calling loadData from useEffect');
      loadData();
    } else {
      console.log('Admin: Not calling loadData', { hasUser: !!user, role: user?.role });
      setLoading(false); // Ensure loading is false if we can't load
    }
  }, [user, activeTab, loadData]);

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/admin/users/${userId}`);
      await loadData();
      if (activeTab === 'users') {
        setAllUsers(allUsers.filter((u) => u.id !== userId));
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleEditUser = (userData) => {
    setEditingUser(userData.id);
    setEditForm({
      name: userData.name,
      email: userData.email,
      totalPoints: userData.totalPoints.toString(),
      role: userData.role,
    });
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/admin/users/${editingUser}`, {
        name: editForm.name,
        email: editForm.email,
        totalPoints: parseInt(editForm.totalPoints),
        role: editForm.role,
      });
      setEditingUser(null);
      await loadData();
      await refetchUser(); // Refresh current user if they edited themselves
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update user');
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ name: '', email: '', totalPoints: '', role: '' });
  };

  // Show loading if user is still being fetched from auth context
  if (authLoading || (user === null && !error)) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        <p className="ml-3 text-sm text-slate-600 dark:text-slate-400">Loading admin data...</p>
      </div>
    );
  }

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="mx-auto max-w-md text-sm text-slate-600 dark:text-slate-300">
        <p className="font-semibold text-slate-800 dark:text-slate-100">Admin only</p>
        <p className="mt-1">
          You need an administrator account to view Smart Dustbin usage analytics.
        </p>
        {user && user.role && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">
            Current role: {user.role}
          </p>
        )}
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'scans', label: 'Recent Scans', icon: '🔍' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  ];

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
          Admin dashboard
        </p>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          System Administration
        </h1>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
          Manage users, monitor scans, and view analytics.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setError(null); // Clear errors when switching tabs
            }}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="glass-card flex items-center justify-between p-4 text-sm text-red-600 dark:text-red-300">
          <div>
            <p className="font-semibold">Error loading data</p>
            <p className="text-xs">{error}</p>
            {error.includes('401') || error.includes('403') ? (
              <p className="mt-1 text-xs">
                Make sure you&apos;re logged in as an admin. Try logging out and back in.
              </p>
            ) : null}
          </div>
          <button
            onClick={loadData}
            className="ml-4 rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300"
          >
            Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      )}

      {/* Overview Tab */}
      {!loading && activeTab === 'overview' && (
        <>
          {stats ? (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="glass-card p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Total scans
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                    {stats.totalScans}
                  </p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Total users
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                    {stats.totalUsers}
                  </p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Active dustbins
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                    {stats.dustbinStats.length}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Dustbin usage by location
                </h2>
                <div className="glass-card space-y-3 p-4">
                  {stats.dustbinStats.map((d) => {
                    const max = Math.max(...stats.dustbinStats.map((x) => x.scans), 1);
                    const width = max ? `${(d.scans / max) * 100 || 5}%` : '5%';
                    return (
                      <div key={d.dustbinId} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-slate-700 dark:text-slate-200">
                            {d.location}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {d.scans} scans
                          </p>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200/80 dark:bg-slate-800">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400"
                            style={{ width }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card p-6 text-center text-sm text-slate-500 dark:text-slate-400">
              <p>No statistics available. Data will load automatically.</p>
            </div>
          )}
        </>
      )}

      {/* Recent Scans Tab */}
      {activeTab === 'scans' && !loading && (
        <div className="glass-card overflow-hidden">
          <div className="p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
              Recent scans across all users
            </h2>
            {recentScans.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                No scans recorded yet.
              </p>
            ) : (
              <div className="max-h-[600px] overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-emerald-50/80 dark:bg-slate-900/70 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Time
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        User
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Dustbin
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white/60 dark:divide-slate-800 dark:bg-slate-950/40">
                    {recentScans.map((scan, idx) => {
                      const date = new Date(scan.timestamp);
                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                          <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                            {date.toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-800 dark:text-slate-100">
                            <div>
                              <p className="font-medium">{scan.userName}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {scan.userEmail}
                              </p>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs font-mono text-slate-700 dark:text-slate-200">
                            {scan.dustbinId}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && !loading && (
        <div className="glass-card overflow-hidden">
          <div className="p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
              All users ({allUsers.length})
            </h2>
            {allUsers.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                No users found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-emerald-50/80 dark:bg-slate-900/70">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Name
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Email
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Points
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Scans
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Role
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white/60 dark:divide-slate-800 dark:bg-slate-950/40">
                    {allUsers.map((u) => {
                      const isEditing = editingUser === u.id;
                      const isCurrentUser = u.id === user.id;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                          {isEditing ? (
                            <>
                              <td className="whitespace-nowrap px-3 py-2">
                                <input
                                  type="text"
                                  value={editForm.name}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, name: e.target.value })
                                  }
                                  className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
                                />
                              </td>
                              <td className="whitespace-nowrap px-3 py-2">
                                <input
                                  type="email"
                                  value={editForm.email}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, email: e.target.value })
                                  }
                                  className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
                                />
                              </td>
                              <td className="whitespace-nowrap px-3 py-2">
                                <input
                                  type="number"
                                  value={editForm.totalPoints}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, totalPoints: e.target.value })
                                  }
                                  className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
                                />
                              </td>
                              <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
                                {u.scanCount}
                              </td>
                              <td className="whitespace-nowrap px-3 py-2">
                                <select
                                  value={editForm.role}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, role: e.target.value })
                                  }
                                  className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
                                >
                                  <option value="user">User</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>
                              <td className="whitespace-nowrap px-3 py-2 text-right">
                                <div className="flex justify-end gap-1">
                                  <button
                                    onClick={handleSaveEdit}
                                    className="rounded bg-primary-600 px-2 py-1 text-[11px] text-white hover:bg-primary-500"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="whitespace-nowrap px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-100">
                                {u.name}
                              </td>
                              <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                                {u.email}
                              </td>
                              <td className="whitespace-nowrap px-3 py-2 text-xs font-semibold text-primary-700 dark:text-primary-300">
                                {u.totalPoints}
                              </td>
                              <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
                                {u.scanCount}
                              </td>
                              <td className="whitespace-nowrap px-3 py-2">
                                <span
                                  className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                    u.role === 'admin'
                                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                  }`}
                                >
                                  {u.role}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-2 text-right">
                                <div className="flex justify-end gap-1">
                                  <button
                                    onClick={() => handleEditUser(u)}
                                    className="rounded bg-slate-200 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                  >
                                    Edit
                                  </button>
                                  {!isCurrentUser && (
                                    <button
                                      onClick={() => handleDeleteUser(u.id, u.name)}
                                      className="rounded bg-red-100 px-2 py-1 text-[11px] text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Leaderboard Tab */}
      {activeTab === 'leaderboard' && !loading && (
        <div className="glass-card overflow-hidden">
          <div className="p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
              Enhanced leaderboard
            </h2>
            {leaderboard.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                No users on leaderboard yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-emerald-50/80 dark:bg-slate-900/70">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Rank
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Name
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Email
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Points
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Scans
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Last Scan
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Role
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white/60 dark:divide-slate-800 dark:bg-slate-950/40">
                    {leaderboard.map((entry) => {
                      const isTop3 = entry.rank <= 3;
                      return (
                        <tr
                          key={entry.id}
                          className={
                            isTop3
                              ? 'bg-emerald-50/70 dark:bg-emerald-900/20'
                              : 'hover:bg-slate-50/80 dark:hover:bg-slate-900/40'
                          }
                        >
                          <td className="whitespace-nowrap px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-100">
                            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-100">
                            {entry.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
                            {entry.email}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-right text-xs font-semibold text-primary-700 dark:text-primary-300">
                            {entry.totalPoints}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-right text-xs text-slate-600 dark:text-slate-400">
                            {entry.scanCount}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
                            {entry.lastScan
                              ? new Date(entry.lastScan).toLocaleString()
                              : 'Never'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                entry.role === 'admin'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {entry.role}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
