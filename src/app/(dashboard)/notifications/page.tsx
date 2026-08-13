'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bell, Send } from 'lucide-react';
import { useState } from 'react';

const notificationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  message: z.string().min(5, 'Message must be at least 5 characters'),
  targetUserGroup: z.enum(['ALL', 'PREMIUM', 'INACTIVE']),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function NotificationsPage() {
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      message: '',
      targetUserGroup: 'ALL',
    },
  });

  const onSubmit = async (data: NotificationFormValues) => {
    setStatusMsg(null);
    try {
      // Simulate dispatching push notification
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatusMsg(`Successfully broadcasted notification to ${data.targetUserGroup} users!`);
      reset();
    } catch (err) {
      setStatusMsg('Failed to send notification.');
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Push Notifications</h2>
        <p className="text-sm text-[#B3B3B3]">Broadcast announcements and promotional alerts to mobile users</p>
      </div>

      {statusMsg && (
        <div className="p-4 bg-[#FFB300]/10 border border-[#FFB300]/30 rounded-xl text-sm font-medium text-[#FFB300]">
          {statusMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-[#0D0D0D] border border-[#2E2E2E] p-6 rounded-xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#B3B3B3] mb-2">Target User Segment</label>
          <select 
            {...register('targetUserGroup')}
            className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-3 focus:outline-none focus:border-[#FFB300]"
          >
            <option value="ALL">All Active Users</option>
            <option value="PREMIUM">Premium & VIP Subscribers Only</option>
            <option value="INACTIVE">Inactive / Churned Subscribers</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#B3B3B3] mb-2">Notification Title</label>
          <input 
            type="text"
            placeholder="e.g. New Movie Release!"
            {...register('title')}
            className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-3 focus:outline-none focus:border-[#FFB300] placeholder:text-[#B3B3B3]"
          />
          {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#B3B3B3] mb-2">Message Body</label>
          <textarea 
            rows={4}
            placeholder="Write your push notification copy..."
            {...register('message')}
            className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-3 focus:outline-none focus:border-[#FFB300] placeholder:text-[#B3B3B3]"
          />
          {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-[#FFB300] hover:bg-[#E5A000] text-black font-semibold py-3 rounded-lg transition-colors text-sm disabled:opacity-50"
        >
          <Send className="w-4 h-4" /> {isSubmitting ? 'Dispatching...' : 'Broadcast Notification'}
        </button>
      </form>
    </div>
  );
}
