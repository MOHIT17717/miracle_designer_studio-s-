const API_BASE = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL_BROWSER || '') 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');

// ─── Types ──────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  createdAt: string;
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  images: string; // JSON array string
  categoryId: string;
  category?: Category;
  isNew: boolean;
  isActive: boolean;
  stock: number;
  tags: string | null; // JSON array string
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string | null;
  discount: number;
  festivalName: string | null;
  bannerImage: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  products: { id: string; product: Product }[];
  createdAt: string;
}

export interface MakeupBooking {
  id: string;
  customerName: string;
  mobile: string;
  email: string | null;
  serviceType: string;
  date: string;
  time: string;
  address: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
}

export interface Order {
  id: string;
  customerName: string;
  mobile: string;
  email: string | null;
  address: string;
  city: string;
  pincode: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ListResponse<T> {
  items: T[];
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalBookings: number;
  pendingBookings: number;
  activeOffers: number;
  totalCategories: number;
  totalRevenue: number;
}

// ─── Fetcher ────────────────────────────────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include', // Send HttpOnly cookies for admin auth
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API Error ${res.status}`);
  }
  return res.json();
}

// ═══════════════════════════════════════════════════════
//  PUBLIC API
// ═══════════════════════════════════════════════════════

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'name';
}

export async function getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
  const params = new URLSearchParams();
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.search) params.set('search', filters.search);
  if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.sort) params.set('sort', filters.sort);

  const qs = params.toString();
  return apiFetch<PaginatedResponse<Product>>(`/api/public/products${qs ? `?${qs}` : ''}`);
}

export async function getProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/api/public/products/${id}`);
}

export async function getCategories(): Promise<ListResponse<Category>> {
  return apiFetch<ListResponse<Category>>('/api/public/categories');
}

export async function getOffers(): Promise<ListResponse<Offer>> {
  return apiFetch<ListResponse<Offer>>('/api/public/offers');
}

export interface BookingData {
  customerName: string;
  mobile: string;
  email?: string;
  serviceType: string;
  date: string;
  time: string;
  address?: string;
  notes?: string;
}

export async function createBooking(data: BookingData): Promise<MakeupBooking> {
  return apiFetch<MakeupBooking>('/api/public/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface OrderData {
  customerName: string;
  mobile: string;
  email?: string;
  address: string;
  city: string;
  pincode: string;
  notes?: string;
  items: { productId: string; quantity: number }[];
}

export async function createOrder(data: OrderData): Promise<Order> {
  return apiFetch<Order>('/api/public/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Public Order Tracking ──────────────────────────────
export async function trackOrder(orderId: string): Promise<Order> {
  return apiFetch<Order>(`/api/public/orders/${orderId}`);
}

// ═══════════════════════════════════════════════════════
//  ADMIN API
// ═══════════════════════════════════════════════════════

// ─── Auth ───────────────────────────────────────────────
export async function login(mobile: string, password: string): Promise<{ ok: boolean, role: string }> {
  return apiFetch<{ ok: boolean, role: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ mobile, password }),
  });
}

export async function logout(): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>('/api/auth/logout', {
    method: 'POST',
  });
}

// ─── Admin Dashboard Stats ─────────────────────────────
export async function getAdminStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>('/api/admin/stats');
}

// ─── Admin Products CRUD ────────────────────────────────
export async function getAdminProducts(filters: { search?: string; categoryId?: string; page?: number; limit?: number } = {}): Promise<PaginatedResponse<Product>> {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  const qs = params.toString();
  return apiFetch<PaginatedResponse<Product>>(`/api/products${qs ? `?${qs}` : ''}`);
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  return apiFetch<Product>('/api/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/products/${id}`, {
    method: 'DELETE',
  });
}

// ─── Admin Orders ───────────────────────────────────────
export async function getAdminOrders(filters: { status?: string; paymentStatus?: string; search?: string; page?: number; limit?: number } = {}): Promise<PaginatedResponse<Order>> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus);
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  const qs = params.toString();
  return apiFetch<PaginatedResponse<Order>>(`/api/orders${qs ? `?${qs}` : ''}`);
}

export async function updateOrderStatus(id: string, data: { status?: string; paymentStatus?: string; notes?: string }): Promise<Order> {
  return apiFetch<Order>(`/api/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteOrder(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/orders/${id}`, {
    method: 'DELETE',
  });
}

// ─── Admin Bookings ─────────────────────────────────────
export async function getAdminBookings(filters: { status?: string; search?: string; page?: number; limit?: number } = {}): Promise<PaginatedResponse<MakeupBooking>> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  const qs = params.toString();
  return apiFetch<PaginatedResponse<MakeupBooking>>(`/api/bookings${qs ? `?${qs}` : ''}`);
}

export async function updateBookingStatus(id: string, data: { status?: string; notes?: string }): Promise<MakeupBooking> {
  return apiFetch<MakeupBooking>(`/api/bookings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ─── Admin Categories ───────────────────────────────────
export async function getAdminCategories(): Promise<ListResponse<Category>> {
  return apiFetch<ListResponse<Category>>('/api/categories');
}

export async function createCategory(data: { name: string; description?: string; image?: string; sortOrder?: number }): Promise<Category> {
  return apiFetch<Category>('/api/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  return apiFetch<Category>(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/categories/${id}`, {
    method: 'DELETE',
  });
}

// ─── Admin Offers ───────────────────────────────────────
export async function getAdminOffers(): Promise<ListResponse<Offer>> {
  return apiFetch<ListResponse<Offer>>('/api/offers');
}

export async function createOffer(data: { title: string; description?: string; discount: number; festivalName?: string; startDate: string; endDate: string; productIds?: string[] }): Promise<Offer> {
  return apiFetch<Offer>('/api/offers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateOffer(id: string, data: Partial<Offer> & { productIds?: string[] }): Promise<Offer> {
  return apiFetch<Offer>(`/api/offers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteOffer(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/offers/${id}`, {
    method: 'DELETE',
  });
}

// ─── Helpers ────────────────────────────────────────────
export function parseImages(imagesJson: string): string[] {
  try {
    const arr = JSON.parse(imagesJson);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function parseTags(tagsJson: string | null): string[] {
  if (!tagsJson) return [];
  try {
    const arr = JSON.parse(tagsJson);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getWhatsAppLink(message: string): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '919655425277';
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
