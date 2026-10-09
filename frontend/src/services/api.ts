import axios from 'axios';

export type BookingPayload = {
  customer_name: string;
  phone: string;
  email: string;
  service_id: number;
  booking_date: string;
  booking_time: string;
  address: string;
  notes?: string;
};

export type Service = {
  id: number;
  name: string;
  slug: string;
  price: number;
  duration_minutes: number;
};

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

const TOKEN_KEY = 'vtsAdminToken';

const rawApiUrl =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  'http://localhost:8000/api/v1';

const normalizedBaseUrl = rawApiUrl.endsWith('/api/v1')
  ? rawApiUrl
  : `${rawApiUrl.replace(/\/+$/, '')}/api/v1`;

export const api = axios.create({
  baseURL: normalizedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getServices = async () => {
  const response = await api.get<Service[]>('/services');
  return response.data;
};

export const submitContactForm = async (payload: Record<string, string>) => {
  const response = await api.post('/contact', payload);
  return response.data;
};

export const submitBooking = async (payload: BookingPayload) => {
  const response = await api.post('/bookings', payload);
  return response.data;
};

export const loginAdmin = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const getAdminProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard/stats');
  return response.data;
};

export const getAdminBookings = async () => {
  const response = await api.get('/bookings/admin');
  return response.data;
};

export const updateBookingStatus = async (bookingId: number, status: BookingStatus) => {
  const response = await api.patch(`/admin/bookings/${bookingId}/status`, { status });
  return response.data;
};

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  featured_image?: string | null;
  author: string;
  status: 'draft' | 'published';
  published_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type BlogPostPayload = {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  status?: 'draft' | 'published';
};

export const getPublishedBlogs = async () => {
  const response = await api.get<BlogPost[]>('/blogs');
  return response.data;
};

export const getPublishedBlogBySlug = async (slugOrId: string) => {
  const response = await api.get<BlogPost>(`/blogs/${slugOrId}`);
  return response.data;
};

export const getAllBlogsAdmin = async () => {
  const response = await api.get<BlogPost[]>('/blogs/admin/all');
  return response.data;
};

export const createBlogAdmin = async (payload: BlogPostPayload) => {
  const response = await api.post<BlogPost>('/blogs', payload);
  return response.data;
};

export const updateBlogAdmin = async (id: number, payload: Partial<BlogPostPayload>) => {
  const response = await api.put<BlogPost>(`/blogs/${id}`, payload);
  return response.data;
};

export const deleteBlogAdmin = async (id: number) => {
  const response = await api.delete<{ message: string; id: number }>(`/blogs/${id}`);
  return response.data;
};

