'use client';

import React, { useState } from 'react';
import { Send, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { broadcastNotification, BroadcastNotificationPayload } from '@/lib/api';
import { extractApiError } from '@/lib/api/client';
import { useToast } from '@/components/shared/Toast';

export default function NotificationsPage() {
  const { showToast } = useToast();
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [targetSegment, setTargetSegment] = useState<'ALL' | 'PREMIUM' | 'INACTIVE'>('ALL');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      showToast('Please provide both notification title and message body', 'error', 'Validation Error');
      return;
    }
    setSendError(null);
    setIsConfirming(true);
  };

  const handleSendBroadcast = async () => {
    setSending(true);
    setSendError(null);

    const payload: BroadcastNotificationPayload = {
      title,
      body,
      target_segment: targetSegment,
    };

    try {
      await broadcastNotification(payload);
      showToast(`Broadcast '${title}' sent to ${targetSegment} segment!`, 'success');
      setTitle('');
      setBody('');
      setIsConfirming(false);
    } catch (err: any) {
      const errorText = extractApiError(err, 'Broadcast failed to send — please check server connection and try again');
      setSendError(errorText);
      showToast(errorText, 'error', 'Broadcast Failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Push Notification Broadcast Composer</h2>
        <p className="text-sm text-[#B3B3B3]">Send instant real-time push announcements to platform user segments</p>
      </div>

      {sendError && (
        <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-2xl flex items-center justify-between text-sm text-red-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <p className="font-bold">Notification Delivery Failed</p>
              <p className="text-xs text-red-300/80">{sendError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Composer Card */}
      <div className="bg-[#0D0D0D] border border-[#2E2E2E] p-6 rounded-2xl shadow-xl space-y-6">
        <form onSubmit={handleOpenConfirm} className="space-y-5">
          {/* Target Audience Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-[#B3B3B3] mb-1.5 uppercase tracking-wider">
              Target Audience Segment
            </label>
            <select
              value={targetSegment}
              onChange={(e) => setTargetSegment(e.target.value as any)}
              className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-xl p-3 focus:outline-none focus:border-[#FFB300]"
            >
              <option value="ALL">All Active Users (Broad Reach)</option>
              <option value="PREMIUM">Active Subscribers Only (VIP)</option>
              <option value="INACTIVE">Inactive / Lapsed Accounts (Re-engagement)</option>
            </select>
          </div>

          {/* Title input */}
          <div>
            <label className="block text-xs font-semibold text-[#B3B3B3] mb-1.5 uppercase tracking-wider">
              Notification Title
            </label>
            <input
              type="text"
              placeholder="e.g. 🎬 New Release: Cyberpunk 2099 is Live!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-xl p-3 focus:outline-none focus:border-[#FFB300]"
            />
          </div>

          {/* Body input */}
          <div>
            <label className="block text-xs font-semibold text-[#B3B3B3] mb-1.5 uppercase tracking-wider">
              Message Body
            </label>
            <textarea
              rows={4}
              placeholder="Type your message broadcast here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-xl p-3 focus:outline-none focus:border-[#FFB300]"
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#FFB300] hover:bg-[#E5A000] text-black font-extrabold px-6 py-3 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(255,179,0,0.2)]"
            >
              <Send className="w-4 h-4" /> Review & Send Broadcast
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {isConfirming && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-[#2E2E2E] max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Confirm Irreversible Broadcast</h3>
            </div>

            <p className="text-xs text-[#B3B3B3]">
              You are about to send a push notification directly to all users in segment{' '}
              <strong className="text-white uppercase">{targetSegment}</strong>. Once triggered, this broadcast cannot be canceled.
            </p>

            <div className="bg-[#000000] border border-[#2E2E2E] p-3 rounded-xl space-y-1 text-xs">
              <p className="font-bold text-white">{title}</p>
              <p className="text-[#B3B3B3]">{body}</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsConfirming(false)}
                disabled={sending}
                className="px-4 py-2 bg-[#000000] border border-[#2E2E2E] text-white rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSendBroadcast}
                disabled={sending}
                className="px-5 py-2 bg-[#FFB300] hover:bg-[#E5A000] text-black font-bold rounded-lg text-sm flex items-center gap-2"
              >
                {sending ? 'Dispatching...' : 'Yes, Send Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
