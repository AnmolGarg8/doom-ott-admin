import { apiClient } from './client';
import axios from 'axios';

export interface OverviewReport {
  total_users: number;
  active_subscriptions: number;
  revenue_this_month: number;
  top_content: {
    content_id: string;
    title: string;
    type: string;
    watch_count: number;
  }[];
}

export interface VideoAsset {
  id: string;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  video_url?: string;
  progress?: number;
}

export interface Episode {
  id: string;
  season_number: number;
  episode_number: number;
  title: string;
  video_asset?: VideoAsset;
}

export interface ContentItem {
  id: string;
  title: string;
  type: 'movie' | 'series' | 'short'; // ContentType enum matching backend: movie, series, short
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
  episodes?: Episode[];
  created_at?: string;
  createdAt?: string;
}

export interface VideoUploadResponse {
  upload_url: string;
  asset_id: string;
}

export interface ImageUploadResponse {
  image_url: string;
}

export interface ChecklistItem {
  key: string;
  label: string;
  passed: boolean;
}

export interface PublishChecklistResponse {
  is_ready: boolean;
  checklist: ChecklistItem[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  is_blocked: boolean;
  status?: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED';
  created_at?: string;
  createdAt?: string;
}

export interface PaginatedUsersResponse {
  items: AdminUser[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  resolution: string;
  max_devices: number;
  active_subscribers_count?: number;
}

export interface AdminCoupon {
  id: string;
  code: string;
  discount_type: 'PERCENTAGE' | 'FLAT';
  value: number;
  expiry?: string;
  usage_limit?: number;
  times_used?: number;
}

export interface BroadcastNotificationPayload {
  title: string;
  body: string;
  target_segment: 'ALL' | 'PREMIUM' | 'INACTIVE';
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

export const uploadContentImage = async (id: string, file: File, imageType: 'poster' | 'backdrop', onProgress?: (pct: number) => void) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', imageType);

  const res = await apiClient.post<ImageUploadResponse>(`/admin/content/${id}/upload-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      if (evt.total && onProgress) {
        onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });
  return res.data;
};

export const requestVideoUpload = async (id: string, fileData: { fileName: string; fileType: string; episodeId?: string }) => 
  (await apiClient.post<VideoUploadResponse>(`/admin/content/${id}/video-upload`, fileData)).data;

export const uploadVideoFileToPresignedUrl = async (uploadUrl: string, file: File, onProgress?: (pct: number) => void) => {
  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });
};

export const getPublishChecklist = async (id: string) => 
  (await apiClient.get<PublishChecklistResponse>(`/admin/content/${id}/publish-checklist`)).data;

export const publishAdminContent = async (id: string) => 
  (await apiClient.post<ContentItem>(`/admin/content/${id}/publish`)).data;

// User Management API
export const getAdminUsers = async (params?: { search?: string; page?: number; limit?: number }) => 
  (await apiClient.get<PaginatedUsersResponse>('/admin/users', { params })).data;

export const toggleBlockUser = async (id: string, is_blocked: boolean) => 
  (await apiClient.patch<AdminUser>(`/admin/users/${id}/block`, { is_blocked })).data;

// Plans API
export const getAdminPlans = async () => (await apiClient.get<Plan[]>('/admin/plans')).data;
export const createAdminPlan = async (data: Partial<Plan>) => (await apiClient.post<Plan>('/admin/plans', data)).data;
export const updateAdminPlan = async (id: string, data: Partial<Plan>) => (await apiClient.patch<Plan>(`/admin/plans/${id}`, data)).data;
export const deleteAdminPlan = async (id: string) => (await apiClient.delete<{ success: boolean }>(`/admin/plans/${id}`)).data;

// Coupons API
export const getAdminCoupons = async () => (await apiClient.get<AdminCoupon[]>('/admin/coupons')).data;
export const createAdminCoupon = async (data: Partial<AdminCoupon>) => (await apiClient.post<AdminCoupon>('/admin/coupons', data)).data;
export const deleteAdminCoupon = async (id: string) => (await apiClient.delete<{ success: boolean }>(`/admin/coupons/${id}`)).data;

// Broadcast Notifications API
export const broadcastNotification = async (payload: BroadcastNotificationPayload) => 
  (await apiClient.post<{ success: boolean }>(`/admin/notifications/broadcast`, payload)).data;
