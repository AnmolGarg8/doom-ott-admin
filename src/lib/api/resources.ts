import { apiClient } from './client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface ContentItem {
  id: string;
  title: string;
  type: 'MOVIE' | 'SHOW' | 'EPISODE';
  genre: string;
  views: number;
  rating: number;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
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

// User API
export const getUsers = async () => (await apiClient.get<User[]>('/users')).data;
export const updateUserStatus = async (id: string, status: User['status']) => 
  (await apiClient.patch<User>(`/users/${id}`, { status })).data;

// Content API
export const getContentList = async () => (await apiClient.get<ContentItem[]>('/content')).data;
export const createContent = async (data: Partial<ContentItem>) => (await apiClient.post<ContentItem>('/content', data)).data;

// Subscription API
export const getSubscriptions = async () => (await apiClient.get<Subscription[]>('/subscriptions')).data;

// Coupon API
export const getCoupons = async () => (await apiClient.get<Coupon[]>('/coupons')).data;
export const createCoupon = async (data: Partial<Coupon>) => (await apiClient.post<Coupon>('/coupons', data)).data;

// Notification API
export const sendNotification = async (payload: NotificationPayload) => 
  (await apiClient.post<{ success: boolean }>('/notifications/send', payload)).data;
