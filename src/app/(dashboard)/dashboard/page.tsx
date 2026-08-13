'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
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
import { useToast } from '@/components/shared/Toast';

export default function DashboardPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<OverviewReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await getOverviewReport();
      if (res && typeof res.total_users === 'number') {
        setData(res);
      } else {
        throw new Error('Invalid overview payload format from server');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not reach server — live metrics unavailable';
      setFetchError(msg);
      showToast(msg, 'error', 'Network Connection Error');
      setData(null);
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

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Executive Dashboard</h2>
          <p className="text-sm text-[#B3B3B3]">Real-time analytics fetched directly from platform services</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="flex items-center gap-2 bg-[#0D0D0D] border border-[#2E2E2E] hover:border-[#FFB300] text-white px-3.5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-[#FFB300] ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-2xl flex items-center justify-between text-sm text-red-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <p className="font-bold">Connection Failed</p>
              <p className="text-xs text-red-300/80">{fetchError}</p>
            </div>
          </div>
          <button
            onClick={fetchOverview}
            className="px-3 py-1.5 bg-red-900/50 hover:bg-red-800/60 border border-red-700/50 text-white rounded-lg text-xs font-semibold"
          >
            Retry Connection
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
          <RefreshCw className="w-8 h-8 text-[#FFB300] animate-spin" />
          <p className="text-sm text-[#B3B3B3]">Connecting to backend reporting API...</p>
        </div>
      ) : !data ? (
        <div className="bg-[#0D0D0D] border border-[#2E2E2E] rounded-2xl p-12 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Live Metrics Available</h3>
          <p className="text-sm text-[#B3B3B3] max-w-md mx-auto">
            Unable to establish connection with the backend services. Please ensure your API server is running at {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}.
          </p>
        </div>
      ) : (
        <>
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
                <span className="text-3xl font-black text-white tracking-tight">{formatNumber(data.total_users)}</span>
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
                <span className="text-3xl font-black text-white tracking-tight">{formatNumber(data.active_subscriptions)}</span>
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
                <span className="text-3xl font-black text-[#FFB300] tracking-tight">{formatCurrency(data.revenue_this_month)}</span>
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
                    <TrendingUp className="w-5 h-5 text-[#FFB300]" /> Top Most-Watched Content
                  </h3>
                  <p className="text-xs text-[#B3B3B3]">Total views breakdown across top performing titles</p>
                </div>
              </div>

              {data.top_content && data.top_content.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.top_content.slice(0, 10)}
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
                        formatter={(value: any) => [`${formatNumber(Number(value))} streams`, 'Watch Count']}
                        contentStyle={{ 
                          backgroundColor: '#0D0D0D', 
                          borderColor: '#2E2E2E', 
                          borderRadius: '10px', 
                          color: '#fff',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.5)' 
                        }}
                      />
                      <Bar dataKey="watch_count" radius={[0, 6, 6, 0]}>
                        {data.top_content.slice(0, 10).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === 0 ? '#FFB300' : index < 3 ? '#E5A000' : '#8A6300'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-[#B3B3B3] py-12 text-center">No stream tracking data recorded yet.</p>
              )}
            </div>

            {/* Data-dense Rankings List */}
            <div className="bg-[#0D0D0D] border border-[#2E2E2E] p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight mb-1 flex items-center gap-2">
                  <Film className="w-5 h-5 text-[#FFB300]" /> Content Rankings
                </h3>
                <p className="text-xs text-[#B3B3B3] mb-4">Detailed view counts</p>

                <div className="space-y-2.5 overflow-y-auto max-h-[300px] pr-1">
                  {data.top_content && data.top_content.slice(0, 10).map((item, idx) => (
                    <div 
                      key={item.content_id || idx}
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
                        {formatNumber(item.watch_count)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
