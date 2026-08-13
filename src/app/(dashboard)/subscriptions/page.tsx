'use client';

import { CreditCard, CheckCircle2, Clock } from 'lucide-react';

const plans = [
  { id: '1', name: 'Basic Plan', price: '$9.99/mo', resolution: '1080p Full HD', screens: 1, activeUsers: '18,400' },
  { id: '2', name: 'Premium Tier', price: '$15.99/mo', resolution: '4K Ultra HD + HDR', screens: 4, activeUsers: '22,100' },
  { id: '3', name: 'VIP Ultra', price: '$24.99/mo', resolution: '8K IMAX + Spatial Audio', screens: 8, activeUsers: '5,210' },
];

export default function SubscriptionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Subscription Plans & Billing</h2>
        <p className="text-sm text-[#B3B3B3]">Manage subscription pricing, perks, and customer billing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-[#0D0D0D] border border-[#2E2E2E] p-6 rounded-xl relative hover:border-[#FFB300] transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <CreditCard className="w-5 h-5 text-[#FFB300]" />
              </div>
              <p className="text-3xl font-extrabold text-[#FFB300] mb-6">{plan.price}</p>
              
              <ul className="space-y-3 mb-6 text-sm text-[#B3B3B3]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FFB300]" /> {plan.resolution}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FFB300]" /> Up to {plan.screens} concurrent screens
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FFB300]" /> Cancel anytime
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-[#2E2E2E]">
              <p className="text-xs text-[#B3B3B3] mb-3">Active Subscribers: <span className="text-white font-semibold">{plan.activeUsers}</span></p>
              <button className="w-full bg-[#1F1F1F] hover:bg-[#FFB300] hover:text-black text-white font-semibold py-2 rounded-lg transition-all text-sm border border-[#2E2E2E]">
                Edit Plan Specs
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
