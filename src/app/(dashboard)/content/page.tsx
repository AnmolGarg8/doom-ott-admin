'use client';

import { useState } from 'react';
import { Film, Plus, Search, Filter } from 'lucide-react';

const sampleContent = [
  { id: '1', title: 'Cyberpunk 2099', type: 'MOVIE', genre: 'Sci-Fi', views: '245.2K', rating: 4.8, status: 'PUBLISHED' },
  { id: '2', title: 'Shadow Realm: Season 1', type: 'SHOW', genre: 'Fantasy', views: '512.8K', rating: 4.9, status: 'PUBLISHED' },
  { id: '3', title: 'Midnight Racer', type: 'MOVIE', genre: 'Action', views: '89.1K', rating: 4.2, status: 'DRAFT' },
  { id: '4', title: 'Dark Echoes', type: 'SHOW', genre: 'Horror', views: '14.5K', rating: 3.9, status: 'ARCHIVED' },
];

export default function ContentPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Content Management</h2>
          <p className="text-sm text-[#B3B3B3]">Manage movies, TV shows, and streaming catalog</p>
        </div>
        <button className="flex items-center gap-2 bg-[#FFB300] hover:bg-[#E5A000] text-black font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm">
          <Plus className="w-4 h-4" /> Add New Content
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-[#0D0D0D] p-4 rounded-xl border border-[#2E2E2E]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#B3B3B3] absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search titles or genres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-[#FFB300] placeholder:text-[#B3B3B3]"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#000000] border border-[#2E2E2E] text-[#B3B3B3] hover:text-white rounded-lg text-sm">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0D0D0D] border border-[#2E2E2E] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#2E2E2E] bg-[#1F1F1F]/40 text-[#B3B3B3]">
              <th className="p-4 font-semibold">Title</th>
              <th className="p-4 font-semibold">Type</th>
              <th className="p-4 font-semibold">Genre</th>
              <th className="p-4 font-semibold">Views</th>
              <th className="p-4 font-semibold">Rating</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2E2E2E]">
            {sampleContent.map((item) => (
              <tr key={item.id} className="hover:bg-[#1F1F1F]/50 transition-colors">
                <td className="p-4 font-medium text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#FFB300]/10 flex items-center justify-center text-[#FFB300]">
                    <Film className="w-4 h-4" />
                  </div>
                  {item.title}
                </td>
                <td className="p-4 text-[#B3B3B3]">{item.type}</td>
                <td className="p-4 text-[#B3B3B3]">{item.genre}</td>
                <td className="p-4 text-[#B3B3B3]">{item.views}</td>
                <td className="p-4 text-[#FFB300] font-semibold">★ {item.rating}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    item.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    item.status === 'DRAFT' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
