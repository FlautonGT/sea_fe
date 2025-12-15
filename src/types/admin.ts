// Admin Types

export interface AdminRole {
  code: string;
  name: string;
  level: number;
  permissions?: string[];
  description?: string;
  adminCount?: number;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: AdminRole;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  createdBy?: {
    id: string;
    name: string;
  } | null;
}

export interface AdminLoginResponse {
  // SUCCESS response - has token object and admin
  token?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  };
  admin?: {
    id: string;
    name: string;
    email: string;
    role: {
      code: string;
      name: string;
    };
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    lastLoginAt?: string;
  };
  // MFA_VERIFICATION response - has step field
  step?: 'MFA_VERIFICATION';
  mfaToken?: string;
  expiresAt?: string;
}

export interface Provider {
  id: string;
  code: string;
  name: string;
  baseUrl: string;
  webhookUrl: string;
  isActive: boolean;
  priority: number;
  supportedTypes: string[];
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  lastHealthCheck: string;
  stats: {
    totalSkus: number;
    activeSkus: number;
    successRate: number;
    avgResponseTime: number;
    todayTransactions?: number;
    todaySuccessRate?: number;
  };
  apiConfig?: {
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  credentials?: {
    hasUsername?: boolean;
    hasApiKey?: boolean;
    hasWebhookSecret?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaymentGateway {
  id: string;
  code: string;
  name: string;
  baseUrl: string;
  callbackUrl?: string;
  isActive: boolean;
  supportedMethods: string[];
  supportedTypes: ('purchase' | 'deposit')[];
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  lastHealthCheck: string;
  stats: {
    todayTransactions: number;
    todayVolume: number;
    successRate: number;
    avgResponseTime?: number;
  };
  feeConfig?: Record<string, {
    feeType: 'FIXED' | 'PERCENTAGE';
    feeAmount: number;
    feePercentage: number;
    minFee: number;
    maxFee: number;
  }>;
  credentials?: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTransaction {
  id: string;
  invoiceNumber: string;
  status: 'SUCCESS' | 'PROCESSING' | 'PENDING' | 'FAILED';
  paymentStatus: 'PAID' | 'UNPAID' | 'EXPIRED';
  product: {
    code: string;
    name: string;
  };
  sku: {
    code: string;
    name: string;
  };
  provider: {
    code: string;
    name: string;
    refId?: string;
    serialNumber?: string;
    logs?: {
      type: string;
      data: any;
      timestamp: string;
    }[];
  };
  account: {
    nickname?: string;
    inputs: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  pricing: {
    buyPrice: number;
    sellPrice: number;
    discount: number;
    paymentFee: number;
    total: number;
    profit: number;
    currency: string;
  };
  payment: {
    code: string;
    name: string;
    gateway: string;
    gatewayRefId?: string;
    paidAt?: string;
    logs?: {
      type: string;
      data: any;
      timestamp: string;
    }[];
  };
  promo?: {
    code: string;
    discountAmount: number;
  };
  region: string;
  ipAddress: string;
  userAgent?: string;
  createdAt: string;
  completedAt?: string;
  timeline?: {
    status: string;
    message: string;
    timestamp: string;
  }[];
  logs?: {
    type: string;
    data: any;
    timestamp: string;
  }[];
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePicture?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  primaryRegion: string;
  membership: {
    level: string;
    name: string;
  };
  balance: Record<string, number>;
  stats: {
    totalTransactions: number;
    totalSpent: number;
    lastTransactionAt?: string;
  };
  createdAt: string;
  lastLoginAt?: string;
}

export interface AdminPromo {
  id: string;
  code: string;
  title: string;
  description: string;
  products: string[];
  paymentChannels: string[];
  regions: string[];
  daysAvailable?: string[];
  maxDailyUsage: number;
  maxUsage: number;
  maxUsagePerId: number;
  maxUsagePerDevice: number;
  maxUsagePerIp: number;
  startAt: string;
  expiredAt: string;
  minAmount: number;
  maxPromoAmount: number;
  promoFlat: number;
  promoPercentage: number;
  isActive: boolean;
  note?: string;
  currentUsage?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminBanner {
  id: string;
  title: string;
  description?: string;
  href: string;
  image: string;
  regions: string[];
  order: number;
  isActive: boolean;
  startAt?: string;
  expiredAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminPopup {
  id: string;
  region: string;
  title: string;
  content: string;
  image: string;
  href: string;
  isActive: boolean;
  createdAt: string;
}

export interface DashboardOverview {
  summary: {
    totalRevenue: number;
    totalProfit: number;
    totalTransactions: number;
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
  };
  revenueChart: Array<{
    date: string;
    revenue: number;
    profit: number;
  }>;
  topProducts: Array<{
    code: string;
    name: string;
    revenue: number;
    transactions: number;
  }>;
  topPayments: Array<{
    code: string;
    name: string;
    revenue: number;
    transactions: number;
  }>;
  providerHealth: Array<{
    code: string;
    status: string;
    successRate: number;
  }>;
}

export interface AuditLog {
  id: string;
  admin: {
    id: string;
    name: string;
    email: string;
  };
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  resource: string;
  resourceId: string;
  description: string;
  changes?: {
    before: any;
    after: any;
  };
  ipAddress: string;
  userAgent?: string;
  createdAt: string;
}

export interface AdminDeposit {
  id: string;
  invoiceNumber: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'PENDING' | 'EXPIRED' | 'FAILED';
  payment: {
    code: string;
    name: string;
    gateway: string;
    gatewayRefId?: string;
    accountNumber?: string;
  };
  region: string;
  ipAddress: string;
  createdAt: string;
  paidAt?: string;
  expiredAt?: string;
}

export interface AdminProduct {
  id: string;
  code: string;
  slug: string;
  title: string;
  subtitle?: string;
  publisher?: string;
  thumbnail: string;
  category: {
    code: string;
    title: string;
  };
  isActive: boolean;
  isPopular: boolean;
  inquirySlug?: string;
  regions: string[];
  skuCount: number;
  stats?: {
    todayTransactions: number;
    todayRevenue: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdminSKU {
  image?: string;
  id: string;
  code: string;
  providerSkuCode: string;
  name: string;
  description?: string;
  product: {
    code: string;
    title: string;
  };
  provider: {
    code: string;
    name: string;
  };
  pricing: Record<string, {
    currency: string;
    buyPrice: number;
    sellPrice: number;
    originalPrice: number;
    margin: number;
    discount: number;
  }>;
  section?: {
    code: string;
    title: string;
  };
  isActive: boolean;
  isFeatured: boolean;
  info?: string;
  badge?: {
    text: string;
    color: string;
  };
  processTime: number;
  stock: 'AVAILABLE' | 'OUT_OF_STOCK' | 'LIMITED';
  stats?: {
    todaySold: number;
    totalSold: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdminRegion {
  id: string;
  code: string;
  country: string;
  currency: string;
  currencySymbol: string;
  image?: string;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  stats?: {
    totalUsers: number;
    totalTransactions: number;
    totalRevenue: number;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface AdminLanguage {
  id: string;
  code: string;
  name: string;
  country: string;
  image?: string;
  isDefault: boolean;
  isActive: boolean;
  sortOrder?: number;
  order?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminCategory {
  id: string;
  code: string;
  title: string;
  description?: string;
  icon: string;
  isActive: boolean;
  order: number;
  regions: string[];
  productCount: number;
  stats?: {
    totalTransactions: number;
    totalRevenue: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdminSection {
  id: string;
  code: string;
  title: string;
  icon: string;
  isActive: boolean;
  order: number;
  products: string[];
  skuCount: number;
  createdAt: string;
}

export interface AdminPaymentChannelCategory {
  id: string;
  code: string;
  title: string;
  icon?: string;
  order: number;
  channelCount?: number;
  updatedAt?: string;
}

export interface AdminPaymentChannel {
  id: string;
  code: string;
  name: string;
  description?: string;
  image: string;
  category?: {
    code: string;
    title: string;
  };
  fee: {
    feeType: 'FIXED' | 'PERCENTAGE' | 'MIXED';
    feeAmount: number;
    feePercentage: number;
  };
  limits: {
    minAmount: number;
    maxAmount: number;
  };
  regions: string[];
  supportedTypes: ('purchase' | 'deposit')[];
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  instruction?: string;
  stats?: {
    todayTransactions: number;
    todayVolume: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdminSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    maintenanceMessage?: string;
  };
  transaction: {
    orderExpiry: number;
    autoRefundOnFail: boolean;
    maxRetryAttempts: number;
  };
  notification: {
    emailEnabled: boolean;
    whatsappEnabled: boolean;
    telegramEnabled: boolean;
  };
  security: {
    maxLoginAttempts: number;
    lockoutDuration: number;
    sessionTimeout: number;
    mfaRequired: boolean;
  };
}

export interface Pagination {
  limit: number;
  page: number;
  totalRows: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

