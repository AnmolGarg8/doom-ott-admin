'use client';

import { Users as UsersIcon, Search, Shield, MoreVertical } from 'lucide-react';

const sampleUsers = [
  { id: '1', name: 'Alex Mercer', email: 'alex@example.com', role: 'SUBSCRIBER', plan: 'PREMIUM', status: 'ACTIVE' },
  { id: '2', name: 'Samantha Vance', email: 'sam@example.com', role: 'SUBSCRIBER', plan: 'VIP', status: 'ACTIVE' },
  { id: '3', name: 'David Miller', email: 'david@example.com', role: 'SUBSCRIBER', plan: 'BASIC', status: 'INACTIVE' },
  { id: '4', name: 'Elena Rostova', email: 'elena@example.com', role: 'ADMIN', plan: 'VIP', status: 'ACTIVE' },
];

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Users Management</h2>
        <p className="text-sm text-[#B3B3B3]">Manage platform users, roles, and access statuses</p>
      </div>

      <div className="flex justify-between items-center bg-[#0D0D0D] p-4 rounded-xl border border-[#2E2E2E]">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-[#B3B3B3] absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search users..."
            className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-[#FFB300] placeholder:text-[#B3B3B3]"
          />
        </div>
      </div>

      <div className="bg-[#0D0D0D] border border-[#2E2E2E] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#2E2E2E] bg-[#1F1F1F]/40 text-[#B3B3B3]">
              <th className="p-4 font-semibold">User</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Plan Tiers</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2E2E2E]">
            {sampleUsers.map((user) => (
              <tr key={user.id} className="hover:bg-[#1F1F1F]/50 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FFB300]/20 border border-[#FFB300]/40 flex items-center justify-center font-bold text-[#FFB300]">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-[#B3B3B3]">{user.email}</p>
                  </div>
                </td>
                <td className="p-4 text-[#B3B3B3]">
                  <span className="flex items-center gap-1.5">
                    {user.role === 'ADMIN' && <Shield className="w-3.5 h-3.5 text-[#FFB300]" />}
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className="bg-[#1F1F1F] text-[#FFB300] text-xs font-semibold px-2.5 py-1 rounded border border-[#2E2E2E]">
                    {user.plan}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    user.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="p-2 hover:bg-[#1F1F1F] text-[#B3B3B3] hover:text-white rounded-lg">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
