'use client';

import { Ticket, Plus, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const sampleCoupons = [
  { id: '1', code: 'WELCOME50', discount: '50% OFF', validTill: '2026-12-31', status: 'ACTIVE', usage: '1,240' },
  { id: '2', code: 'SUMMER2026', discount: '30% OFF', validTill: '2026-09-01', status: 'ACTIVE', usage: '850' },
  { id: '3', code: 'VIPFREE', discount: '100% OFF (1 Month)', validTill: '2026-05-01', status: 'EXPIRED', usage: '5,000' },
];

export default function CouponsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Coupons & Promo Codes</h2>
          <p className="text-sm text-[#B3B3B3]">Create promotional discounts and track usage rates</p>
        </div>
        <button className="flex items-center gap-2 bg-[#FFB300] hover:bg-[#E5A000] text-black font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm">
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sampleCoupons.map((coupon) => (
          <div key={coupon.id} className="bg-[#0D0D0D] border border-[#2E2E2E] p-6 rounded-xl relative hover:border-[#FFB300] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#FFB300]/10 text-[#FFB300] border border-[#FFB300]/30">
                {coupon.discount}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                coupon.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {coupon.status}
              </span>
            </div>

            <div className="bg-[#000000] border border-[#2E2E2E] p-3 rounded-lg flex items-center justify-between mb-4">
              <span className="font-mono font-bold text-lg text-white tracking-wider">{coupon.code}</span>
              <button 
                onClick={() => copyToClipboard(coupon.code, coupon.id)}
                className="text-[#B3B3B3] hover:text-[#FFB300] p-1.5"
              >
                {copiedId === coupon.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-between text-xs text-[#B3B3B3]">
              <span>Valid till: <strong className="text-white">{coupon.validTill}</strong></span>
              <span>Used: <strong className="text-white">{coupon.usage} times</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
