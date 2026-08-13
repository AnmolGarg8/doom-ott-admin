'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Film, 
  Users, 
  CreditCard, 
  Ticket, 
  Bell, 
  LogOut,
  Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Content', href: '/content', icon: Film },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
  { name: 'Coupons', href: '/coupons', icon: Ticket },
  { name: 'Notifications', href: '/notifications', icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/set-cookie', { method: 'DELETE' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <aside className="w-64 bg-[#0D0D0D] border-r border-[#2E2E2E] flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-[#2E2E2E]">
          <div className="w-9 h-9 rounded-lg bg-[#FFB300] flex items-center justify-center text-black font-bold text-xl shadow-[0_0_12px_rgba(255,179,0,0.4)]">
            <Flame className="w-5 h-5 fill-black" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide text-lg">DOOM OTT</h1>
            <p className="text-xs text-[#FFB300] font-medium tracking-wider uppercase">Admin Portal</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[#FFB300] text-black font-semibold shadow-[0_0_15px_rgba(255,179,0,0.3)]'
                    : 'text-[#B3B3B3] hover:text-white hover:bg-[#1F1F1F]'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive ? 'text-black' : 'text-[#B3B3B3]')} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-[#2E2E2E]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-[#1F1F1F] transition-all duration-200"
        >
          <LogOut className="w-5 h-5 text-red-400" />
          Logout
        </button>
      </div>
    </aside>
  );
}
