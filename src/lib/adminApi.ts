// Admin API Client
import {
  Admin,
  AdminLoginResponse,
  Provider,
  AdminTransaction,
  AdminUser,
  AdminPromo,
  AdminBanner,
  AdminPopup,
  DashboardOverview,
  AuditLog,
  AdminDeposit,
  AdminProduct,
  AdminSKU,
  AdminRegion,
  AdminLanguage,
  AdminCategory,
  AdminSection,
  AdminPaymentChannel,
  AdminPaymentChannelCategory,
  AdminSettings,
  AdminRole,
  Pagination,
} from '@/types/admin';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://gateway.gate.co.id';
const ADMIN_API_VERSION = '/admin/v2';
const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_REFRESH_TOKEN_KEY = 'admin_refresh_token';
const ADMIN_DATA_KEY = 'admin_data';
const AUTH_ERROR_CODES = new Set(['INVALID_TOKEN', 'TOKEN_EXPIRED', 'UNAUTHORIZED', 'AUTH_REQUIRED']);

const isBrowser = typeof window !== 'undefined';

const clearAdminSession = () => {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
    localStorage.removeItem(ADMIN_DATA_KEY);
  } catch (error) {
    console.error('[AdminAuth] Failed to clear session', error);
  }
};

const redirectToAdminLogin = () => {
  if (!isBrowser) return;
  if (!window.location.pathname.startsWith('/panel-admin/login')) {
    window.location.href = '/panel-admin/login?reason=expired';
  }
};

const handleUnauthorized = (message?: string) => {
  clearAdminSession();
  redirectToAdminLogin();
  const error = new Error(message || 'Sesi admin telah berakhir, silakan login kembali.');
  throw error;
};

// Helper to get auth token from localStorage
const getAuthToken = (): string | null => {
  if (!isBrowser) return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

// Helper to make authenticated requests
async function adminFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const isFormDataBody =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  if (!isFormDataBody) {
    (headers as Record<string, string>)['Content-Type'] =
      (headers as Record<string, string>)['Content-Type'] || 'application/json';
  }

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${ADMIN_API_VERSION}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorCode = error?.error?.code;
    if (response.status === 401 || AUTH_ERROR_CODES.has(errorCode)) {
      handleUnauthorized(error?.error?.message || error?.message);
    }
    throw new Error(error?.error?.message || error?.message || 'Request failed');
  }

  return response.json();
}

// ============================================
// AUTHENTICATION
// ============================================

export async function adminLogin(email: string, password: string): Promise<AdminLoginResponse> {
  const response = await fetch(`${API_BASE_URL}${ADMIN_API_VERSION}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(error.error?.message || error.message || 'Login failed');
  }

  const data = await response.json();
  return data.data;
}

export async function adminVerifyMFA(mfaToken: string, code: string): Promise<AdminLoginResponse> {
  const response = await fetch(`${API_BASE_URL}${ADMIN_API_VERSION}/auth/verify-mfa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mfaToken, code }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'MFA verification failed' }));
    throw new Error(error.error?.message || error.message || 'MFA verification failed');
  }

  const data = await response.json();
  return data.data;
}

