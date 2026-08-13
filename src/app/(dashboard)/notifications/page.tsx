'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, AlertTriangle, CheckCircle, BellRing, AlertCircle } from 'lucide-react';
import { broadcastNotification } from '@/lib/api';
import { useToast } from '@/components/shared/Toast';

const broadcastSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  body: z.string().min(5, 'Body must be at least 5 characters'),
  target_segment: z.enum(['ALL', 'PREMIUM', 'INACTIVE']),
});

type BroadcastFormValues = z.infer<typeof broadcastSchema>;

export default function NotificationsPage() {
  const { showToast } = useToast();
  const [statusFeedback, setStatusFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pendingPayload, setPendingPayload] = useState<BroadcastFormValues | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BroadcastFormValues>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: {
      title: '',
      body: '',
      target_segment: 'ALL',
    },
  });

  const handlePreSubmit = (data: BroadcastFormValues) => {
    setStatusFeedback(null);
    setPendingPayload(data);
  };

  const handleConfirmBroadcast = async () => {
    if (!pendingPayload) return;
    try {
      await broadcastNotification(pendingPayload);
      const successText = `Successfully sent broadcast notification to ${pendingPayload.target_segment} segment!`;
      setStatusFeedback({ type: 'success', message: successText });
      showToast(successText, 'success', 'Broadcast Dispatched');
      reset();
    } catch (err: any) {
      const errorText = err.response?.data?.message || 'Broadcast failed to send — please check server connection and try again';
      setStatusFeedback({ type: 'error', message: errorText });
      showToast(errorText, 'error', 'Broadcast Failure');
    } finally {
      setPendingPayload(null);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Push Notification Broadcast</h2>
        <p className="text-sm text-[#B3B3B3]">Dispatch irreversible push notifications to active mobile application users</p>
      </div>

      {statusFeedback && (
        <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-3 border ${
          statusFeedback.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-red-950/40 border-red-900/50 text-red-300'
        }`}>
          {statusFeedback.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          )}
          {statusFeedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit(handlePreSubmit)} className="bg-[#0D0D0D] border border-[#2E2E2E] p-6 rounded-2xl space-y-5 shadow-xl">
        <div>
          <label className="block text-xs font-semibold text-[#B3B3B3] mb-2 uppercase tracking-wider">
            Target Segment (target_segment)
          </label>
          <select
            {...register('target_segment')}
            className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-3 focus:outline-none focus:border-[#FFB300]"
          >
            <option value="ALL">All Registered Users (ALL)</option>
            <option value="PREMIUM">Premium & VIP Subscribers Only (PREMIUM)</option>
            <option value="INACTIVE">Inactive / Churned Accounts (INACTIVE)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#B3B3B3] mb-2 uppercase tracking-wider">
            Notification Title
          </label>
          <input
            type="text"
            placeholder="e.g. 🔥 Cyberpunk 2099 is Now Streaming!"
            {...register('title')}
            className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-3 focus:outline-none focus:border-[#FFB300] placeholder:text-[#B3B3B3]"
          />
          {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#B3B3B3] mb-2 uppercase tracking-wider">
            Notification Body Message
          </label>
          <textarea
            rows={4}
            placeholder="Enter the push notification copy sent to devices..."
            {...register('body')}
            className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-3 focus:outline-none focus:border-[#FFB300] placeholder:text-[#B3B3B3]"
          />
          {errors.body && <p className="text-xs text-red-400 mt-1">{errors.body.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-[#FFB300] hover:bg-[#E5A000] text-black font-bold py-3.5 rounded-xl transition-colors text-sm shadow-[0_0_15px_rgba(255,179,0,0.2)] disabled:opacity-50"
        >
          <BellRing className="w-4 h-4" /> Send Broadcast Notification
        </button>
      </form>

      {/* CONFIRMATION MODAL */}
      {pendingPayload && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-[#2E2E2E] max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-[#FFB300]">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Confirm Push Broadcast</h3>
            </div>
            <p className="text-sm text-[#B3B3B3]">
              Are you sure you want to broadcast this message to the <strong className="text-white">{pendingPayload.target_segment}</strong> segment? 
              <span className="block mt-1 text-red-400 text-xs font-semibold">This push notification action is irreversible.</span>
            </p>
            <div className="bg-[#000000] border border-[#2E2E2E] p-3 rounded-lg text-xs space-y-1 text-[#B3B3B3]">
              <p><strong className="text-white">Title:</strong> {pendingPayload.title}</p>
              <p><strong className="text-white">Body:</strong> {pendingPayload.body}</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setPendingPayload(null)}
                className="px-4 py-2 bg-[#000000] border border-[#2E2E2E] text-white rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBroadcast}
                className="px-5 py-2 bg-[#FFB300] hover:bg-[#E5A000] text-black font-bold rounded-lg text-sm"
              >
                Confirm & Dispatch Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
