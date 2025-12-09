import {
  ApiResponse,
  Region,
  Language,
  Contact,
  Popup,
  Banner,
  Category,
  Product,
  ProductField,
  Section,
  SKU,
  AccountValidation,
  PaymentChannelCategory,
  PaymentChannel,
  PromoCode,
  OrderInquiry,
  Order,
  Invoice,
  User,
  LoginResponse,
  RegisterResponse,
  Transaction,
  TransactionOverview,
  Mutation,
  MutationOverview,
  Report,
  ReportOverview,
  Deposit,
  DepositOverview,
  Pagination,
  AuthToken,
} from '@/types';

// API Configuration
// Set NEXT_PUBLIC_API_ENDPOINT in .env file
// Development: http://localhost:8080
// Production: https://gateway.gate.co.id
const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://gateway.gate.co.id';
const API_VERSION = '/v2';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${API_VERSION}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    const json = await response.json();
    return json;
  } catch (error) {
    return {
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to connect to server',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

// Public Endpoints
export async function getRegions(): Promise<ApiResponse<Region[]>> {
  return fetchAPI<Region[]>('/regions');
}

export async function getLanguages(): Promise<ApiResponse<Language[]>> {
  return fetchAPI<Language[]>('/languages');
}

export async function getContacts(): Promise<ApiResponse<Contact>> {
  return fetchAPI<Contact>('/contacts');
}

export async function getPopups(region: string): Promise<ApiResponse<Popup>> {
  return fetchAPI<Popup>(`/popups?region=${region}`);
}

export async function getBanners(region: string): Promise<ApiResponse<Banner[]>> {
  return fetchAPI<Banner[]>(`/banners?region=${region}`);
}

// Product Endpoints
export async function getCategories(region: string): Promise<ApiResponse<Category[]>> {
  return fetchAPI<Category[]>(`/categories?region=${region}`);
}

export async function getProducts(
  region: string,
  categoryCode?: string,
  productCode?: string
): Promise<ApiResponse<Product[] | Product>> {
  let url = `/products?region=${region}`;
  if (categoryCode) url += `&categoryCode=${categoryCode}`;
  if (productCode) url += `&productCode=${productCode}`;
  return fetchAPI<Product[] | Product>(url);
}

export async function getPopularProducts(region: string): Promise<ApiResponse<Product[]>> {
  return fetchAPI<Product[]>(`/populars?region=${region}`);
}

export async function getProductFields(
  region: string,
  productCode: string
): Promise<ApiResponse<ProductField[]>> {
  return fetchAPI<ProductField[]>(`/fields?region=${region}&productCode=${productCode}`);
}

export async function getSections(
  region: string,
  productCode: string
): Promise<ApiResponse<Section[]>> {
  return fetchAPI<Section[]>(`/sections?region=${region}&productCode=${productCode}`);
}

export async function getSKUs(
  region: string,
  productCode: string,
  sectionCode?: string
): Promise<ApiResponse<SKU[]>> {
  let url = `/skus?region=${region}&productCode=${productCode}`;
  if (sectionCode) url += `&sectionCode=${sectionCode}`;
  return fetchAPI<SKU[]>(url);
}

export async function getPromoSKUs(region: string): Promise<ApiResponse<SKU[]>> {
  return fetchAPI<SKU[]>(`/sku/promos?region=${region}`);
}

// Transaction Endpoints
export async function validateAccount(
  data: Record<string, string>,
  token?: string
): Promise<ApiResponse<AccountValidation>> {
  return fetchAPI<AccountValidation>('/account/inquiries', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

export async function getPaymentChannelCategories(
  region: string,
  paymentType: 'purchase' | 'deposit'
): Promise<ApiResponse<PaymentChannelCategory[]>> {
  return fetchAPI<PaymentChannelCategory[]>(
    `/payment-channel/categories?region=${region}&paymentType=${paymentType}`
  );
}

export async function getPaymentChannels(
  region: string,
  paymentType: 'purchase' | 'deposit',
  categoryCode?: string
): Promise<ApiResponse<PaymentChannel[]>> {
  let url = `/payment-channels?region=${region}&paymentType=${paymentType}`;
  if (categoryCode) url += `&categoryCode=${categoryCode}`;
  return fetchAPI<PaymentChannel[]>(url);
}

export async function getPromoCodes(
  region: string,
  productCode: string
): Promise<ApiResponse<PromoCode[]>> {
  return fetchAPI<PromoCode[]>(`/promos?region=${region}&productCode=${productCode}`);
}

export async function validatePromoCode(
  data: Record<string, string>
): Promise<
  ApiResponse<{
    promoCode: string;
    discountAmount: number;
    originalAmount: number;
    finalAmount: number;
    promoDetails: {
      title: string;
      promoPercentage: number;
      maxPromoAmount: number;
    };
  }>
> {
  return fetchAPI('/promos/validate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createOrderInquiry(
  data: Record<string, unknown>,
  token?: string
): Promise<ApiResponse<OrderInquiry>> {
  return fetchAPI<OrderInquiry>('/orders/inquiries', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

export async function createOrder(
  validationToken: string,
  token?: string
): Promise<ApiResponse<{ step: string; order: Order }>> {
  return fetchAPI<{ step: string; order: Order }>('/orders', {
    method: 'POST',
    body: JSON.stringify({ validationToken }),
    token,
  });
}

export async function getInvoice(invoiceNumber: string): Promise<ApiResponse<Order>> {
  return fetchAPI<Order>(`/invoices?invoiceNumber=${invoiceNumber}`);
}

// Detailed Invoice (supports optional region and auth token)
export async function getInvoiceDetails(
  invoiceNumber: string,
  region?: string,
  token?: string
): Promise<ApiResponse<Invoice>> {
  const search = new URLSearchParams({ invoiceNumber });
  if (region) search.set('region', region);
  const url = `/invoices?${search.toString()}`;
  return fetchAPI<Invoice>(url, { token });
}

// Auth Endpoints
export async function register(
  data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
  },
  region?: string
): Promise<ApiResponse<RegisterResponse>> {
  const url = region ? `/auth/register?region=${region}` : '/auth/register';
  return fetchAPI<RegisterResponse>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function registerWithGoogle(
  idToken: string,
  region?: string
): Promise<ApiResponse<RegisterResponse>> {
  const url = region ? `/auth/register/google?region=${region}` : '/auth/register/google';
  return fetchAPI<RegisterResponse>(url, {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
}

export async function verifyEmail(
  token: string
): Promise<ApiResponse<{ message: string }>> {
  return fetchAPI<{ message: string }>('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export async function resendVerification(email: string): Promise<ApiResponse<{ message: string }>> {
  return fetchAPI<{ message: string }>('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function login(
  email: string,
  password: string,
  region?: string
): Promise<ApiResponse<LoginResponse>> {
  const url = region ? `/auth/login?region=${region}` : '/auth/login';
  return fetchAPI<LoginResponse>(url, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function loginWithGoogle(
  idToken: string,
  region?: string
): Promise<ApiResponse<LoginResponse>> {
  const url = region ? `/auth/login/google?region=${region}` : '/auth/login/google';
  return fetchAPI<LoginResponse>(url, {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
}

export async function verifyMFA(
  mfaToken: string,
  code: string
): Promise<ApiResponse<LoginResponse>> {
  return fetchAPI<LoginResponse>('/auth/verify-mfa', {
    method: 'POST',
    body: JSON.stringify({ mfaToken, code }),
  });
}

export async function forgotPassword(
  email: string,
  region?: string
): Promise<ApiResponse<{ message: string }>> {
  const url = region ? `/auth/forgot-password?region=${region}` : '/auth/forgot-password';
  return fetchAPI<{ message: string }>(url, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(
  token: string,
  newPassword: string,
  confirmPassword: string
): Promise<ApiResponse<{ message: string }>> {
  return fetchAPI<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword, confirmPassword }),
  });
}

export async function enableMFA(token: string): Promise<
  ApiResponse<{
    step: string;
    qrCode: string;
    qrCodeImage: string;
    secret: string;
    backupCodes: string[];
  }>
> {
  return fetchAPI('/auth/mfa/enable', {
    method: 'POST',
    token,
  });
}

export async function verifyMFASetup(
  code: string,
  token: string
): Promise<ApiResponse<{ step: string; message: string; mfaStatus: string }>> {
  return fetchAPI('/auth/mfa/verify-setup', {
    method: 'POST',
    body: JSON.stringify({ code }),
    token,
  });
}

export async function disableMFA(
  code: string,
  password: string,
  token: string
): Promise<ApiResponse<{ message: string; mfaStatus: string }>> {
  return fetchAPI('/auth/mfa/disable', {
    method: 'POST',
    body: JSON.stringify({ code, password }),
    token,
  });
}

export async function refreshToken(
  refreshTokenValue: string
): Promise<ApiResponse<AuthToken>> {
  return fetchAPI<AuthToken>('/auth/refresh-token', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  });
}

export async function logout(token: string): Promise<ApiResponse<{ message: string }>> {
  return fetchAPI<{ message: string }>('/auth/logout', {
    method: 'POST',
    token,
  });
}

// User Endpoints
export async function getUserProfile(
  token: string,
  region?: string
): Promise<ApiResponse<User>> {
  const url = region ? `/user/profile?region=${region}` : '/user/profile';
  return fetchAPI<User>(url, { token });
}

export async function updateUserProfile(
  data: FormData,
  token: string
): Promise<ApiResponse<User>> {
  const response = await fetch(`${API_BASE_URL}${API_VERSION}/user/profile`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });
  return response.json();
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
  token: string
): Promise<ApiResponse<{ message: string }>> {
  return fetchAPI<{ message: string }>('/user/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    token,
  });
}

// Dashboard Endpoints
export async function getTransactions(
  token: string,
  params: {
    region?: string;
    limit?: number;
    page?: number;
    search?: string;
    status?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<
  ApiResponse<{
    overview: TransactionOverview;
    transactions: Transaction[];
    pagination: Pagination;
  }>
> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });
  const url = `/transactions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  return fetchAPI(url, { token });
}

export async function getMutations(
  token: string,
  params: {
    region?: string;
    limit?: number;
    page?: number;
    search?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<
  ApiResponse<{
    overview: MutationOverview;
    mutations: Mutation[];
    pagination: Pagination;
  }>
> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });
  const url = `/mutations${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  return fetchAPI(url, { token });
}

export async function getReports(
  token: string,
  params: {
    region?: string;
    limit?: number;
    page?: number;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<
  ApiResponse<{
    overview: ReportOverview;
    reports: Report[];
    pagination: Pagination;
  }>
> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });
  const url = `/reports${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  return fetchAPI(url, { token });
}

export async function getDeposits(
  token: string,
  params: {
    region?: string;
    limit?: number;
    page?: number;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<
  ApiResponse<{
    overview: DepositOverview;
    deposits: Deposit[];
    pagination: Pagination;
  }>
> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });
  const url = `/deposits${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  return fetchAPI(url, { token });
}

export async function createDepositInquiry(
  data: { amount: number; paymentCode: string },
  token: string,
  region?: string
): Promise<
  ApiResponse<{
    validationToken: string;
    expiresAt: string;
    deposit: {
      amount: number;
      pricing: {
        subtotal: number;
        paymentFee: number;
        total: number;
        currency: string;
      };
      payment: {
        code: string;
        name: string;
        currency: string;
        minAmount: number;
        maxAmount: number;
        feeAmount: number;
        feePercentage: number;
      };
    };
  }>
> {
  const url = region ? `/deposits/inquiries?region=${region}` : '/deposits/inquiries';
  return fetchAPI(url, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

export async function createDeposit(
  validationToken: string,
  token: string
): Promise<ApiResponse<{ step: string; deposit: Deposit }>> {
  return fetchAPI('/deposits', {
    method: 'POST',
    body: JSON.stringify({ validationToken }),
    token,
  });
}

