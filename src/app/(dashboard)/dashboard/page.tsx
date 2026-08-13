'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  RefreshCw,
  Film,
  Eye,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell
} from 'recharts';
import { getOverviewReport, OverviewReport } from '@/lib/api';

// Fallback mock data when backend is not running
const fallbackReport: OverviewReport = {
  totalUsers: 148920,
  activeSubscriptions: 42150,
  revenueThisMonth: 184500,
  usersGrowthPercentage: 14.2,
  subscriptionsGrowthPercentage: 9.5,
  revenueGrowthPercentage: 18.4,
  topWatchedContent: [
    { id: '1', title: 'Cyberpunk 2099', views: 342100, type: 'MOVIE' },
    { id: '2', title: 'Shadow Realm: S1', views: 289400, type: 'SHOW' },
    { id: '3', title: 'Neon Velocity', views: 215600, type: 'MOVIE' },
    { id: '4', title: 'Dark Echoes: Ep 1', views: 198200, type: 'EPISODE' },
    { id: '5', title: 'Galactic Odyssey', views: 174500, type: 'MOVIE' },
    { id: '6', title: 'Abyssal Deep', views: 152000, type: 'SHOW' },
    { id: '7', title: 'Code Red Protocol', views: 139800, type: 'MOVIE' },
    { id: '8', title: 'Midnight Racer', views: 118400, type: 'MOVIE' },
    { id: '9', title: 'Chrono Rift', views: 104200, type: 'SHOW' },
    { id: '10', title: 'Vanguard Legends', views: 92300, type: 'SHOW' },
  ],
};

export default function DashboardPage() {
  const [data, setData] = useState<OverviewReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);

  const fetchOverview = async () => {
    setLoading(true);
    setIsUsingFallback(false);
    try {
      const res = await getOverviewReport();
      if (res && typeof res.totalUsers === 'number') {
        setData(res);
      } else {
        throw new Error('Invalid payload');
      }
    } catch (err) {
      console.warn('API /admin/reports/overview unreachable or returned error. Using fallback report data.');
      setData(fallbackReport);
      setIsUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-[#FFB300] animate-spin" />
        <p className="text-sm text-[#B3B3B3]">Loading authoritative platform overview...</p>
      </div>
    );
  }

  const report = data || fallbackReport;
  const top10 = report.topWatchedContent.slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Executive Dashboard</h2>
          <p className="text-sm text-[#B3B3B3]">Real-time analytics fetched directly from platform services</p>
        </div>
        <div className="flex items-center gap-3">
          {isUsingFallback && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-lg">
              <AlertCircle className="w-3.5 h-3.5" /> Dev Mode / Offline Data
            </span>
          )}
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="flex items-center gap-2 bg-[#0D0D0D] border border-[#2E2E2E] hover:border-[#FFB300] text-white px-3.5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-[#FFB300] ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Primary KPI Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Users Card */}
        <div className="bg-[#0D0D0D] border border-[#2E2E2E] p-6 rounded-2xl relative overflow-hidden group hover:border-[#FFB300] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider">Total Users</span>
            <div className="w-10 h-10 rounded-xl bg-[#FFB300]/10 flex items-center justify-center text-[#FFB300] border border-[#FFB300]/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-black text-white tracking-tight">{formatNumber(report.totalUsers)}</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              +{report.usersGrowthPercentage ?? 12.4}% <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
          <p className="text-xs text-[#B3B3B3] mt-2">Registered platform accounts</p>
        </div>

        {/* Active Subscriptions Card */}
        <div className="bg-[#0D0D0D] border border-[#2E2E2E] p-6 rounded-2xl relative overflow-hidden group hover:border-[#FFB300] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider">Active Subscriptions</span>
            <div className="w-10 h-10 rounded-xl bg-[#FFB300]/10 flex items-center justify-center text-[#FFB300] border border-[#FFB300]/20">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-black text-white tracking-tight">{formatNumber(report.activeSubscriptions)}</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              +{report.subscriptionsGrowthPercentage ?? 8.9}% <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
          <p className="text-xs text-[#B3B3B3] mt-2">Current recurring subscribers</p>
        </div>

        {/* Revenue This Month Card */}
        <div className="bg-[#0D0D0D] border border-[#2E2E2E] p-6 rounded-2xl relative overflow-hidden group hover:border-[#FFB300] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider">Revenue This Month</span>
            <div className="w-10 h-10 rounded-xl bg-[#FFB300]/10 flex items-center justify-center text-[#FFB300] border border-[#FFB300]/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-black text-[#FFB300] tracking-tight">{formatCurrency(report.revenueThisMonth)}</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              +{report.revenueGrowthPercentage ?? 15.3}% <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
          <p className="text-xs text-[#B3B3B3] mt-2">Gross subscription revenue</p>
        </div>
      </div>

      {/* Top 10 Most-Watched Content Chart & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Bar Chart */}
        <div className="lg:col-span-2 bg-[#0D0D0D] border border-[#2E2E2E] p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#FFB300]" /> Top 10 Most-Watched Content
              </h3>
              <p className="text-xs text-[#B3B3B3]">Total views breakdown across top performing titles</p>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={top10}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis 
                  type="number" 
                  stroke="#B3B3B3" 
                  fontSize={11} 
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} 
                  tickLine={false}
                />
                <YAxis 
                  dataKey="title" 
                  type="category" 
                  stroke="#FFFFFF" 
                  fontSize={11} 
                  tickLine={false}
                  width={110}
                />
                <Tooltip 
                  formatter={(value: any) => [`${formatNumber(Number(value))} streams`, 'Views']}
                  contentStyle={{ 
                    backgroundColor: '#0D0D0D', 
                    borderColor: '#2E2E2E', 
                    borderRadius: '10px', 
                    color: '#fff',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)' 
                  }}
                />
                <Bar dataKey="views" radius={[0, 6, 6, 0]}>
                  {top10.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? '#FFB300' : index < 3 ? '#E5A000' : '#8A6300'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data-dense Rankings List */}
        <div className="bg-[#0D0D0D] border border-[#2E2E2E] p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight mb-1 flex items-center gap-2">
              <Film className="w-5 h-5 text-[#FFB300]" /> Content Rankings
            </h3>
            <p className="text-xs text-[#B3B3B3] mb-4">Detailed view counts</p>

            <div className="space-y-2.5 overflow-y-auto max-h-[300px] pr-1">
              {top10.map((item, idx) => (
                <div 
                  key={item.id || idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#000000] border border-[#2E2E2E] hover:border-[#FFB300]/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-5 h-5 rounded-full text-xs font-extrabold flex items-center justify-center shrink-0 ${
                      idx === 0 ? 'bg-[#FFB300] text-black' : 'bg-[#1F1F1F] text-[#B3B3B3]'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-white truncate">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#FFB300] shrink-0 ml-2">
                    <Eye className="w-3.5 h-3.5 text-[#B3B3B3]" />
                    {formatNumber(item.views)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
