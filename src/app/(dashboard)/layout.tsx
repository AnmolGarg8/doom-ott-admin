'use client';

import React from 'react';
import { Sidebar, Header } from '@/components/shared';
import { ToastProvider } from '@/components/shared/Toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-[#000000] text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header title="Admin Portal" />
          <main className="flex-1 p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
