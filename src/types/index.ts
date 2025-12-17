// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
  fields?: Record<string, string>;
  suggestion?: {
    productCode: string;
    productName: string;
    productSlug: string;
  };
}

// Region & Language
export interface Region {
  country: string;
  code: string;
  currency: string;
  image: string;
  isDefault: boolean;
}

export interface Language {
  country: string;
  code: string;
  name: string;
  image: string;
  isDefault: boolean;
}

// Contact
export interface Contact {
  email: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  x: string;
  youtube: string;
  telegram: string;
  discord: string;
}

// Popup
export interface Popup {
  title: string;
  content: string;
  image: string;
  href: string;
  isActive: boolean;
}

// Banner
export interface Banner {
  title: string;
  description: string;
  href: string;
  image: string;
  order: number;
}

// Category
export interface Category {
  title: string;
  code: string;
  description: string;
  icon: string;
  order: number;
}

// Product
export interface Product {
  code: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  publisher: string;
  thumbnail: string;
  banner: string;
  isPopular: boolean;
  isAvailable: boolean;
  tags: string[];
  category: {
    title: string;
    code: string;
  };
  features?: string[];
  howToOrder?: string[];
}

// Product Field
export interface ProductField {
  name: string;
  key: string;
  type: 'number' | 'text' | 'email' | 'select';
  label: string;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  pattern?: string;
  hint?: string;
  options?: { value: string; label: string }[];
}

// Section
export interface Section {
  title: string;
  code: string;
  icon: string;
  order: number;
}

// SKU
export interface SKU {
  code: string;
  name: string;
  description: string;
  currency: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  info: string;
  processTime: number;
  isAvailable: boolean;
  isFeatured: boolean;
  section: {
    title: string;
    code: string;
  };
  badge?: {
    text: string;
    color: string;
  };
  product?: {
    code: string;
    name: string;
    slug: string;
    thumbnail: string;
    title: string;
  };
}

// Account Validation
export interface AccountValidation {
  product: {
    name: string;
    code: string;
  };
  account: {
    region: string;
    nickname: string;
  };
}

// Payment Channel Category
export interface PaymentChannelCategory {
  title: string;
  code: string;
  icon: string;
  order: number;
}

// Payment Channel
export interface PaymentChannel {
  code: string;
  name: string;
  description: string;
  image: string;
  currency: string;
  feeAmount: number;
  feePercentage: number;
  minAmount: number;
  maxAmount: number;
  featured: boolean;
  instruction: string;
  category: {
    title: string;
    code: string;
  };
}

// Promo Code
export interface PromoCode {
  code: string;
  title: string;
  description: string;
  products: { code: string; name: string }[];
  paymentChannels: { code: string; name: string }[];
  daysAvailable: string[];
  maxDailyUsage: number;
  maxUsage: number;
  maxUsagePerId: number;
  maxUsagePerDevice: number;
  maxUsagePerIp: number;
  expiredAt: string;
  minAmount: number;
  maxPromoAmount: number;
  promoFlat: number;
  promoPercentage: number;
  isAvailable: boolean;
  note: string;
  totalUsage: number;
  totalDailyUsage: number;
}

// Order Inquiry Response
export interface OrderInquiry {
  validationToken: string;
  expiresAt: string;
  order: {
    product: {
      code: string;
      name: string;
    };
    sku: {
      code: string;
      name: string;
      quantity: number;
    };
    account: {
      nickname: string;
      userId: string;
      zoneId?: string;
    };
    payment: {
      code: string;
      name: string;
      currency: string;
    };
    pricing: {
      subtotal: number;
      discount: number;
      paymentFee: number;
      total: number;
    };
    promo?: {
      code: string;
      discountAmount: number;
    };
    contact: {
      email: string;
      phoneNumber: string;
    };
  };
}

// Deposit Inquiry Response
export interface DepositInquiry {
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
}

// Order
export interface Order {
  account: {
    nickname: string;
    userId: string;
    zoneId?: string;
    inputs?: string;
  };
  contact: {
    phoneNumber: string;
    email?: string;
  };
  createdAt: string;
  expiredAt: string;
  invoiceNumber: string;
  paidAt?: string;
  completedAt?: string; // Kept for compatibility if needed, though not in new JSON
  payment: {
    code: string;
    expiredAt: string;
    image: string;
    name: string;
    paidAt?: string;

    // New fields
    paymentType?: 'QRIS' | 'E_WALLET' | 'VIRTUAL_ACCOUNT' | 'RETAIL';
    paymentCode?: string; // Contains QR string, deeplink URL, VA number, or Retail payment code
    instructions?: string[];
    categoryCode?: string;

    // Legacy fields that might still be needed or can be derived/optional
    instruction?: string;
    qrCode?: string;
    qrString?: string;
    accountNumber?: string;
    bankName?: string;
    accountName?: string;
    redirectUrl?: string;
    deeplink?: string;
    retailCode?: string;
    retailName?: string;
  };
  pricing: {
    currency: string;
    discount: number;
    paymentFee: number;
    subtotal: number;
    total: number;
  };
  product: {
    code: string;
    image: string; // New field
    name: string; // New field
  };
  quantity: number;
  serialNumber?: string; // New field
  sku: {
    code: string;
    image: string;
    name: string;
  };
  status: {
    paymentStatus: 'UNPAID' | 'PAID' | 'EXPIRED' | 'REFUNDED' | 'FAILED';
    transactionStatus: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  };
  timeline: {
    message: string;
    status: string;
    timestamp: string;
  }[];

