import { apiClient } from './client';
import axios from 'axios';

export interface OverviewReport {
  totalUsers: number;
  activeSubscriptions: number;
  revenueThisMonth: number;
  usersGrowthPercentage?: number;
  subscriptionsGrowthPercentage?: number;
  revenueGrowthPercentage?: number;
  topWatchedContent: {
    id: string;
    title: string;
    views: number;
    type?: string;
  }[];
}

export interface VideoAsset {
  id: string;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  videoUrl?: string;
  progress?: number;
}

export interface ContentItem {
  id: string;
  title: string;
  type: 'MOVIE' | 'SHOW' | 'EPISODE';
  synopsis?: string;
  cast?: string[];
  genre?: string[] | string;
  language?: string;
  content_rating?: string;
  release_year?: number;
  duration_minutes?: number;
  duration_seconds?: number;
  poster_url?: string;
  backdrop_url?: string;
  views?: number;
  rating?: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  video_asset?: VideoAsset;
  createdAt?: string;
}

export interface VideoUploadResponse {
  upload_url: string;
  asset_id: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface Subscription {
  id: string;
  userEmail: string;
  plan: 'BASIC' | 'PREMIUM' | 'VIP';
  amount: number;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  startDate: string;
  endDate: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  validUntil: string;
  usageCount: number;
  status: 'ACTIVE' | 'EXPIRED';
}

export interface NotificationPayload {
  title: string;
  message: string;
  targetUserGroup: 'ALL' | 'PREMIUM' | 'INACTIVE';
}

// Reports API
export const getOverviewReport = async () => (await apiClient.get<OverviewReport>('/admin/reports/overview')).data;

// Content Management API
export const getAdminContent = async (params?: { status?: string; type?: string }) => 
  (await apiClient.get<ContentItem[]>('/admin/content', { params })).data;

export const createAdminContent = async (data: Partial<ContentItem>) => 
  (await apiClient.post<ContentItem>('/admin/content', data)).data;

export const updateAdminContent = async (id: string, data: Partial<ContentItem>) => 
  (await apiClient.patch<ContentItem>(`/admin/content/${id}`, data)).data;

export const deleteAdminContent = async (id: string) => 
  (await apiClient.delete<{ success: boolean }>(`/admin/content/${id}`)).data;

export const requestVideoUpload = async (id: string, fileData: { fileName: string; fileType: string }) => 
  (await apiClient.post<VideoUploadResponse>(`/admin/content/${id}/video-upload`, fileData)).data;

export const uploadVideoFileToPresignedUrl = async (uploadUrl: string, file: File, onProgress?: (pct: number) => void) => {
  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percent);
      }
    },
  });
};

export const publishAdminContent = async (id: string) => 
  (await apiClient.post<ContentItem>(`/admin/content/${id}/publish`)).data;

// User API
export const getUsers = async () => (await apiClient.get<User[]>('/users')).data;
export const updateUserStatus = async (id: string, status: User['status']) => 
  (await apiClient.patch<User>(`/users/${id}`, { status })).data;

// Subscription API
export const getSubscriptions = async () => (await apiClient.get<Subscription[]>('/subscriptions')).data;

// Coupon API
export const getCoupons = async () => (await apiClient.get<Coupon[]>('/coupons')).data;
export const createCoupon = async (data: Partial<Coupon>) => (await apiClient.post<Coupon>('/coupons', data)).data;

// Notification API
export const sendNotification = async (payload: NotificationPayload) => 
  (await apiClient.post<{ success: boolean }>('/notifications/send', payload)).data;
