'use client';

import { 
  Users, 
  Film, 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar 
} from 'recharts';

const stats = [
  { name: 'Total Users', value: '124,850', change: '+12.5%', icon: Users },
  { name: 'Active Content', value: '1,420', change: '+4.2%', icon: Film },
  { name: 'Subscriptions', value: '45,210', change: '+8.1%', icon: CreditCard },
  { name: 'Monthly Revenue', value: '$184,300', change: '+15.3%', icon: TrendingUp },
];

const viewsData = [
  { month: 'Jan', views: 4000 },
  { month: 'Feb', views: 5200 },
  { month: 'Mar', views: 6800 },
  { month: 'Apr', views: 9500 },
  { month: 'May', views: 11200 },
  { month: 'Jun', views: 14800 },
];

const subData = [
  { plan: 'Basic', count: 18000 },
  { plan: 'Premium', count: 22000 },
  { plan: 'VIP', count: 5210 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Overview Dashboard</h2>
        <p className="text-sm text-[#B3B3B3]">Real-time system stats and platform metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.name} 
              className="bg-[#0D0D0D] border border-[#2E2E2E] p-6 rounded-xl relative overflow-hidden group hover:border-[#FFB300] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#B3B3B3]">{stat.name}</span>
                <div className="w-10 h-10 rounded-lg bg-[#FFB300]/10 flex items-center justify-center text-[#FFB300]">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-white">{stat.value}</span>
                <span className="text-xs font-semibold text-emerald-400 flex items-center">
                  {stat.change} <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Views Chart */}
        <div className="lg:col-span-2 bg-[#0D0D0D] border border-[#2E2E2E] p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-1">Streaming Growth</h3>
          <p className="text-xs text-[#B3B3B3] mb-6">Total video streams played per month</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewsData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFB300" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FFB300" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#B3B3B3" fontSize={12} tickLine={false} />
                <YAxis stroke="#B3B3B3" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D0D0D', borderColor: '#2E2E2E', borderRadius: '8px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="views" stroke="#FFB300" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscription Breakdown */}
        <div className="bg-[#0D0D0D] border border-[#2E2E2E] p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-1">Active Plans</h3>
          <p className="text-xs text-[#B3B3B3] mb-6">Distribution across user tiers</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subData}>
                <XAxis dataKey="plan" stroke="#B3B3B3" fontSize={12} tickLine={false} />
                <YAxis stroke="#B3B3B3" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D0D0D', borderColor: '#2E2E2E', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#FFB300" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