  // Legacy flat fields to remove eventually or keep optional if referenced elsewhere temporarily
  productCode?: string;
  productName?: string;
  skuCode?: string;
  skuName?: string;
  paymentStatus?: 'UNPAID' | 'PAID' | 'EXPIRED' | 'REFUNDED' | 'FAILED'; // Legacy flat
  //   status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'CANCELLED'; // Legacy flat - CONFLICT
}

// Invoice type currently follows Order structure as per docs usage on invoice page
export type Invoice = Order;

// User
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  profilePicture: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  primaryRegion: string;
  currentRegion: string;
  currency: string;
  balance: {
    IDR: number;
    MYR: number;
    PHP: number;
    SGD: number;
    THB: number;
  };
  membership: {
    level: 'CLASSIC' | 'PRESTIGE' | 'ROYAL';
    name: string;
    benefits?: string[];
    progress?: {
      current: number;
      target: number;
      percentage: number;
      nextLevel: string;
      currency: string;
    };
  };
  mfaStatus: 'ACTIVE' | 'INACTIVE';
  emailVerifiedAt?: string;
  createdAt: string;
  lastLoginAt?: string;
  updatedAt?: string;
  googleId?: string;
}

// Auth Token
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

// Login Response
export interface LoginResponse {
  step: 'SUCCESS' | 'MFA_VERIFICATION' | 'EMAIL_VERIFICATION';
  token?: AuthToken;
  user?: User;
  mfaToken?: string;
  expiresAt?: string;
}

// Register Response
export interface RegisterResponse {
  step: 'SUCCESS' | 'EMAIL_VERIFICATION';
  token?: AuthToken;
  user?: User;
}

// Transaction
export interface Transaction {
  invoiceNumber: string;
  status: {
    payment: 'UNPAID' | 'PAID' | 'EXPIRED' | 'REFUNDED' | 'FAILED';
    transaction: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  };
  product: {
    code: string;
    name: string;
  };
  sku: {
    code: string;
    name: string;
  };
  quantity: number;
  account: {
    nickname: string;
    inputs: string;
  };
  pricing: {
    subtotal: number;
    discount: number;
    paymentFee: number;
    total: number;
    currency: string;
  };
  payment: {
    code: string;
    name: string;
  };
  createdAt: string;
}

export interface TransactionOverview {
  totalTransaction: number;
  totalPurchase: number;
  success: number;
  processing: number;
  pending: number;
  failed: number;
}

// Mutation
export interface Mutation {
  invoiceNumber: string;
  description: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  balanceBefore: number;
  balanceAfter: number;
  currency: string;
  createdAt: string;
}

export interface MutationOverview {
  totalDebit: number;
  totalCredit: number;
  netBalance: number;
  transactionCount: number;
}

// Report
export interface Report {
  date: string;
  totalTransactions: number;
  totalAmount: number;
  currency: string;
}

export interface ReportOverview {
  totalDays: number;
  totalTransactions: number;
  totalAmount: number;
  averagePerDay: number;
  highestDay: {
    date: string;
    amount: number;
  };
  lowestDay: {
    date: string;
    amount: number;
  };
}

// Deposit
export interface Deposit {
  id: string;
  invoiceNumber: string;
  amount: number;
  paymentFee: number;
  total: number;
  currency: string;
  status: 'SUCCESS' | 'PENDING' | 'EXPIRED' | 'FAILED';
  payment: {
    code: string;
    name: string;
    // Invoice details
    paymentCode?: string;
    qrString?: string;
    instructions?: string[]; // Array of strings for instructions
    instruction?: string; // Legacy single string
    redirectUrl?: string;
    accountNumber?: string;
    paymentType?: string;
    expiredAt?: string;
    image?: string;
  };
  timeline?: {
    status: string;
    message: string;
    timestamp: string;
  }[];
  createdAt: string;
  expiredAt: string;
  paidAt?: string;
}

export interface DepositOverview {
  totalDeposits: number;
  totalAmount: number;
  successCount: number;
  pendingCount: number;
  failedCount: number;
}

// Pagination
export interface Pagination {
  limit: number;
  page: number;
  totalRows: number;
  totalPages: number;
}


// Reviews
export interface Review {
  rating: number;
  comment: string;
  invoiceNumber: string;
  fullName: string | null;
  phoneNumber: string;
  productName: string;
  skuName: string;
  createdAt: string;
}

export interface ReviewStats {
  rating: number;
  totalReviews: string; // e.g., "54.80jt"
}

export interface ReviewParams {
  limit?: number;
  page?: number;
  region?: string;
  productCode?: string;
}

export interface ReviewPayload {
  rating: number;
  comment: string;
  invoiceNumber: string;
}
