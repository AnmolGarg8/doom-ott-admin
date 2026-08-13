'use client';

import React, { useEffect, useState } from 'react';
import { Search, Shield, Ban, CheckCircle, ChevronLeft, ChevronRight, RefreshCw, AlertTriangle } from 'lucide-react';
import { getAdminUsers, toggleBlockUser, AdminUser } from '@/lib/api';

const INITIAL_FALLBACK_USERS: AdminUser[] = [
  { id: 'u-1', name: 'Alex Mercer', email: 'alex@example.com', role: 'SUBSCRIBER', is_blocked: false, created_at: '2026-01-15' },
  { id: 'u-2', name: 'Samantha Vance', email: 'sam@example.com', role: 'SUBSCRIBER', is_blocked: false, created_at: '2026-02-10' },
  { id: 'u-3', name: 'David Miller', email: 'david@example.com', role: 'SUBSCRIBER', is_blocked: true, created_at: '2026-03-01' },
  { id: 'u-4', name: 'Elena Rostova', email: 'elena@example.com', role: 'ADMIN', is_blocked: false, created_at: '2025-11-20' },
  { id: 'u-5', name: 'Test User', email: 'testuser@doomott.com', role: 'SUBSCRIBER', is_blocked: false, created_at: '2026-04-05' },
];

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_FALLBACK_USERS);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(INITIAL_FALLBACK_USERS.length);

  // Block modal state
  const [pendingBlockUser, setPendingBlockUser] = useState<AdminUser | null>(null);

  const fetchUsersList = async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers({ search, page, limit: 10 });
      if (res && 'users' in res && Array.isArray(res.users)) {
        setUsers(res.users);
        setTotalCount(res.total || res.users.length);
      } else if (Array.isArray(res)) {
        setUsers(res);
        setTotalCount(res.length);
      }
    } catch (err) {
      console.warn('API /admin/users unreachable. Using local interactive state.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, [page, search]);

  const handleConfirmToggleBlock = async () => {
    if (!pendingBlockUser) return;
    const targetStatus = !pendingBlockUser.is_blocked;

    try {
      await toggleBlockUser(pendingBlockUser.id, targetStatus);
    } catch (err) {
      console.warn('Backend toggle block endpoint unavailable. Updating local state.');
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === pendingBlockUser.id ? { ...u, is_blocked: targetStatus } : u
      )
    );
    setPendingBlockUser(null);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">User Directory & Security</h2>
        <p className="text-sm text-[#B3B3B3]">Manage platform accounts and handle administrative block enforcement</p>
      </div>

      {/* Control bar */}
      <div className="flex justify-between items-center bg-[#0D0D0D] p-4 rounded-xl border border-[#2E2E2E]">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-[#B3B3B3] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-[#FFB300] placeholder:text-[#B3B3B3]"
          />
        </div>
        <button
          onClick={fetchUsersList}
          className="flex items-center gap-2 px-3 py-2 bg-[#000000] border border-[#2E2E2E] hover:border-[#FFB300] text-white rounded-lg text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#FFB300] ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-[#0D0D0D] border border-[#2E2E2E] rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#2E2E2E] bg-[#1F1F1F]/40 text-[#B3B3B3]">
              <th className="p-4 font-semibold">User</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Joined Date</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2E2E2E]">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-[#1F1F1F]/50 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FFB300]/10 border border-[#FFB300]/30 flex items-center justify-center font-bold text-[#FFB300]">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-[#B3B3B3]">{user.email}</p>
                  </div>
                </td>
                <td className="p-4 text-[#B3B3B3]">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#000000] border border-[#2E2E2E] text-xs font-medium">
                    {user.role === 'ADMIN' && <Shield className="w-3.5 h-3.5 text-[#FFB300]" />}
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    user.is_blocked 
                      ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {user.is_blocked ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                    {user.is_blocked ? 'BLOCKED' : 'ACTIVE'}
                  </span>
                </td>
                <td className="p-4 text-[#B3B3B3] text-xs">{user.created_at || '2026-01-01'}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => setPendingBlockUser(user)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      user.is_blocked
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                    }`}
                  >
                    {user.is_blocked ? 'Unblock User' : 'Block User'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[#2E2E2E] flex items-center justify-between text-xs text-[#B3B3B3]">
          <span>Showing {filteredUsers.length} of {totalCount} users</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded bg-[#000000] border border-[#2E2E2E] hover:text-white disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-white">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={filteredUsers.length < 10}
              className="p-1.5 rounded bg-[#000000] border border-[#2E2E2E] hover:text-white disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Block/Unblock */}
      {pendingBlockUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-[#2E2E2E] max-w-md w-full rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">
                {pendingBlockUser.is_blocked ? 'Unblock Account' : 'Confirm Block Action'}
              </h3>
            </div>
            <p className="text-sm text-[#B3B3B3]">
              Are you sure you want to {pendingBlockUser.is_blocked ? 'unblock' : 'block'} user{' '}
              <strong className="text-white">{pendingBlockUser.email}</strong>? 
              {!pendingBlockUser.is_blocked && ' This will immediately restrict their access to video streaming.'}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setPendingBlockUser(null)}
                className="px-4 py-2 bg-[#000000] border border-[#2E2E2E] text-white rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmToggleBlock}
                className={`px-4 py-2 text-white font-bold rounded-lg text-sm ${
                  pendingBlockUser.is_blocked ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {pendingBlockUser.is_blocked ? 'Confirm Unblock' : 'Confirm Block'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