export async function adminRefreshToken(refreshToken: string): Promise<AdminLoginResponse> {
  const response = await fetch(`${API_BASE_URL}${ADMIN_API_VERSION}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  const data = await response.json();
  return data.data;
}

export async function adminLogout(): Promise<void> {
  await adminFetch('/auth/logout', { method: 'POST' });
}

// ============================================
// DASHBOARD
// ============================================

export async function getDashboardOverview(params?: {
  region?: string;
  startDate?: string;
  endDate?: string;
}): Promise<DashboardOverview> {
  const searchParams = new URLSearchParams();
  if (params?.region) searchParams.set('region', params.region);
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);

  const query = searchParams.toString();
  const response = await adminFetch<{ data: DashboardOverview }>(
    `/reports/dashboard${query ? `?${query}` : ''}`
  );
  return response.data;
}

// ============================================
// ADMIN MANAGEMENT
// ============================================

export async function getAdmins(params?: {
  limit?: number;
  page?: number;
  search?: string;
  role?: string;
  status?: string;
}): Promise<{ admins: Admin[]; pagination: Pagination }> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.search) searchParams.set('search', params.search);
  if (params?.role) searchParams.set('role', params.role);
  if (params?.status) searchParams.set('status', params.status);

  const query = searchParams.toString();
  const response = await adminFetch<{ data: { admins: Admin[]; pagination: Pagination } }>(
    `/admins${query ? `?${query}` : ''}`
  );
  return response.data;
}

export async function getAdmin(adminId: string): Promise<Admin> {
  const response = await adminFetch<{ data: Admin }>(`/admins/${adminId}`);
  return response.data;
}

export async function createAdmin(data: {
  name: string;
  email: string;
  phoneNumber?: string;
  password: string;
  roleCode: string;
  status?: string;
}): Promise<Admin> {
  const response = await adminFetch<{ data: Admin }>('/admins', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function updateAdmin(adminId: string, data: Partial<{
  name: string;
  phoneNumber: string;
  roleCode: string;
  status: string;
}>): Promise<Admin> {
  const response = await adminFetch<{ data: Admin }>(`/admins/${adminId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function deleteAdmin(adminId: string): Promise<void> {
  await adminFetch(`/admins/${adminId}`, { method: 'DELETE' });
}

export async function getRoles(): Promise<AdminRole[]> {
  const response = await adminFetch<{ data: AdminRole[] }>('/roles');
  return response.data;
}

export async function updateRolePermissions(roleCode: string, permissions: string[]): Promise<AdminRole> {
  const response = await adminFetch<{ data: AdminRole }>(`/roles/${roleCode}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permissions }),
  });
  return response.data;
}

// ============================================
// PROVIDER MANAGEMENT
// ============================================

export async function getProviders(): Promise<Provider[]> {
  const response = await adminFetch<{ data: Provider[] }>('/providers');
  return response.data;
}

export async function getProvider(providerId: string): Promise<Provider> {
  const response = await adminFetch<{ data: Provider }>(`/providers/${providerId}`);
  return response.data;
}

export async function createProvider(data: {
  code: string;
  name: string;
  baseUrl: string;
  credentials: Record<string, string>;
  settings?: Record<string, any>;
  isActive?: boolean;
}): Promise<Provider> {
  const response = await adminFetch<{ data: Provider }>('/providers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function updateProvider(providerId: string, data: Partial<{
  name: string;
  baseUrl: string;
  credentials: Record<string, string>;
  settings: Record<string, any>;
  isActive: boolean;
}>): Promise<Provider> {
  const response = await adminFetch<{ data: Provider }>(`/providers/${providerId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function deleteProvider(providerId: string): Promise<void> {
  await adminFetch(`/providers/${providerId}`, { method: 'DELETE' });
}

export async function testProvider(providerId: string): Promise<{
  status: string;
  responseTime: number;
  balance: number;
  message: string;
}> {
  const response = await adminFetch<{ data: any }>(`/providers/${providerId}/test`, {
    method: 'POST',
  });
  return response.data;
}

export async function syncProviderSKUs(providerId: string): Promise<{
  status: string;
  summary: {
    totalFromProvider: number;
    newSkus: number;
    updatedSkus: number;
    deactivatedSkus: number;
    unchanged: number;
  };
}> {
  const response = await adminFetch<{ data: any }>(`/providers/${providerId}/sync`, {
    method: 'POST',
  });
  return response.data;
}

// ============================================
// TRANSACTION MANAGEMENT
// ============================================

export async function getTransactions(params?: {
  limit?: number;
  page?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  productCode?: string;
  providerCode?: string;
  paymentCode?: string;
  region?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{
  overview: {
    totalTransactions: number;
    totalRevenue: number;
    totalProfit: number;
    successCount: number;
    processingCount: number;
    pendingCount: number;
    failedCount: number;
  };
  transactions: AdminTransaction[];
  pagination: Pagination;
}> {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  const response = await adminFetch<{ data: any }>(`/transactions${query ? `?${query}` : ''}`);
  return response.data;
}

export async function getTransaction(transactionId: string): Promise<AdminTransaction> {
  const response = await adminFetch<{ data: AdminTransaction }>(`/transactions/${transactionId}`);
  return response.data;
}

export async function updateTransactionStatus(transactionId: string, data: {
  status: string;
  reason: string;
  serialNumber?: string;
}): Promise<AdminTransaction> {
  const response = await adminFetch<{ data: AdminTransaction }>(`/transactions/${transactionId}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function refundTransaction(transactionId: string, data: {
  reason: string;
  refundTo: 'BALANCE' | 'ORIGINAL_METHOD';
  amount: number;
}): Promise<any> {
  const response = await adminFetch<{ data: any }>(`/transactions/${transactionId}/refund`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function retryTransaction(transactionId: string, data: {
  providerCode?: string;
  reason: string;
}): Promise<any> {
  const response = await adminFetch<{ data: any }>(`/transactions/${transactionId}/retry`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function manualTransaction(transactionId: string, data: {
  status: 'SUCCESS' | 'FAILED';
  serialNumber?: string;
  reason: string;
}): Promise<AdminTransaction> {
  const response = await adminFetch<{ data: AdminTransaction }>(`/transactions/${transactionId}/manual`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

// ============================================
// USER MANAGEMENT
// ============================================

export async function getUsers(params?: {
  limit?: number;
  page?: number;
  search?: string;
  status?: string;
  membership?: string;
  region?: string;
}): Promise<{ users: AdminUser[]; pagination: Pagination }> {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  const response = await adminFetch<{ data: { users: AdminUser[]; pagination: Pagination } }>(
    `/users${query ? `?${query}` : ''}`
  );
  return response.data;
}

export async function getUser(userId: string): Promise<AdminUser> {
  const response = await adminFetch<{ data: AdminUser }>(`/users/${userId}`);
  return response.data;
}

export async function updateUserStatus(userId: string, data: {
  status: string;
  reason: string;
}): Promise<AdminUser> {
  const response = await adminFetch<{ data: AdminUser }>(`/users/${userId}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function adjustUserBalance(userId: string, data: {
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  currency: string;
  reason: string;
}): Promise<any> {
  const response = await adminFetch<{ data: any }>(`/users/${userId}/balance`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function getUserTransactions(userId: string, params?: {
  limit?: number;
  page?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ transactions: AdminTransaction[]; pagination: Pagination }> {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  const response = await adminFetch<{ data: { transactions: AdminTransaction[]; pagination: Pagination } }>(
    `/users/${userId}/transactions${query ? `?${query}` : ''}`
  );
  return response.data;
}

export async function getUserMutations(userId: string, params?: {
  limit?: number;
  page?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ mutations: any[]; pagination: Pagination }> {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  const response = await adminFetch<{ data: { mutations: any[]; pagination: Pagination } }>(
    `/users/${userId}/mutations${query ? `?${query}` : ''}`
  );
  return response.data;
}

// ============================================
// PRODUCT MANAGEMENT
// ============================================

export async function getProducts(params?: {
  limit?: number;
  page?: number;
  search?: string;
  categoryCode?: string;
  region?: string;
  isActive?: boolean;
}): Promise<{ products: AdminProduct[]; pagination: Pagination }> {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  const response = await adminFetch<{ data: { products: AdminProduct[]; pagination: Pagination } }>(
    `/products${query ? `?${query}` : ''}`
  );
  return response.data;
}

export async function getProduct(productId: string): Promise<AdminProduct> {
  const response = await adminFetch<{ data: AdminProduct }>(`/products/${productId}`);
  return response.data;
}

export async function createProduct(data: FormData): Promise<AdminProduct> {
  const response = await adminFetch<{ data: AdminProduct }>('/products', {
    method: 'POST',
    body: data,
  });
  return response.data;
}

export async function updateProduct(productId: string, data: FormData): Promise<AdminProduct> {
  const response = await adminFetch<{ data: AdminProduct }>(`/products/${productId}`, {
    method: 'PUT',
    body: data,
  });
  return response.data;
}

export async function deleteProduct(productId: string): Promise<void> {
  await adminFetch(`/products/${productId}`, { method: 'DELETE' });
}

export async function getProductFields(productId: string): Promise<any[]> {
  const response = await adminFetch<{ data: any[] }>(`/products/${productId}/fields`);
  return response.data;
}

export async function updateProductFields(productId: string, fields: any[]): Promise<any[]> {
  const response = await adminFetch<{ data: any[] }>(`/products/${productId}/fields`, {
    method: 'PUT',
    body: JSON.stringify({ fields }),
  });
  return response.data;
}

// ============================================
// SKU MANAGEMENT
// ============================================

export async function getSKUs(params?: {
  limit?: number;
  page?: number;
  search?: string;
  productCode?: string;
  providerCode?: string;
  region?: string;
  isActive?: boolean;
}): Promise<{ skus: AdminSKU[]; pagination: Pagination }> {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  const response = await adminFetch<{ data: { skus: AdminSKU[]; pagination: Pagination } }>(
    `/skus${query ? `?${query}` : ''}`
  );
  return response.data;
}

export async function getSKU(skuId: string): Promise<AdminSKU> {
  const response = await adminFetch<{ data: AdminSKU }>(`/skus/${skuId}`);
  return response.data;
}

export interface SKUPriceConfig {
  currency: string;
  buyPrice: number;
  sellPrice: number;
  originalPrice?: number;
  margin?: number;
  discount?: number;
}

export interface SKUCreatePayload {
  code: string;
  providerSkuCode: string;
  name: string;
  description?: string;
  productCode: string;
  providerCode: string;
  sectionCode?: string;
  image?: string;
  processTime?: number;
  stock?: 'AVAILABLE' | 'OUT_OF_STOCK' | 'LIMITED';
  stockStatus?: 'AVAILABLE' | 'OUT_OF_STOCK' | 'LIMITED';
  isActive?: boolean;
  isFeatured?: boolean;
  pricing: Record<string, SKUPriceConfig>;
  info?: string;
  badge?: {
    text: string;
    color: string;
  };
}

export async function createSKU(data: FormData | SKUCreatePayload): Promise<AdminSKU> {
  const isFormData = data instanceof FormData;
  const response = await adminFetch<{ data: AdminSKU }>('/skus', {
    method: 'POST',
    body: isFormData ? data : JSON.stringify(data),
  });
  return response.data;
}

export async function updateSKU(skuId: string, data: FormData | Partial<SKUCreatePayload>): Promise<AdminSKU> {
  const isFormData = data instanceof FormData;
  const response = await adminFetch<{ data: AdminSKU }>(`/skus/${skuId}`, {
    method: 'PUT',
    body: isFormData ? data : JSON.stringify(data),
  });
  return response.data;
}

export async function deleteSKU(skuId: string): Promise<void> {
  await adminFetch(`/skus/${skuId}`, { method: 'DELETE' });
}

export async function bulkUpdateSKUPrices(updates: {
  skuId: string;
  baseCost?: number;
  sellingPrice?: number;
}[]): Promise<{ updated: number; failed: number }> {
  const response = await adminFetch<{ data: { updated: number; failed: number } }>('/skus/bulk-price', {
    method: 'PUT',
    body: JSON.stringify({ updates }),
  });
  return response.data;
}

export async function syncSKUs(params: {
  providerCode?: string;
  productCode?: string;
}): Promise<{
  status: string;
  summary: {
    totalFromProvider: number;
    newSkus: number;
    updatedSkus: number;
    deactivatedSkus: number;
    unchanged: number;
  };
}> {
  const response = await adminFetch<{ data: any }>('/skus/sync', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return response.data;
}

export async function getSKUImages(params?: {
  productCode?: string;
}): Promise<string[]> {
  const searchParams = new URLSearchParams();
  if (params?.productCode) searchParams.set('productCode', params.productCode);

  const query = searchParams.toString();
  const response = await adminFetch<{ data: { images: string[] } }>(
    `/skus/images${query ? `?${query}` : ''}`
  );
  // Handle different response structures
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  if (Array.isArray(response?.data?.images)) {
    return response.data.images;
  }
  return [];
}

// ============================================
// PROMO MANAGEMENT
// ============================================

export async function getPromos(params?: {
  limit?: number;
  page?: number;
  search?: string;
  isActive?: boolean;
}): Promise<{ promos: AdminPromo[]; pagination: Pagination }> {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  const response = await adminFetch<{ data: { promos: AdminPromo[]; pagination: Pagination } }>(
    `/promos${query ? `?${query}` : ''}`
  );
  return response.data;
}

export async function createPromo(data: Partial<AdminPromo>): Promise<AdminPromo> {
  const response = await adminFetch<{ data: AdminPromo }>('/promos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function updatePromo(promoId: string, data: Partial<AdminPromo>): Promise<AdminPromo> {
  const response = await adminFetch<{ data: AdminPromo }>(`/promos/${promoId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function deletePromo(promoId: string): Promise<void> {
  await adminFetch(`/promos/${promoId}`, { method: 'DELETE' });
}

export async function getPromoStats(promoId: string): Promise<{
  totalUsage: number;
  totalDiscount: number;
  uniqueUsers: number;
  usageByDay: { date: string; count: number; amount: number }[];
}> {
  const response = await adminFetch<{ data: any }>(`/promos/${promoId}/stats`);
  return response.data;
}

// ============================================
// CONTENT MANAGEMENT
// ============================================

export async function getBanners(): Promise<AdminBanner[]> {
  const response = await adminFetch<any>('/banners');
  // Backend returns: { data: { banners: [...] } }
  if (response?.data?.banners && Array.isArray(response.data.banners)) {
    return response.data.banners;
  }
  // Fallback if structure is different
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  if (Array.isArray(response?.banners)) {
    return response.banners;
  }
  return [];
}

export async function createBanner(data: FormData): Promise<AdminBanner> {
  const response = await adminFetch<{ data: AdminBanner }>('/banners', {
    method: 'POST',
    body: data,
  });
  return response.data;
}

export async function updateBanner(bannerId: string, data: FormData): Promise<AdminBanner> {
  const response = await adminFetch<{ data: AdminBanner }>(`/banners/${bannerId}`, {
    method: 'PUT',
    body: data,
  });
  return response.data;
}

export async function deleteBanner(bannerId: string): Promise<void> {
  await adminFetch(`/banners/${bannerId}`, { method: 'DELETE' });
}

export async function getPopups(params?: {
  region?: string;
  isActive?: boolean;
}): Promise<AdminPopup[]> {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  const response = await adminFetch<any>(`/popups${query ? `?${query}` : ''}`);
  // Backend returns: { data: { popups: [...] } }
  if (response?.data?.popups && Array.isArray(response.data.popups)) {
    return response.data.popups;
  }
  // Fallback if structure is different
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  if (Array.isArray(response?.popups)) {
    return response.popups;
  }
  return [];
}

export async function createPopup(data: FormData): Promise<AdminPopup> {
  const response = await adminFetch<{ data: AdminPopup }>('/popups', {
    method: 'POST',
    body: data,
  });
  return response.data;
}

export async function updatePopup(region: string, data: FormData): Promise<void> {
  await adminFetch<void>(`/popups/${region}`, {
    method: 'PUT',
    body: data,
  });
}

// ============================================
// REPORTS
// ============================================

export async function getRevenueReport(params?: {
  startDate?: string;
  endDate?: string;
  region?: string;
}): Promise<any> {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  const response = await adminFetch<{ data: any }>(`/reports/revenue${query ? `?${query}` : ''}`);
  return response.data;
}

export async function getTransactionReport(params?: {
  startDate?: string;
  endDate?: string;
  region?: string;
  productCode?: string;
  providerCode?: string;
}): Promise<any> {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  const response = await adminFetch<{ data: any }>(`/reports/transactions${query ? `?${query}` : ''}`);
  return response.data;
}

export async function getProductReport(params?: {
  startDate?: string;
  endDate?: string;
  region?: string;
  categoryCode?: string;
}): Promise<any> {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  const response = await adminFetch<{ data: any }>(`/reports/products${query ? `?${query}` : ''}`);
  return response.data;
}

export async function getProviderReport(params?: {
  startDate?: string;
  endDate?: string;
  providerCode?: string;
}): Promise<any> {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  const response = await adminFetch<{ data: any }>(`/reports/providers${query ? `?${query}` : ''}`);
  return response.data;
}

export async function exportReport(data: {
  reportType: string;
  format: 'xlsx' | 'csv';
  filters: Record<string, any>;
}): Promise<{ exportId: string; status: string }> {
  const response = await adminFetch<{ data: any }>('/reports/export', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function getExportStatus(exportId: string): Promise<{
  exportId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  downloadUrl?: string;
  expiresAt?: string;
  error?: string;
}> {
  const response = await adminFetch<{ data: any }>(`/reports/export/${exportId}`);
  return response.data;
}

// ============================================
// AUDIT LOGS
// ============================================

export async function getAuditLogs(params?: {
  limit?: number;
  page?: number;
  adminId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ logs: AuditLog[]; pagination: Pagination }> {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  const response = await adminFetch<{ data: { logs: AuditLog[]; pagination: Pagination } }>(
    `/audit-logs${query ? `?${query}` : ''}`
  );
  return response.data;
}

// ============================================
// SETTINGS
// ============================================

export async function getSettings(): Promise<AdminSettings> {
  const response = await adminFetch<{ data: AdminSettings }>('/settings');
  return response.data;
}

export async function updateSettings(category: string, data: Record<string, any>): Promise<any> {
  const response = await adminFetch<{ data: any }>(`/settings/${category}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function getContacts(): Promise<any> {
  const response = await adminFetch<{ data: any }>('/settings/contacts');
  return response.data;
}

export async function updateContacts(data: {
  email?: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tiktok?: string;
  address?: string;
}): Promise<any> {
  const response = await adminFetch<{ data: any }>('/settings/contacts', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
}

// ============================================
// DEPOSIT MANAGEMENT
// ============================================

export async function getDeposits(params?: {
  limit?: number;
  page?: number;
  search?: string;
  status?: string;
  paymentCode?: string;
  gatewayCode?: string;
  region?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{
  overview: {
    totalDeposits: number;
    totalAmount: number;
    successCount: number;
    pendingCount: number;
    expiredCount: number;
    failedCount: number;
  };
  deposits: AdminDeposit[];
  pagination: Pagination;
}> {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  const response = await adminFetch<{ data: any }>(`/deposits${query ? `?${query}` : ''}`);
  return response.data;
}

export async function confirmDeposit(depositId: string, data: {
  reason: string;
  gatewayRefId?: string;
}): Promise<any> {
  const response = await adminFetch<{ data: any }>(`/deposits/${depositId}/confirm`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function cancelDeposit(depositId: string, data: { reason: string }): Promise<any> {
  const response = await adminFetch<{ data: any }>(`/deposits/${depositId}/cancel`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function getDeposit(depositId: string): Promise<AdminDeposit> {
  const response = await adminFetch<{ data: AdminDeposit }>(`/deposits/${depositId}`);
  return response.data;
}

export async function refundDeposit(depositId: string, data: {
  reason: string;
  amount?: number;
}): Promise<any> {
  const response = await adminFetch<{ data: any }>(`/deposits/${depositId}/refund`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

// ============================================
// REGION MANAGEMENT
// ============================================

export async function getRegions(): Promise<AdminRegion[]> {
  const response = await adminFetch<any>('/regions');
  // Backend returns: { data: { regions: [...] } }
  if (response?.data?.regions && Array.isArray(response.data.regions)) {
    return response.data.regions;
  }
  // Fallback if structure is different
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  if (Array.isArray(response?.regions)) {
    return response.regions;
  }
  return [];
}


export async function deleteRegion(regionId: string): Promise<void> {
  await adminFetch(`/regions/${regionId}`, { method: 'DELETE' });
}

// ============================================
// LANGUAGE MANAGEMENT
// ============================================

export async function getLanguages(): Promise<AdminLanguage[]> {
  const response = await adminFetch<any>('/languages');
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  if (Array.isArray(response?.languages)) {
    return response.languages;
  }
  return [];
}

export async function createRegion(data: FormData): Promise<AdminRegion> {
  const response = await adminFetch<{ data: AdminRegion }>('/regions', {
    method: 'POST',
    body: data,
  });
  return response.data;
}

export async function updateRegion(regionId: string, data: FormData): Promise<AdminRegion> {
  const response = await adminFetch<{ data: AdminRegion }>(`/regions/${regionId}`, {
    method: 'PUT',
    body: data,
  });
  return response.data;
}

export async function createLanguage(data: FormData): Promise<AdminLanguage> {
  const response = await adminFetch<{ data: AdminLanguage }>('/languages', {
    method: 'POST',
    body: data,
  });
  return response.data;
}

export async function updateLanguage(languageId: string, data: FormData): Promise<AdminLanguage> {
  const response = await adminFetch<{ data: AdminLanguage }>(`/languages/${languageId}`, {
    method: 'PUT',
    body: data,
  });
  return response.data;
}

export async function deleteLanguage(languageId: string): Promise<void> {
  await adminFetch(`/languages/${languageId}`, { method: 'DELETE' });
}

// ============================================
// CATEGORY MANAGEMENT
// ============================================

export async function getCategories(params?: {
  region?: string;
  isActive?: boolean;
}): Promise<AdminCategory[]> {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  const response = await adminFetch<any>(
    `/categories${query ? `?${query}` : ''}`
  );
  // Backend returns: { data: { categories: [...] } }
  if (response?.data?.categories && Array.isArray(response.data.categories)) {
    return response.data.categories;
  }
  // Fallback if structure is different
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  if (Array.isArray(response?.categories)) {
    return response.categories;
  }
  return [];
}

export async function createCategory(data: {
  code: string;
  name: string;
  region: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}): Promise<AdminCategory> {
  const response = await adminFetch<{ data: AdminCategory }>('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function updateCategory(categoryId: string, data: Partial<{
  name: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}>): Promise<AdminCategory> {
  const response = await adminFetch<{ data: AdminCategory }>(`/categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await adminFetch(`/categories/${categoryId}`, { method: 'DELETE' });
}

// ============================================
// SECTION MANAGEMENT
// ============================================

export async function getSections(params?: {
  productCode?: string;
}): Promise<AdminSection[]> {
  const searchParams = new URLSearchParams();
  if (params?.productCode) searchParams.set('productCode', params.productCode);

  const query = searchParams.toString();
  const response = await adminFetch<{
    data?: AdminSection[] | { sections?: AdminSection[] };
    sections?: AdminSection[]
  }>(
    `/sections${query ? `?${query}` : ''}`
  );
  // Handle different response structures
  // Case 1: { data: { sections: [...] } }
  if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    if (Array.isArray((response.data as any).sections)) {
      return (response.data as any).sections;
    }
  }
  // Case 2: { data: [...] }
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  // Case 3: { sections: [...] }
  if (Array.isArray(response?.sections)) {
    return response.sections;
  }
  // Case 4: [...] (direct array)
  if (Array.isArray(response)) {
    return response;
  }
  return [];
}

export async function createSection(data: {
  productCode: string;
  name: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}): Promise<AdminSection> {
  const response = await adminFetch<{ data: AdminSection }>('/sections', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function updateSection(sectionId: string, data: Partial<{
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}>): Promise<AdminSection> {
  const response = await adminFetch<{ data: AdminSection }>(`/sections/${sectionId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function deleteSection(sectionId: string): Promise<void> {
  await adminFetch(`/sections/${sectionId}`, { method: 'DELETE' });
}

export async function updateSectionProducts(sectionId: string, products: string[]): Promise<AdminSection> {
  const response = await adminFetch<{ data: AdminSection }>(`/sections/${sectionId}/products`, {
    method: 'PUT',
    body: JSON.stringify({ products }),
  });
  return response.data;
}

// ============================================
// PAYMENT CHANNEL MANAGEMENT
// ============================================

export async function getPaymentChannels(params?: {
  categoryCode?: string;
  region?: string;
  isActive?: boolean;
}): Promise<AdminPaymentChannel[]> {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  const response = await adminFetch<{
    data?: AdminPaymentChannel[] | { paymentChannels?: AdminPaymentChannel[] };
    paymentChannels?: AdminPaymentChannel[];
  }>(
    `/payment-channels${query ? `?${query}` : ''}`
  );

  // Handle different response structures
  // Case 1: { data: [...] } (new structure)
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  // Case 2: { data: { paymentChannels: [...] } }
  if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    if (Array.isArray((response.data as any).paymentChannels)) {
      return (response.data as any).paymentChannels;
    }
  }
  // Case 3: { paymentChannels: [...] }
  if (Array.isArray(response?.paymentChannels)) {
    return response.paymentChannels;
  }
  // Case 4: [...] (direct array)
  if (Array.isArray(response)) {
    return response;
  }
  return [];
}

export async function getPaymentChannel(channelId: string): Promise<AdminPaymentChannel> {
  const response = await adminFetch<{ data: AdminPaymentChannel }>(`/payment-channels/${channelId}`);
  return response.data;
}

export async function createPaymentChannel(data: FormData | {
  code: string;
  name: string;
  description?: string;
  image?: string;
  categoryCode?: string;
  feeType: 'FIXED' | 'PERCENTAGE' | 'MIXED';
  feeAmount?: number;
  feePercentage?: number;
  minAmount?: number;
  maxAmount?: number;
  regions?: string[];
  supportedTypes?: ('purchase' | 'deposit')[];
  isActive?: boolean;
  isFeatured?: boolean;
  order?: number;
  instruction?: string;
}): Promise<AdminPaymentChannel> {
  const isFormData = data instanceof FormData;
  const response = await adminFetch<{ data: AdminPaymentChannel }>('/payment-channels', {
    method: 'POST',
    body: isFormData ? data : JSON.stringify(data),
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  });
  return response.data;
}

export async function updatePaymentChannel(channelId: string, data: FormData | Partial<{
  name?: string;
  description?: string;
  image?: string;
  categoryCode?: string;
  feeType?: 'FIXED' | 'PERCENTAGE' | 'MIXED';
  feeAmount?: number;
  feePercentage?: number;
  minAmount?: number;
  maxAmount?: number;
  regions?: string[];
  supportedTypes?: ('purchase' | 'deposit')[];
  isActive?: boolean;
  isFeatured?: boolean;
  order?: number;
  instruction?: string;
}>): Promise<AdminPaymentChannel> {
  const isFormData = data instanceof FormData;
  const response = await adminFetch<{ data: AdminPaymentChannel }>(`/payment-channels/${channelId}`, {
    method: 'PUT',
    body: isFormData ? data : JSON.stringify(data),
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  });
  return response.data;
}

export async function deletePaymentChannel(channelId: string): Promise<void> {
  await adminFetch(`/payment-channels/${channelId}`, { method: 'DELETE' });
}

// Payment Channel Categories
export async function getPaymentChannelCategories(params?: {
  region?: string;
  isActive?: boolean;
}): Promise<AdminPaymentChannelCategory[]> {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  const response = await adminFetch<{ data: AdminPaymentChannelCategory[] }>(
    `/payment-channel-categories${query ? `?${query}` : ''}`
  );
  return response.data;
}

export async function createPaymentChannelCategory(data: {
  code: string;
  title: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
}): Promise<AdminPaymentChannelCategory> {
  const response = await adminFetch<{ data: AdminPaymentChannelCategory }>('/payment-channel-categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function updatePaymentChannelCategory(categoryId: string, data: Partial<{
  title: string;
  icon: string;
  order: number;
  isActive: boolean;
}>): Promise<AdminPaymentChannelCategory> {
  const response = await adminFetch<{ data: AdminPaymentChannelCategory }>(`/payment-channel-categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function deletePaymentChannelCategory(categoryId: string): Promise<void> {
  await adminFetch(`/payment-channel-categories/${categoryId}`, { method: 'DELETE' });
}

// ============================================
// INVOICE MANAGEMENT
// ============================================

export interface AdminInvoice {
  invoiceNumber: string;
  type?: 'PURCHASE' | 'DEPOSIT';
  userId?: string;
  user?: {
    id?: string;
    name: string;
    email: string;
    phoneNumber?: string;
  };
  productCode?: string;
  productName?: string;
  product?: string; // For search response
  skuCode?: string;
  skuName?: string;
  region?: string;
  currency: string;
  amount?: number;
  fee?: number;
  totalAmount?: number;
  total?: number; // For search response
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' | 'SUCCESS';
  paymentCode?: string;
  paymentChannel?: string;
  paymentExpiredAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export async function getInvoices(params?: {
  limit?: number;
  page?: number;
  search?: string;
  status?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ invoices: AdminInvoice[]; pagination: Pagination }> {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  const response = await adminFetch<{ data: { invoices: AdminInvoice[]; pagination: Pagination } }>(
    `/invoices${query ? `?${query}` : ''}`
  );
  return response.data;
}

export async function searchInvoice(query: string): Promise<AdminInvoice[]> {
  const response = await adminFetch<{ data: AdminInvoice[] }>(`/invoices/search?q=${encodeURIComponent(query)}`);
  return response.data;
}

export async function sendInvoiceEmail(invoiceNumber: string, data: {
  email?: string;
  type?: 'RECEIPT' | 'INVOICE';
}): Promise<{ message: string; sentTo: string; sentAt: string }> {
  const response = await adminFetch<{ data: { message: string; sentTo: string; sentAt: string } }>(`/invoices/${invoiceNumber}/send-email`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

