'use client';

import { Bell, Search, User as UserIcon } from 'lucide-react';

export function Header({ title }: { title: string }) {
  return (
    <header className="h-16 bg-[#0D0D0D] border-b border-[#2E2E2E] px-8 flex items-center justify-between sticky top-0 z-10">
      <h1 className="text-xl font-bold text-white capitalize">{title}</h1>
      <div className="flex items-center gap-4">
        {/* Quick Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#B3B3B3] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resources..."
            className="bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg pl-9 pr-4 py-1.5 focus:outline-none focus:border-[#FFB300] placeholder:text-[#B3B3B3] w-64"
          />
        </div>

        {/* Action icons */}
        <button className="p-2 rounded-lg bg-[#000000] border border-[#2E2E2E] text-[#B3B3B3] hover:text-[#FFB300] transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FFB300]"></span>
        </button>

        <div className="flex items-center gap-3 pl-2 border-l border-[#2E2E2E]">
          <div className="w-8 h-8 rounded-full bg-[#FFB300]/20 border border-[#FFB300] flex items-center justify-center text-[#FFB300]">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-white">Super Admin</p>
            <p className="text-[10px] text-[#B3B3B3]">admin@doomott.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}
