'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  CreditCard, 
  Ticket, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  X, 
  Monitor, 
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { 
  getAdminPlans, 
  createAdminPlan, 
  updateAdminPlan, 
  deleteAdminPlan, 
  getAdminCoupons, 
  createAdminCoupon, 
  deleteAdminCoupon, 
  Plan, 
  AdminCoupon 
} from '@/lib/api';
import { useToast } from '@/components/shared/Toast';

// Plan Schema
const planSchema = z.object({
  name: z.string().min(2, 'Plan name is required'),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  resolution: z.string().min(1, 'Resolution is required'),
  max_devices: z.coerce.number().min(1, 'At least 1 device is required'),
});

// Coupon Schema
const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters'),
  discount_percentage: z.coerce.number().min(1).max(100, 'Discount must be 1-100%'),
  usage_limit: z.coerce.number().min(1, 'Usage limit must be at least 1'),
  valid_until: z.string().min(1, 'Expiration date required'),
});

type PlanFormValues = z.infer<typeof planSchema>;
type CouponFormValues = z.infer<typeof couponSchema>;

export default function SubscriptionsPage() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Modals state
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // Form Hooks
  const {
    register: registerPlan,
    handleSubmit: handleSubmitPlan,
    reset: resetPlan,
    formState: { errors: planErrors, isSubmitting: isSubmittingPlan }
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: { name: '', price: 9.99, resolution: '1080p Full HD', max_devices: 2 }
  });

  const {
    register: registerCoupon,
    handleSubmit: handleSubmitCoupon,
    reset: resetCoupon,
    formState: { errors: couponErrors, isSubmitting: isSubmittingCoupon }
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: { code: '', discount_percentage: 20, usage_limit: 500, valid_until: '2026-12-31' }
  });

  const fetchPlansAndCoupons = async () => {
    setLoading(true);
    setFetchError(null);
    let errorCount = 0;

    try {
      const plansRes = await getAdminPlans();
      setPlans(Array.isArray(plansRes) ? plansRes : []);
    } catch (e: any) {
      errorCount++;
      setPlans([]);
    }

    try {
      const couponsRes = await getAdminCoupons();
      setCoupons(Array.isArray(couponsRes) ? couponsRes : []);
    } catch (e: any) {
      errorCount++;
      setCoupons([]);
    }

    if (errorCount > 0) {
      const msg = 'Could not load subscription plans or coupons from backend server';
      setFetchError(msg);
      showToast(msg, 'error', 'Subscription Fetch Error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlansAndCoupons();
  }, []);

  // Plan Handlers
  const handleOpenPlanModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      resetPlan({
        name: plan.name,
        price: plan.price,
        resolution: plan.resolution,
        max_devices: plan.max_devices,
      });
    } else {
      setEditingPlan(null);
      resetPlan({ name: '', price: 9.99, resolution: '1080p Full HD', max_devices: 2 });
    }
    setIsPlanModalOpen(true);
  };

  const onSavePlan = async (data: PlanFormValues) => {
    try {
      if (editingPlan) {
        await updateAdminPlan(editingPlan.id, data);
        setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? { ...p, ...data } : p)));
        showToast(`Plan '${data.name}' updated successfully`, 'success');
      } else {
        const created = await createAdminPlan(data);
        const newP: Plan = { id: created?.id || `p-${Date.now()}`, ...data, active_subscribers_count: 0 };
        setPlans((prev) => [...prev, newP]);
        showToast(`New plan '${data.name}' created`, 'success');
      }
      setIsPlanModalOpen(false);
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Failed to save subscription plan to backend server';
      showToast(msg, 'error', 'Plan Save Failed');
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await deleteAdminPlan(id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
      showToast('Plan deleted successfully', 'info');
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Failed to delete plan from backend server';
      showToast(msg, 'error', 'Delete Failed');
    }
  };

  // Coupon Handlers
  const onSaveCoupon = async (data: CouponFormValues) => {
    const payload: Partial<AdminCoupon> = {
      code: data.code.toUpperCase(),
      discount_percentage: data.discount_percentage,
      usage_limit: data.usage_limit,
      valid_until: data.valid_until,
      usage_count: 0,
      status: 'ACTIVE',
    };

    try {
      const created = await createAdminCoupon(payload);
      const newCoupon = created || ({ id: `cop-${Date.now()}`, ...payload } as AdminCoupon);
      setCoupons((prev) => [newCoupon, ...prev]);
      showToast(`Promo coupon '${payload.code}' created`, 'success');
      setIsCouponModalOpen(false);
      resetCoupon();
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Failed to create promo coupon on backend server';
      showToast(msg, 'error', 'Coupon Creation Failed');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      await deleteAdminCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      showToast('Coupon deleted successfully', 'info');
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Failed to delete coupon from backend server';
      showToast(msg, 'error', 'Delete Failed');
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="space-y-10">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Subscriptions & Coupon Management</h2>
          <p className="text-sm text-[#B3B3B3]">Manage subscription pricing tiers, maximum device limits, and promo coupons</p>
        </div>
        <button
          onClick={fetchPlansAndCoupons}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#0D0D0D] border border-[#2E2E2E] hover:border-[#FFB300] text-white rounded-lg text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#FFB300] ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {fetchError && (
        <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-2xl flex items-center justify-between text-sm text-red-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <p className="font-bold">Subscription Connection Failed</p>
              <p className="text-xs text-red-300/80">{fetchError}</p>
            </div>
          </div>
          <button
            onClick={fetchPlansAndCoupons}
            className="px-3 py-1.5 bg-red-900/50 hover:bg-red-800/60 border border-red-700/50 text-white rounded-lg text-xs font-semibold"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* SECTION 1: PLANS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#FFB300]" /> Subscription Tiers ({plans.length})
          </h3>
          <button
            onClick={() => handleOpenPlanModal()}
            className="flex items-center gap-2 bg-[#FFB300] hover:bg-[#E5A000] text-black font-bold px-4 py-2 rounded-lg text-xs"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Plan
          </button>
        </div>

        {plans.length === 0 ? (
          <div className="bg-[#0D0D0D] border border-[#2E2E2E] rounded-2xl p-8 text-center space-y-3">
            <FolderOpen className="w-8 h-8 text-[#B3B3B3] mx-auto" />
            <h4 className="text-base font-bold text-white">No Subscription Plans Configured</h4>
            <p className="text-xs text-[#B3B3B3]">Add your first pricing tier to enable customer billing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className="bg-[#0D0D0D] border border-[#2E2E2E] p-6 rounded-2xl relative hover:border-[#FFB300] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-extrabold text-white">{plan.name}</h4>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenPlanModal(plan)}
                        className="p-1.5 text-[#B3B3B3] hover:text-[#FFB300]"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-1.5 text-[#B3B3B3] hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-3xl font-black text-[#FFB300] mb-4">${plan.price.toFixed(2)}<span className="text-xs text-[#B3B3B3] font-normal">/mo</span></div>

                  <ul className="space-y-2.5 text-xs text-[#B3B3B3] mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FFB300]" /> {plan.resolution}
                    </li>
                    <li className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-[#FFB300]" /> Max Concurrent Devices: <strong className="text-white">{plan.max_devices}</strong>
                    </li>
                  </ul>
                </div>

                <div className="pt-3 border-t border-[#2E2E2E] flex justify-between text-xs text-[#B3B3B3]">
                  <span>Active Users:</span>
                  <span className="font-bold text-white">{plan.active_subscribers_count || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: COUPONS */}
      <div className="space-y-6 pt-6 border-t border-[#2E2E2E]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#FFB300]" /> Promotional Coupons ({coupons.length})
          </h3>
          <button
            onClick={() => setIsCouponModalOpen(true)}
            className="flex items-center gap-2 bg-[#FFB300] hover:bg-[#E5A000] text-black font-bold px-4 py-2 rounded-lg text-xs"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Create Coupon
          </button>
        </div>

        {coupons.length === 0 ? (
          <div className="bg-[#0D0D0D] border border-[#2E2E2E] rounded-2xl p-8 text-center space-y-3">
            <Ticket className="w-8 h-8 text-[#B3B3B3] mx-auto" />
            <h4 className="text-base font-bold text-white">No Promo Coupons Configured</h4>
            <p className="text-xs text-[#B3B3B3]">Create discount codes for marketing campaigns.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coupons.map((coupon) => {
              const usageCount = coupon.usage_count ?? coupon.usageCount ?? 0;
              const usageLimit = coupon.usage_limit || 1000;
              return (
                <div 
                  key={coupon.id} 
                  className="bg-[#0D0D0D] border border-[#2E2E2E] p-6 rounded-2xl relative hover:border-[#FFB300] transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#FFB300]/10 text-[#FFB300] border border-[#FFB300]/30">
                      {coupon.discount_percentage || coupon.discountPercentage}% OFF
                    </span>
                    <button
                      onClick={() => handleDeleteCoupon(coupon.id)}
                      className="p-1 text-[#B3B3B3] hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-[#000000] border border-[#2E2E2E] p-3 rounded-xl flex items-center justify-between mb-4">
                    <span className="font-mono font-bold text-lg text-white tracking-wider">{coupon.code}</span>
                    <button
                      onClick={() => handleCopyCode(coupon.code, coupon.id)}
                      className="text-[#B3B3B3] hover:text-[#FFB300]"
                    >
                      {copiedCodeId === coupon.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Usage Count vs Limit */}
                  <div className="space-y-1.5 text-xs text-[#B3B3B3]">
                    <div className="flex justify-between">
                      <span>Usage:</span>
                      <span className="font-bold text-white">{usageCount} / {usageLimit}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1F1F1F] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#FFB300]" 
                        style={{ width: `${Math.min(100, (usageCount / usageLimit) * 100)}%` }} 
                      />
                    </div>
                    <p className="text-[11px] text-[#B3B3B3] pt-1">
                      Valid Until: <strong className="text-white">{coupon.valid_until || coupon.validUntil || '2026-12-31'}</strong>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PLAN FORM MODAL */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-[#2E2E2E] max-w-md w-full rounded-2xl p-6 relative space-y-4">
            <button
              onClick={() => setIsPlanModalOpen(false)}
              className="absolute top-5 right-5 text-[#B3B3B3] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white">{editingPlan ? 'Edit Plan' : 'Create Subscription Plan'}</h3>

            <form onSubmit={handleSubmitPlan(onSavePlan)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#B3B3B3] mb-1">Plan Name</label>
                <input
                  type="text"
                  {...registerPlan('name')}
                  className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#FFB300]"
                />
                {planErrors.name && <p className="text-xs text-red-400 mt-1">{planErrors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B3B3B3] mb-1">Price ($ / month)</label>
                <input
                  type="number"
                  step="0.01"
                  {...registerPlan('price')}
                  className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B3B3B3] mb-1">Resolution Specs</label>
                <input
                  type="text"
                  placeholder="e.g. 4K Ultra HD"
                  {...registerPlan('resolution')}
                  className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B3B3B3] mb-1">Max Devices (max_devices)</label>
                <input
                  type="number"
                  {...registerPlan('max_devices')}
                  className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 bg-[#000000] border border-[#2E2E2E] text-white rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPlan}
                  className="px-5 py-2 bg-[#FFB300] hover:bg-[#E5A000] text-black font-bold rounded-lg text-sm"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COUPON FORM MODAL */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-[#2E2E2E] max-w-md w-full rounded-2xl p-6 relative space-y-4">
            <button
              onClick={() => setIsCouponModalOpen(false)}
              className="absolute top-5 right-5 text-[#B3B3B3] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white">Create Promo Coupon</h3>

            <form onSubmit={handleSubmitCoupon(onSaveCoupon)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#B3B3B3] mb-1">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. SPECIAL50"
                  {...registerCoupon('code')}
                  className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#FFB300] uppercase"
                />
                {couponErrors.code && <p className="text-xs text-red-400 mt-1">{couponErrors.code.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B3B3B3] mb-1">Discount Percentage (%)</label>
                <input
                  type="number"
                  {...registerCoupon('discount_percentage')}
                  className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B3B3B3] mb-1">Usage Limit (usage_limit)</label>
                <input
                  type="number"
                  {...registerCoupon('usage_limit')}
                  className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B3B3B3] mb-1">Expiration Date</label>
                <input
                  type="date"
                  {...registerCoupon('valid_until')}
                  className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 bg-[#000000] border border-[#2E2E2E] text-white rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCoupon}
                  className="px-5 py-2 bg-[#FFB300] hover:bg-[#E5A000] text-black font-bold rounded-lg text-sm"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
