'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { addToFavorites } from '@/lib/favorites';
import { saveLocalTransaction } from '@/lib/localHistory';
import { Zap, Clock, Shield, Tag, ChevronDown, ChevronUp, Mail, Minus, Plus, AlertCircle, History, TicketPercent } from 'lucide-react';
import { saveRecentAccount, getRecentAccounts, SavedAccount } from '@/lib/recentAccounts';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import { Input, Button, SKUCard, LoadingPage } from '@/components/ui';
import { StepSection } from '@/components/ui/StepSection';
import { AnimatedFailed } from '@/components/ui/AnimatedIcons';
import PhoneInput from '@/components/ui/PhoneInput';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { formatCurrency, cn, validateEmail } from '@/lib/utils';
import {
  Product,
  ProductField,
  Section,
  SKU,
  PaymentChannel,
  PaymentChannelCategory,
  AccountValidation,
  OrderInquiry,
  PromoCode,
  User,
} from '@/types';
import {
  getProducts,
  getProductFields,
  getSections,
  getSKUs,
  getPaymentChannelCategories,
  getPaymentChannels,
  validateAccount,
  createOrderInquiry,
  createOrder,
  getPromoCodes,
  validatePromoCode,
} from '@/lib/api';
import OrderConfirmationModal from '@/components/modals/OrderConfirmationModal';
import PromoModal from '@/components/modals/PromoModal';
import LoginModal from '@/components/auth/LoginModal';
import { Review, ReviewStats } from '@/types';
import { getReviews } from '@/lib/api';
import { ReviewList } from '@/components/reviews/ReviewList';
import { Star } from 'lucide-react';
// Metadata logic moved to layout.tsx

// Order Summary Component
function OrderSummary({
  product,
  sku,
  paymentChannel,
  promoDiscount,
  accountData,
  currency,
  canOrder,
  isLoading,
  orderError,
  onOrder,
  quantity,
}: {
  product: Product | null;
  sku: SKU | null;
  paymentChannel: PaymentChannel | null;
  promoDiscount: number;
  accountData: AccountValidation | null;
  currency: string;
  canOrder: boolean;
  isLoading: boolean;
  orderError?: string;
  onOrder: () => void;
  quantity: number;
}) {
  const { t, language } = useTranslation();
  // Import AnimatedIcons dynamically or assume it's available in scope if imported at top
  // For safety in this file refactor, we usually expect imports at top. 
  // We'll use the AnimatedFailed from imports. 
  // Note: We need to make sure AnimatedFailed is imported in the main file.

  // Note: We need to make sure AnimatedFailed is imported in the main file.

  const subtotal = (sku?.price || 0) * quantity;
  const paymentFee = paymentChannel
    ? paymentChannel.feeAmount + (subtotal * paymentChannel.feePercentage) / 100
    : 0;
  const total = subtotal - promoDiscount + paymentFee;

  return (
    <div className="">
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl ring-1 ring-black/5">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            {`${t('orderSummary')}`}
          </h3>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!accountData && !sku ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {language === 'id' ? 'Belum ada pesanan' : 'No order yet'}
              </p>
              <p className="text-xs text-gray-500 max-w-[200px] mx-auto">
                {language === 'id' ? 'Silahkan lengkapi data akun dan pilih item terlebih dahulu' : 'Please complete account data and select item first'}
              </p>
            </div>
          ) : (
            <>
              {/* Product Info */}
              <div className="flex items-start gap-4">
                {product && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 shrink-0">
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white truncate">
                    {product?.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {sku?.name || (language === 'id' ? 'Belum pilih item' : 'No item selected')}
                  </p>
                  {accountData && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-xs font-medium text-green-600 dark:text-green-400 truncate">
                        {accountData.account.nickname}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                {paymentChannel && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{language === 'id' ? 'Metode' : 'Method'}</span>
                    <span className="font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                      {paymentChannel.name}
                    </span>
                  </div>
                )}

                {sku && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{language === 'id' ? 'Harga' : 'Price'}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(subtotal, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{language === 'id' ? 'Jumlah' : 'Qty'}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {quantity}x
                      </span>
                    </div>
                  </>
                )}

                {paymentFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{language === 'id' ? 'Biaya Admin' : 'Admin Fee'}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(Math.round(paymentFee), currency)}
                    </span>
                  </div>
                )}

                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                    <span className="font-medium">{language === 'id' ? 'Diskon' : 'Discount'}</span>
                    <span className="font-bold">-{formatCurrency(promoDiscount, currency)}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {language === 'id' ? 'Total Bayar' : 'Total'}
                  </span>
                  <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400 leading-none">
                    {paymentChannel ? formatCurrency(Math.round(total), currency) : 'Rp 0'}
                  </span>
                </div>
              </div>
            </>
          )}

          <Button
            onClick={onOrder}
            fullWidth
            disabled={!canOrder}
            isLoading={isLoading}
            className={cn(
              "h-12 font-bold shadow-lg shadow-primary-500/20 transition-all",
              canOrder
                ? "hover:shadow-primary-500/40 hover:-translate-y-0.5"
                : "opacity-50 cursor-not-allowed"
            )}
          >
            {isLoading ? (language === 'id' ? 'Memproses...' : 'Processing...') : (language === 'id' ? 'Pesan Sekarang' : 'Order Now')}
          </Button>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-4 flex justify-center gap-4 text-gray-400 grayscale opacity-60">
        {/* Could add icons here if needed */}
      </div>
    </div>
  );
}

// Payment Category Component
function PaymentCategorySection({
  category,
  channels,
  selectedChannel,
  onSelect,
  isExpanded,
  onToggle,
  amount,
  currency,
  user,
  isLoggedIn,
  onLogin,
  locale,
}: {
  category: PaymentChannelCategory;
  channels: PaymentChannel[];
  selectedChannel: PaymentChannel | null;
  onSelect: (channel: PaymentChannel) => void;
  isExpanded: boolean;
  onToggle: () => void;
  amount: number;
  currency: string;
  user: User | null;
  isLoggedIn: boolean;
  onLogin: () => void;
  locale: string;
}) {
  const categoryChannels = channels.filter((ch) => {
    if (category.code === '') {
      return !ch.category || !ch.category.code;
    }
    return ch.category?.code === category.code;
  });

  if (categoryChannels.length === 0) return null;

  // Show featured channels (max 3)
  const previewChannels = categoryChannels
    .filter((ch) => ch.featured)
    .slice(0, 3);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-3 py-2 md:px-4 md:py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <span className="font-medium text-sm md:text-base text-gray-900 dark:text-white">
          {category.title}
        </span>
        <div className="flex items-center gap-2 md:gap-3">
          {!isExpanded && previewChannels.length > 0 && (
            <div className="flex items-center gap-2 md:gap-3">
              {previewChannels.map((ch) => (
                <div key={ch.code} className="relative h-4 w-auto md:h-5">
                  <Image
                    src={ch.image}
                    alt={ch.name}
                    width={28}
                    height={20}
                    className="h-full w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-2 md:p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 md:gap-3">
            {categoryChannels.map((channel) => {
              const isSelected = selectedChannel?.code === channel.code;
              const fee = channel.feeAmount + (amount * channel.feePercentage) / 100;
              const totalWithFee = amount + fee;

              // BALANCE Logic
              const isBalance = channel.code === 'BALANCE';
              let isDisabled = false;
              let statusLabel = null;
              let balanceAmount = 0;

              if (isBalance) {
                if (!isLoggedIn) {
                  isDisabled = true;
                  statusLabel = (
                    <div className="mt-2 w-full">
                      <Button size="sm" variant="outline" className="w-full h-7 text-xs" onClick={(e) => {
                        e.stopPropagation();
                        onLogin();
                      }}>
                        Login
                      </Button>
                    </div>
                  );
                } else if (user) {
                  // Check balance
                  // Assuming balance is in IDR for now, or match currency
                  // API User type: balance: { IDR: number, ... }
                  balanceAmount = user.balance?.[currency as keyof typeof user.balance] || 0;
                  if (balanceAmount < totalWithFee) {
                    isDisabled = true;
                    statusLabel = (
                      <span className="text-[9px] text-red-500 font-bold mt-1 text-center">
                        {locale === 'id' ? 'Saldo Kurang' : 'Insufficient Balance'} ({formatCurrency(balanceAmount, currency)})
                      </span>
                    );
                  } else {
                    statusLabel = (
                      <span className="text-[10px] text-green-600 font-medium mt-0.5">
                        {locale === 'id' ? 'Saldo:' : 'Balance:'} {formatCurrency(balanceAmount, currency)}
                      </span>
                    );
                  }
                }
              } else {
                // Standard Check
                const isAvailable = amount > 0 ? (totalWithFee >= channel.minAmount && totalWithFee <= channel.maxAmount) : true;
                if (!isAvailable) {
                  isDisabled = true;
                  statusLabel = (
                    <span className="text-[9px] text-red-500 font-bold mt-1 text-center">
                      {totalWithFee < channel.minAmount
                        ? `Min ${formatCurrency(channel.minAmount, currency)}`
                        : `Max ${formatCurrency(channel.maxAmount, currency)}`}
                    </span>
                  );
                }
              }


              return (
                <button
                  key={channel.code}
                  onClick={() => {
                    if (!isDisabled) onSelect(channel);
                  }}
                  disabled={isDisabled && !(!isLoggedIn && isBalance)} // Allow click if login needed (handled by button inside) or pure disabled
                  className={cn(
                    'relative flex flex-col items-center justify-between h-full p-2 rounded-lg border transition-all',
                    isSelected
                      ? 'border-primary-500 bg-white dark:bg-gray-800 ring-1 ring-primary-500 shadow-sm'
                      : 'border-transparent bg-white dark:bg-gray-800',
                    isDisabled && !(isBalance && !isLoggedIn)
                      ? 'opacity-50 cursor-not-allowed grayscale bg-gray-50'
                      : 'hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <Image
                    src={channel.image}
                    alt={channel.name}
                    width={36}
                    height={24}
                    className="h-5 md:h-7 w-auto object-contain mb-1.5"
                  />
                  <span className="text-[10px] md:text-xs text-center text-gray-500 dark:text-gray-400 leading-tight">
                    {amount === 0
                      ? `Min ${formatCurrency(channel.minAmount, currency)}`
                      : (totalWithFee < channel.minAmount || totalWithFee > channel.maxAmount)
                        ? null
                        : formatCurrency(Math.round(totalWithFee), currency)
                    }
                  </span>

                  {/* Status Label (Error, Balance, Login) */}
                  {statusLabel}

                  {isSelected && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-primary-500 rounded-full flex items-center justify-center">
                      <svg className="w-2 md:w-2.5 h-2 md:h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Main Product Detail Page
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const skuParam = searchParams.get('sku');

  const { user, token, refreshUser } = useAuth();
  const { regionCode, currency, getLocalizedPath, language } = useLocale();
  const { t } = useTranslation();

  // State
  const [product, setProduct] = useState<Product | null>(null);
  const [fields, setFields] = useState<ProductField[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [skus, setSkus] = useState<SKU[]>([]);
  const [paymentCategories, setPaymentCategories] = useState<PaymentChannelCategory[]>([]);
  const [paymentChannels, setPaymentChannels] = useState<PaymentChannel[]>([]);

  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedSKU, setSelectedSKU] = useState<SKU | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentChannel | null>(null);
  const [expandedPayment, setExpandedPayment] = useState<string>('');

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [accountData, setAccountData] = useState<AccountValidation | null>(null);
  const [accountError, setAccountError] = useState('');

  const [contactInfo, setContactInfo] = useState({
    phoneNumber: user?.phoneNumber || '',
    email: user?.email || '',
  });
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [availablePromos, setAvailablePromos] = useState<PromoCode[]>([]);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoadingPromos, setIsLoadingPromos] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderError, setOrderError] = useState('');
  // const [showConfirmModal, setShowConfirmModal] = useState(false); // Removed duplicate
  const [orderInquiryData, setOrderInquiryData] = useState<OrderInquiry | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isMobileSummaryExpanded, setIsMobileSummaryExpanded] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [recentAccounts, setRecentAccounts] = useState<SavedAccount[]>([]);
  const [showRecentAccounts, setShowRecentAccounts] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<'transaction' | 'reviews'>('transaction');


  // Debug: Monitor modal state changes
  useEffect(() => {
    if (showConfirmModal || orderInquiryData) {
      console.log('Modal state changed:', {
        showConfirmModal,
        hasOrderData: !!orderInquiryData,
        orderData: orderInquiryData,
      });
    }
  }, [showConfirmModal, orderInquiryData]);

  // Fetch product data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // First, get the product by slug
        const productsRes = await getProducts(regionCode);
        if (!productsRes.data || !Array.isArray(productsRes.data)) {
          router.push(getLocalizedPath('/404'));
          return;
        }

        const foundProduct = productsRes.data.find((p) => p.slug === slug);
        if (!foundProduct) {
          router.push(getLocalizedPath('/404'));
          return;
        }

        setProduct(foundProduct);

        // Fetch related data
        const [fieldsRes, sectionsRes, skusRes, paymentCatRes, paymentRes] =
          await Promise.all([
            getProductFields(regionCode, foundProduct.code),
            getSections(regionCode, foundProduct.code),
            getSKUs(regionCode, foundProduct.code),
            getPaymentChannelCategories(regionCode, 'purchase'),
            getPaymentChannels(regionCode, 'purchase'),
          ]);

        // Load recent accounts
        setRecentAccounts(getRecentAccounts(regionCode, foundProduct.code));

        if (fieldsRes.data) setFields(fieldsRes.data);
        if (sectionsRes.data) {
          setSections(sectionsRes.data);
          // Default to '' (All Items) - do not auto-select first section
          setSelectedSection('');
        }
        if (skusRes.data) {
          setSkus(skusRes.data);
          // Auto-select SKU if sku param is provided
          if (skuParam) {
            const preSelectedSku = skusRes.data.find((s: SKU) => s.code === skuParam);
            if (preSelectedSku) {
              setSelectedSKU(preSelectedSku);
              setSelectedSection(preSelectedSku.section.code);
            }
          }
        }
        if (paymentRes.data) setPaymentChannels(paymentRes.data);
        if (paymentCatRes.data) {
          setPaymentCategories(paymentCatRes.data);
          // Default collapsed (no auto-expand)
          setExpandedPayment('');
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      fetchData();
    }
  }, [slug, regionCode, router, getLocalizedPath, skuParam]);

  // Fetch Reviews
  useEffect(() => {
    async function fetchProductReviews() {
      if (!product) return;
      try {
        const res = await getReviews({
          productCode: product.code, // User wants productCode filter
          limit: 5, // Show small amount initial
          page: 1,
          region: 'ID'
        });
        if (res.data) {
          setReviews(res.data.reviews);
          setReviewStats(res.data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      }
    }
    if (product) {
      fetchProductReviews();
    }
  }, [product]);


  // Refresh user session on mount (to get latest balance)
  useEffect(() => {
    if (token) {
      refreshUser();
    }
  }, [token, refreshUser]);

  // Section Refs for Auto-scroll
  const accountSectionRef = useRef<HTMLDivElement>(null);
  const skuSectionRef = useRef<HTMLDivElement>(null);
  const quantitySectionRef = useRef<HTMLDivElement>(null); // Added Quantity Ref
  const paymentSectionRef = useRef<HTMLDivElement>(null);
  const contactSectionRef = useRef<HTMLDivElement>(null); // Added Contact Info Ref
  const promoSectionRef = useRef<HTMLDivElement>(null);

  // Auto-scroll helper
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      // Offset for sticky header/banner 
      const y = ref.current.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };
  useEffect(() => {
    if (user) {
      setContactInfo({
        phoneNumber: user.phoneNumber || '',
        email: user.email || '',
      });
    }
  }, [user]);

  // Field Validation Errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [createOrderError, setCreateOrderError] = useState(''); // Error specifically for the modal creation step

  // Validate account when fields are filled
  const handleValidateAccount = useCallback(async (valuesOverride?: Record<string, string>) => {
    const currentValues = valuesOverride || fieldValues;
    if (!product || fields.length === 0) return;

    // Check if all required fields are filled
    const requiredFields = fields.filter((f) => f.required);
    const allFilled = requiredFields.every(
      (f) => currentValues[f.key] && currentValues[f.key].trim() !== ''
    );

    if (!allFilled) {
      setAccountData(null);
      return;
    }

    setIsValidating(true);
    setAccountError('');

    try {
      const response = await validateAccount(
        {
          productCode: product.code,
          ...currentValues,
        },
        token?.accessToken
      );

      if (response.error) {
        // Map error codes to user-friendly messages
        const errorCode = response.error.code;
        let errorMessage = response.error.message;

        switch (errorCode) {
          case 'NOT_FOUND':
          case 'ACCOUNT_NOT_FOUND':
            errorMessage = language === 'id'
              ? 'Akun tidak ditemukan. Mohon periksa kembali User ID atau Server ID Anda.'
              : 'Account not found. Please check your User ID or Server ID.';
            break;
          case 'PRODUCT_NOT_FOUND':
            errorMessage = language === 'id'
              ? 'Produk tidak ditemukan atau sedang tidak aktif.'
              : 'Product not found or inactive.';
            break;
          case 'INQUIRY_NOT_CONFIGURED':
            errorMessage = language === 'id'
              ? 'Layanan validasi belum dikonfigurasi untuk produk ini, Mohon untuk menghubungi Support.'
              : 'Validation service not configured for this product, Please contact Support.';
            break;
          case 'INQUIRY_SERVICE_ERROR':
          case 'INQUIRY_RESPONSE_ERROR':
            errorMessage = language === 'id'
              ? 'Gangguan koneksi ke provider. Silakan coba beberapa saat lagi.'
              : 'Provider connection error. Please try again later.';
            break;
          case 'TOO_MANY_REQUESTS':
            errorMessage = language === 'id'
              ? 'Terlalu banyak permintaan. Mohon tunggu sebentar.'
              : 'Too many requests. Please wait a moment.';
            break;
          case 'INTERNAL_ERROR':
          case 'BAD_REQUEST':
            errorMessage = language === 'id'
              ? 'Terjadi kesalahan sistem. Silakan coba lagi.'
              : 'System error. Please try again.';
            if (errorCode === 'BAD_REQUEST' && response.error.message?.toLowerCase().includes('server')) {
              errorMessage = language === 'id' ? 'Server ID wajib diisi.' : 'Server ID is required.';
            }
            break;
        }

        setAccountError(errorMessage);
        setAccountData(null);
      } else if (response.data) {
        setAccountData(response.data);
        // Auto-scroll removed as per user request
        // setTimeout(() => scrollToSection(skuSectionRef), 100);
      }
    } catch (error) {
      console.error('Validation error:', error);
      setAccountError(language === 'id' ? 'Gagal memvalidasi akun' : 'Failed to validate account');
    } finally {
      setIsValidating(false);
    }
  }, [product, fields, fieldValues, token, language]);

  // Filter SKUs by section
  const filteredSKUs = selectedSection
    ? skus.filter((sku) => sku.section.code === selectedSection)
    : skus;

  // Load available promos
  useEffect(() => {
    async function loadPromos() {
      if (!product) return;
      setIsLoadingPromos(true);
      try {
        const res = await getPromoCodes(regionCode, product.code);
        if (res.data) {
          setAvailablePromos(res.data);
        }
      } catch (error) {
        console.error('Failed to load promos:', error);
      } finally {
        setIsLoadingPromos(false);
      }
    }
    loadPromos();
  }, [product, regionCode]);

  // Handle promo validation
  const handleValidatePromo = async () => {
    if (!canOrder) {
      toast.error(language === 'id' ? 'Lengkapi semua data diatas terlebih dahulu!' : 'Please complete all data above first!');
      return;
    }

    if (!promoCode.trim() || !selectedSKU || !product) return;

    setIsValidatingPromo(true);
    setPromoError('');
    setPromoDiscount(0);

    try {
      const res = await validatePromoCode({
        promoCode: promoCode.trim(),
        productCode: product.code,
        skuCode: selectedSKU.code,
        paymentCode: selectedPayment?.code || '',
        region: regionCode,
        account: fieldValues,
        quantity: quantity,
      });

      if (res.error) {
        // Map Error Codes (HTTP Errors)
        const errorCode = res.error.code;
        let errorMessage = res.error.message;

        switch (errorCode) {
          case 'BAD_REQUEST':
            errorMessage = language === 'id' ? 'Request tidak valid.' : 'Invalid request.';
            // Check for specific fields
            if (res.error.fields) {
              if (res.error.fields.promoCode) errorMessage = language === 'id' ? 'Kode promo wajib diisi.' : 'Promo code is required.';
              if (res.error.fields.account) errorMessage = language === 'id' ? 'Data akun tidak valid/kurang lengkap.' : 'Invalid or incomplete account data.';
            }
            break;
          case 'VALIDATION_ERROR':
            errorMessage = language === 'id' ? 'Validasi gagal. Coba cek kembali data Anda.' : 'Validation failed. Please check your data.';
            if (res.error.message?.includes('Missing required account')) {
              errorMessage = language === 'id' ? 'Mohon lengkapi Data Akun terlebih dahulu.' : 'Please complete Account Data first.';
            }
            break;
          case 'PRODUCT_NOT_FOUND':
            errorMessage = language === 'id' ? 'Produk tidak valid.' : 'Invalid product.';
            break;
          case 'SKU_NOT_FOUND':
            errorMessage = language === 'id' ? 'Item tidak valid.' : 'Invalid Item.';
            break;
          case 'PROMO_EXPIRED':
            errorMessage = language === 'id' ? 'Ouch! Kode promo ini sudah kadaluarsa.' : 'Oops! This promo code has expired.';
            break;
          case 'PRODUCT_NOT_APPLICABLE':
            errorMessage = language === 'id' ? 'Kode promo tidak berlaku untuk produk yang Anda pilih.' : 'Promo not applicable for this product.';
            break;
          case 'PAYMENT_NOT_APPLICABLE':
            errorMessage = language === 'id' ? 'Kode promo tidak berlaku untuk metode pembayaran yang Anda pilih.' : 'Promo not applicable for this payment method.';
            break;
          case 'MIN_AMOUNT_NOT_MET':
            errorMessage = language === 'id' ? 'Total pembelian belum mencapai minimum syarat promo.' : 'Minimum transaction amount not met.';
            break;
          case 'INTERNAL_ERROR':
            errorMessage = language === 'id' ? 'Terjadi kesalahan sistem.' : 'System error.';
            break;
        }
        setPromoError(errorMessage);
        setPromoDiscount(0);

      } else if (res.data) {
        // Check "valid" field first (Success 200 but logical failure)
        if (res.data.valid === false) {
          const reason = res.data.reason;
          let failMessage = language === 'id' ? 'Kode promo tidak dapat digunakan.' : 'Promo code cannot be used.';

          switch (reason) {
            case 'PROMO_NOT_FOUND':
              failMessage = language === 'id' ? 'Kode promo tidak ditemukan.' : 'Promo code not found.';
              break;
            case 'PROMO_NOT_ACTIVE':
              failMessage = language === 'id' ? 'Kode promo sedang tidak aktif.' : 'Promo code is inactive.';
              break;
            case 'PROMO_NOT_STARTED':
              failMessage = language === 'id' ? 'Kode promo belum dimulai.' : 'Promo code has not started yet.';
              break;
            case 'REGION_NOT_APPLICABLE':
              failMessage = language === 'id' ? 'Promo tidak berlaku di negara Anda.' : 'Promo not available in your region.';
              break;
            case 'DAY_NOT_APPLICABLE':
              failMessage = language === 'id' ? 'Promo tidak berlaku hari ini.' : 'Promo not available today.';
              break;
            case 'USAGE_LIMIT_EXCEEDED':
              failMessage = language === 'id' ? 'Kuota promo global telah habis.' : 'Global promo quota exceeded.';
              break;
            case 'DAILY_USAGE_LIMIT_EXCEEDED':
              failMessage = language === 'id' ? 'Kuota harian promo telah habis.' : 'Daily promo quota exceeded.';
              break;
            case 'USER_USAGE_LIMIT_EXCEEDED':
              failMessage = language === 'id' ? 'Anda sudah mencapai batas penggunaan promo ini.' : 'You have reached the usage limit for this promo.';
              break;
            case 'DEVICE_USAGE_LIMIT_EXCEEDED':
            case 'IP_USAGE_LIMIT_EXCEEDED':
              failMessage = language === 'id' ? 'Anda sudah mencapai batas penggunaan.' : 'Usage limit exceeded for your device/IP.';
              break;
          }
          setPromoError(failMessage);
          setPromoDiscount(0);
        } else {
          // Valid Success
          setPromoDiscount(res.data.discountAmount || 0);
          setPromoError('');
          if (res.data.promoDetails?.title) {
            toast.success(`${language === 'id' ? 'Promo digunakan:' : 'Promo applied:'} ${res.data.promoDetails.title}`);
          }
        }
      }
    } catch (error) {
      console.error('Promo validation error:', error);
      setPromoError(language === 'id' ? 'Gagal memvalidasi promo' : 'Failed to validate promo');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  // Handle select promo from modal
  const handleSelectPromo = (promo: PromoCode) => {
    setPromoCode(promo.code);
    setShowPromoModal(false);
    // Auto validate after selecting
    setTimeout(() => {
      handleValidatePromo();
    }, 100);
  };

  // Check if can order
  const canOrder: boolean =
    selectedSKU !== null &&
    selectedPayment !== null &&
    (fields.length === 0 || accountData !== null) &&
    Boolean(contactInfo.phoneNumber) &&
    // Email is optional, but if provided must be valid
    (contactInfo.email === '' || validateEmail(contactInfo.email));

  // Handle SKU Selection with Auto-scroll & Validation
  const handleSelectSKU = (sku: SKU) => {
    // Validation: Require Account Data first (if applicable)
    if (!accountData && fields.length > 0) {
      toast.error(language === 'id' ? 'Silakan isi Data Akun terlebih dahulu!' : 'Please fill Account Data first!');
      scrollToSection(accountSectionRef);
      return;
    }

    setSelectedSKU(sku);
    // Reset quantity to 1 when changing SKU
    setQuantity(1);
    setTimeout(() => scrollToSection(quantitySectionRef), 100);
  };

  // Handle Payment Selection with Validation
  const handleSelectPayment = (channel: PaymentChannel) => {
    // Validation: Require SKU first
    if (!selectedSKU) {
      toast.error(language === 'id' ? 'Silakan pilih Produk/Item terlebih dahulu!' : 'Please select an Item first!');
      scrollToSection(skuSectionRef);
      return;
    }

    setSelectedPayment(channel);
    setTimeout(() => scrollToSection(contactSectionRef), 100);
  };

  // Handle order inquiry (first step - shows confirmation popup)
  const handleOrder = async () => {
    console.log('handleOrder called', { canOrder, product: !!product, selectedSKU: !!selectedSKU, selectedPayment: !!selectedPayment });

    if (!canOrder || !product || !selectedSKU || !selectedPayment) {
      console.log('Cannot order - missing requirements');
      return;
    }

    console.log('Starting order inquiry...');
    setIsOrdering(true);
    setOrderError('');
    setFieldErrors({});
    setCreateOrderError(''); // Clear creation error
    setPromoError('');

    try {
      // Create order inquiry first
      const inquiryData: Record<string, unknown> = {
        productCode: product.code,
        skuCode: selectedSKU.code,
        quantity: quantity,
        paymentCode: selectedPayment.code,
        phoneNumber: contactInfo.phoneNumber,
        ...fieldValues,
      };

      // Add email only if provided
      if (contactInfo.email && contactInfo.email.trim() !== '') {
        inquiryData.email = contactInfo.email;
      }

      if (promoCode) {
        inquiryData.promoCode = promoCode;
      }

      console.log('Sending order inquiry:', inquiryData);
      const inquiryRes = await createOrderInquiry(inquiryData, token?.accessToken);
      console.log('Order inquiry response:', inquiryRes);
      console.log('Response has error?', !!inquiryRes.error);
      console.log('Response has data?', !!inquiryRes.data);
      console.log('Response data type:', typeof inquiryRes.data);
      console.log('Response data content:', inquiryRes.data);
      console.log('Full response keys:', Object.keys(inquiryRes));

      if (inquiryRes.error) {
        console.error('Order inquiry error:', inquiryRes.error);

        // Map Error Codes
        const errorCode = inquiryRes.error.code;
        let errorMessage = inquiryRes.error.message;

        // Handle Field Errors if present
        if (inquiryRes.error.fields) {
          const newFieldErrors: Record<string, string> = {};

          // Get current fields definition
          const currentFields = fields;

          Object.entries(inquiryRes.error.fields).forEach(([key, value]) => {
            let mappedKey = key;

            // Smart mapping for known error keys specific to Game Topup
            if (key === 'userId' && currentFields.length > 0) {
              mappedKey = currentFields[0].key;
            } else if ((key === 'serverId' || key === 'zoneId') && currentFields.length > 1) {
              mappedKey = currentFields[1].key;
            }
            // Map promoCode directly
            if (key === 'promoCode') {
              setPromoError(String(value));
            } else {
              newFieldErrors[mappedKey] = String(value);
            }
          });

          setFieldErrors(newFieldErrors);

          // If we have field errors, scrollTo relevant section
          if (inquiryRes.error.fields.phoneNumber || inquiryRes.error.fields.email) {
            setTimeout(() => scrollToSection(contactSectionRef), 100);
          }
          if (inquiryRes.error.fields.promoCode) {
            setTimeout(() => scrollToSection(promoSectionRef), 100);
          }
        }

        switch (errorCode) {
          case 'BAD_REQUEST':
            errorMessage = language === 'id' ? 'Request tidak valid.' : 'Invalid request.';
            break;
          case 'VALIDATION_ERROR':
            errorMessage = language === 'id' ? 'Validasi gagal. Mohon periksa field yang ditandai merah.' : 'Validation failed. Please check the highlighted fields.';
            // Specific overrides for top-level message if needed
            if (inquiryRes.error.fields?.productCode) errorMessage = language === 'id' ? 'Kode produk wajib diisi.' : 'Product code is required.';
            if (inquiryRes.error.fields?.skuCode) errorMessage = language === 'id' ? 'Kode SKU wajib diisi.' : 'SKU code is required.';
            if (inquiryRes.error.fields?.zoneId || inquiryRes.error.fields?.serverId) errorMessage = language === 'id' ? 'User ID / Server ID wajib diisi.' : 'User ID / Server ID is required.';
            break;
          case 'PRODUCT_NOT_FOUND':
            errorMessage = language === 'id' ? 'Produk tidak ditemukan atau tidak aktif.' : 'Product not found or inactive.';
            break;
          case 'SKU_NOT_FOUND':
            errorMessage = language === 'id' ? 'Item tidak ditemukan atau tidak aktif.' : 'SKU not found or inactive.';
            break;
          case 'ACCOUNT_NOT_FOUND':
            errorMessage = language === 'id' ? 'Akun tidak ditemukan. Periksa ID/Server ID Anda.' : 'Account not found. Check your ID/Server ID.';
            break;
          case 'INQUIRY_SERVICE_ERROR':
          case 'INQUIRY_RESPONSE_ERROR':
            errorMessage = language === 'id' ? 'Gagal terhubung ke layanan penyedia. Silakan coba lagi nanti.' : 'Failed to connect to provider service. Please try again later.';
            break;
          case 'INTERNAL_ERROR':
            errorMessage = language === 'id' ? 'Terjadi kesalahan sistem.' : 'System error.';
            break;
          // Promo & Payment errors (handled similarly as validation/logic)
          case 'PAYMENT_NOT_FOUND':
          case 'PAYMENT_NOT_ACTIVE':
            errorMessage = language === 'id' ? 'Metode pembayaran tidak valid/aktif.' : 'Invalid or inactive payment method.';
            break;
        }

        // Global Toast Error
        toast.error(errorMessage);

        setOrderError(errorMessage);
        setIsOrdering(false);
        return;
      }

      // Check if data exists
      if (inquiryRes.data) {
        const orderData = inquiryRes.data;

        // Verify it has the required structure
        if (orderData && 'validationToken' in orderData && 'order' in orderData) {
          // Show confirmation popup instead of creating order immediately
          console.log('Order inquiry success! Setting data and showing modal...');
          console.log('Order inquiry data to set:', orderData);
          setOrderInquiryData(orderData);
          setAgreedToTerms(true);
          console.log('Setting showConfirmModal to true');
          setShowConfirmModal(true);
          console.log('Modal should now be visible');
          setIsOrdering(false); // Stop loading state when showing modal
        } else {
          console.error('Invalid order data structure:', orderData);
          setOrderError(language === 'id' ? 'Data tidak valid' : 'Invalid data');
          setIsOrdering(false);
        }
      } else {
        console.error('No data in response:', inquiryRes);
        setOrderError(language === 'id' ? 'Data tidak valid' : 'Invalid data');
        setIsOrdering(false);
      }
    } catch (error) {
      console.error('Order error:', error);
      setOrderError(language === 'id' ? 'Gagal membuat pesanan' : 'Failed to create order');
      setIsOrdering(false);
    }
  };

  // Handle order confirmation (second step - creates actual order)
  const handleConfirmOrder = async () => {
    if (!orderInquiryData || !agreedToTerms) return;

    setIsOrdering(true);
    setOrderError('');
    setCreateOrderError('');

    try {
      // Create actual order
      const orderRes = await createOrder(
        orderInquiryData.validationToken,
        token?.accessToken
      );

      if (orderRes.error) {
        console.error('Create order error:', orderRes.error);

        const errorCode = orderRes.error.code;
        let errorMessage = orderRes.error.message;

        switch (errorCode) {
          case 'BAD_REQUEST':
            errorMessage = language === 'id' ? 'Request tidak valid.' : 'Invalid request.';
            break;
          case 'VALIDATION_ERROR':
            errorMessage = language === 'id' ? 'Validasi gagal.' : 'Validation failed.';
            break;
          case 'INVALID_TOKEN':
          case 'TOKEN_ALREADY_USED':
            errorMessage = language === 'id' ? 'Sesi transaksi berakhir/kadaluarsa. Silakan buat pesanan baru.' : 'Transaction session expired. Please create a new order.';
            break;
          case 'PRODUCT_NOT_FOUND':
            errorMessage = language === 'id' ? 'Produk tidak tersedia.' : 'Product not available.';
            break;
          case 'SKU_NOT_FOUND':
            errorMessage = language === 'id' ? 'Item tidak ditemukan.' : 'Item not found.';
            break;
          case 'PAYMENT_CHANNEL_NOT_FOUND':
            errorMessage = language === 'id' ? 'Metode pembayaran tidak tersedia.' : 'Payment method not available.';
            break;
          case 'AUTHENTICATION_REQUIRED':
            errorMessage = language === 'id' ? 'Silakan login terlebih dahulu.' : 'Please login first.';
            break;
          case 'INSUFFICIENT_BALANCE':
            errorMessage = language === 'id' ? 'Saldo tidak mencukupi.' : 'Insufficient balance.';
            break;
          case 'PAYMENT_GATEWAY_UNAVAILABLE':
          case 'PAYMENT_GATEWAY_ERROR':
            errorMessage = language === 'id' ? 'Layanan pembayaran sedang gangguan. Silakan coba metode lain.' : 'Payment service is unavailable. Please try another method.';
            break;
          case 'INTERNAL_ERROR':
            errorMessage = language === 'id' ? 'Terjadi kesalahan sistem.' : 'System error.';
            break;
        }

        setCreateOrderError(errorMessage);
        // Do NOT close modal, let modal show the error
        // setShowConfirmModal(false); 
        setIsOrdering(false);
        return;
      }

      if (orderRes.data) {
        // Save to local history
        try {
          const ord = orderRes.data;
          saveLocalTransaction(regionCode, ord);
        } catch (e) {
          console.error('Failed to save local transaction', e);
        }

        // Add product to favorites
        if (product) {
          addToFavorites(product.code);
        }
        // Close modal and redirect to payment page
        setShowConfirmModal(false);
        router.push(getLocalizedPath(`/invoice/${orderRes.data.invoiceNumber}`));
      }
    } catch (error) {
      console.error('Order error:', error);
      setOrderError(language === 'id' ? 'Gagal membuat pesanan' : 'Failed to create order');
      setShowConfirmModal(false);
    } finally {
      setIsOrdering(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingPage message={t('loading')} />
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'id' ? 'Produk tidak ditemukan' : 'Product not found'}
          </h1>
        </div>
      </MainLayout>
    );
  }

  const subtotal = (selectedSKU?.price || 0) * quantity;
  const paymentFee = selectedPayment
    ? selectedPayment.feeAmount + (subtotal * selectedPayment.feePercentage) / 100
    : 0;
  const totalPrice = subtotal - promoDiscount + paymentFee;

  // --- Helper Components ---
  const MobileTabs = () => (
    <div className="flex w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 lg:hidden mt-12">
      <button
        onClick={() => setActiveMobileTab('transaction')}
        className={cn(
          "flex-1 py-4 text-sm font-semibold text-center transition-colors relative",
          activeMobileTab === 'transaction'
            ? "text-primary-600 dark:text-primary-400"
            : "text-gray-500 dark:text-gray-400"
        )}
      >
        {language === 'id' ? 'Transaksi' : 'Transaction'}
        {activeMobileTab === 'transaction' && (
          <motion.div
            layoutId="activeTab"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
          />
        )}
      </button>
      <button
        onClick={() => setActiveMobileTab('reviews')}
        className={cn(
          "flex-1 py-4 text-sm font-semibold text-center transition-colors relative",
          activeMobileTab === 'reviews'
            ? "text-primary-600 dark:text-primary-400"
            : "text-gray-500 dark:text-gray-400"
        )}
      >
        {language === 'id' ? 'Ulasan' : 'Reviews'}
        {activeMobileTab === 'reviews' && (
          <motion.div
            layoutId="activeTab"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
          />
        )}
      </button>
    </div>
  );

  const ReviewsSidebarCard = () => {
    if (!reviewStats) return null;

    const formatCount = (num: number | string) => {
      const n = Number(num);
      if (isNaN(n)) return '0';
      return new Intl.NumberFormat(language === 'id' ? 'id-ID' : 'en-US', {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1
      }).format(n);
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm mb-6">
        <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            {t('reviewsAndRating')}
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <span className="text-6xl font-extrabold text-gray-900 dark:text-white tracking-tighter leading-none">
              {Number(reviewStats.rating).toLocaleString(language === 'id' ? 'id-ID' : 'en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
            </span>
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={cn(
                      "w-5 h-5",
                      s <= Math.round(Number(reviewStats.rating))
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                    )}
                  />
                ))}
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {language === 'id' ? 'Berdasarkan total' : 'Based on'} <span className="text-gray-900 dark:text-white font-bold">{formatCount(reviewStats.totalReviews)}</span> rating
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (

    <MainLayout>
      {/* Banner with Game Info Card */}
      <div className="relative h-48 md:h-80 lg:h-96 w-full">
        {product.banner && (
          <Image
            src={product.banner}
            alt={product.title}
            fill
            className="object-cover"
            priority
          />
        )}
        {/* Gradient Overlay - cleaner at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24 md:h-32 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent dark:from-gray-900 dark:via-gray-900/80" />

        <div className="absolute -bottom-8 md:-bottom-10 left-0 right-0 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Floating Glassmorphism Pill Card */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl md:rounded-3xl p-3 md:p-6 shadow-xl border border-white/20 dark:border-gray-700/30 flex items-center gap-4 md:gap-6 max-w-4xl">
              <div className="relative w-16 h-16 md:w-28 md:h-28 rounded-xl md:rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-4xl font-extrabold text-gray-900 dark:text-white truncate">
                  {product.title}
                </h1>
                <p className="text-xs md:text-lg text-primary-600 dark:text-primary-400 font-medium mt-0.5 md:mt-1">
                  {product.publisher}
                </p>
                <div className="flex flex-wrap gap-2 md:gap-4 mt-2 md:mt-3">
                  <span className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 px-2.5 py-1 rounded-full">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    {t('fastProcess')}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 px-2.5 py-1 rounded-full">
                    <Clock className="w-4 h-4 text-blue-500" />
                    {t('support247')}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 px-2.5 py-1 rounded-full">
                    <Shield className="w-4 h-4 text-green-500" />
                    {t('safeSecure')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      <MobileTabs />


      <div className="max-w-7xl mx-auto px-4 pt-2 lg:pt-16 pb-32 lg:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className={cn("lg:col-span-2 space-y-6", activeMobileTab === 'reviews' ? "hidden lg:block" : "block")}>


            {/* 1. Account Data */}
            <div ref={accountSectionRef}>
              <StepSection
                title={`${t('accountData')}`}
                number="1"
                isActive={true}
                isCompleted={false}
              >
                {fields.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fields.map((field, index) => (
                        <div key={field.key} className="relative">
                          <Input
                            label={field.name}
                            type={field.type === 'number' ? 'text' : field.type}
                            inputMode={field.type === 'number' ? 'numeric' : undefined}
                            value={fieldValues[field.key] || ''}
                            onChange={(e) => {
                              let value = e.target.value;
                              if (field.type === 'number') {
                                value = value.replace(/[^0-9]/g, '');
                              }
                              if (field.maxLength && value.length > field.maxLength) {
                                return;
                              }
                              setFieldValues((prev) => ({
                                ...prev,
                                [field.key]: value,
                              }));
                              setAccountData(null);
                            }}
                            onFocus={() => {
                              setFocusedField(field.key);
                              if (index === 0) setShowRecentAccounts(true);
                            }}
                            onBlur={(e) => {
                              // Delay hiding to allow click event on dropdown
                              setTimeout(() => {
                                setFocusedField(null);
                                setShowRecentAccounts(false);
                              }, 200);
                              handleValidateAccount();
                            }}
                            placeholder={field.placeholder}
                            hint={field.hint}
                            required={field.required}
                            maxLength={field.maxLength || undefined}
                            minLength={field.minLength || undefined}
                            className={index === 0 && recentAccounts.length > 0 && showRecentAccounts ? "border-b-0 rounded-b-none focus:border-b-0 active:border-b-0" : ""}
                            error={fieldErrors[field.key]}
                          />

                          {/* Recent Accounts Dropdown */}
                          {index === 0 && showRecentAccounts && recentAccounts.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <History className="w-3 h-3" />
                                {language === 'id' ? 'Akun Terakhir' : 'Recent Accounts'}
                              </div>
                              {recentAccounts.map((acc, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault(); // Prevent blur
                                    // Auto fill
                                    const newValues = { ...fieldValues };

                                    // Map inputs to fields:
                                    // 1. By ID match if possible? No, user generic labels "id" and "server"
                                    // Strategy: 
                                    // - Label 'id' -> First field (usually user ID)
                                    // - Label 'server' -> Second field (usually Zone ID)

                                    const idInput = acc.inputs.find(inp => inp.label === 'id');
                                    const serverInput = acc.inputs.find(inp => inp.label === 'server');

                                    if (idInput && fields[0]) newValues[fields[0].key] = idInput.value;
                                    if (serverInput && fields[1]) newValues[fields[1].key] = serverInput.value;

                                    setFieldValues(newValues);
                                    setShowRecentAccounts(false);
                                    // Trigger validation immediately with new values
                                    handleValidateAccount(newValues);
                                  }}
                                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b last:border-0 border-gray-100 dark:border-gray-700 group"
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-primary-600 transition-colors">
                                        {acc.nickname || 'Unknown'}
                                      </p>
                                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                                        {acc.inputs.map(inp => inp.value).join(' ')}
                                      </p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 px-2 py-0.5 rounded-full">
                                        {language === 'id' ? 'Pilih' : 'Select'}
                                      </span>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {isValidating && (
                      <div className="flex items-center gap-2 text-primary-600">
                        <span className="loading loading-spinner loading-sm"></span>
                        <span className="text-sm font-medium">{t('loading')}</span>
                      </div>
                    )}
                    {accountError && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl animate-shake">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium leading-tight">
                          {accountError}
                        </p>
                      </div>
                    )}
                    {accountData && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl animate-in fade-in duration-500">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm font-bold text-green-700 dark:text-green-300">
                            {accountData.account.nickname}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No account data required for this product.</p>
                )}
              </StepSection>
            </div>

            {/* 2. SKU Selection */}
            <div ref={skuSectionRef}>
              <StepSection
                title={`${t('selectItem')}`}
                number="2"
                isActive={fields.length === 0 || !!accountData}
                isCompleted={false}
              // Locked removed
              >
                {/* Overlay removed - Validation moved to selection */}

                {/* Section Tabs */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 pb-2">
                  <button
                    onClick={() => setSelectedSection('')}
                    className={cn(
                      'px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all border',
                      selectedSection === ''
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    )}
                  >
                    {language === 'id' ? 'Semua Item' : 'All Items'}
                  </button>
                  {sections.map((section) => (
                    <button
                      key={section.code}
                      onClick={() => setSelectedSection(section.code)}
                      className={cn(
                        'px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all border',
                        selectedSection === section.code
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      )}
                    >
                      {section.title}
                    </button>
                  ))}
                </div>

                {/* SKU Grid */}
                {selectedSection === '' ? (
                  <div className="space-y-6">
                    {sections.map((section) => {
                      const sectionSkus = skus.filter((sku) => sku.section.code === section.code);
                      if (sectionSkus.length === 0) return null;

                      return (
                        <div key={section.code}>
                          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            <span className="text-yellow-500">{section.icon || '⭐'}</span>
                            {section.title}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {sectionSkus.map((sku) => (
                              <SKUCard
                                key={sku.code}
                                sku={sku}
                                isSelected={selectedSKU?.code === sku.code}
                                onSelect={handleSelectSKU}
                                currency={currency}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredSKUs.map((sku) => (
                      <SKUCard
                        key={sku.code}
                        sku={sku}
                        isSelected={selectedSKU?.code === sku.code}
                        onSelect={handleSelectSKU}
                        currency={currency}
                      />
                    ))}
                  </div>
                )}
              </StepSection>
            </div>

            {/* 3. Quantity */}
            <div ref={quantitySectionRef}>
              <StepSection
                title={language === 'id' ? 'Masukkan Jumlah' : 'Enter Quantity'}
                number="3"
                isActive={!!selectedSKU}
                isCompleted={false}
              >
                {/* Quantity Input */}
                <div className="mb-2 space-y-2">
                  <div className="flex items-center gap-2 md:gap-3">
                    {/* Quantity Display */}
                    <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl h-9 md:h-10 px-4 flex items-center">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {quantity}
                      </span>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(Math.min(10, quantity + 1))}
                        className={cn(
                          "w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all active:scale-95",
                          quantity >= 10
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-700"
                            : "bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20"
                        )}
                        disabled={quantity >= 10}
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className={cn(
                          "w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all active:scale-95",
                          quantity <= 1
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-700"
                            : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                        )}
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </StepSection>
            </div>

            {/* 4. Payment Methods */}
            <div ref={paymentSectionRef}>
              <StepSection
                title={`${t('selectPayment')}`}
                number="4"
                isActive={!!selectedSKU}
                isCompleted={false}
              // Locked removed
              >

                <div className={cn(
                  "space-y-3 transition-opacity duration-300",
                  "opacity-100" // Always visible opacity, validation on click
                )}>
                  {/* Payment channels without category */}
                  {(() => {
                    const channelsWithoutCategory = paymentChannels.filter(
                      (ch) => !ch.category || !ch.category.code
                    );
                    if (channelsWithoutCategory.length === 0) return null;

                    return channelsWithoutCategory.map((channel) => {
                      const isSelected = selectedPayment?.code === channel.code;

                      // Payment Availability Logic
                      const amount = (selectedSKU?.price || 0) * quantity;
                      const fee = channel.feeAmount + (amount * channel.feePercentage) / 100;
                      const totalWithFee = amount + fee;

                      // BALANCE Logic
                      const isBalance = channel.code === 'BALANCE';
                      let isDisabled = false;
                      let statusLabel = null;
                      let balanceAmount = 0;
                      const isLoggedIn = !!user;

                      if (isBalance) {
                        if (!isLoggedIn) {
                          isDisabled = true;
                          statusLabel = null; // Will render button separately for better alignment
                        } else if (user) {
                          // Check balance
                          balanceAmount = user.balance?.[currency as keyof typeof user.balance] || 0;
                          if (balanceAmount < totalWithFee) {
                            isDisabled = true;
                            statusLabel = (
                              <span className="text-sm text-red-500 font-bold text-right">
                                Saldo Kurang ({formatCurrency(balanceAmount, currency)})
                              </span>
                            );
                          } else {
                            statusLabel = (
                              <span className="text-sm text-green-600 font-medium text-right">
                                Saldo: {formatCurrency(balanceAmount, currency)}
                              </span>
                            );
                          }
                        }
                      } else {
                        const isAvailable = amount > 0 ? (totalWithFee >= channel.minAmount && totalWithFee <= channel.maxAmount) : true;

                        // Default Status Label Logic
                        if (amount === 0) {
                          // No SKU selected -> Show Min Amount
                          statusLabel = (
                            <span className="text-sm text-gray-500 font-medium text-right">
                              Min Rp {channel.minAmount.toLocaleString('id-ID')}
                            </span>
                          );
                        } else if (!isAvailable) {
                          isDisabled = true;
                          statusLabel = (
                            <span className="text-sm text-red-500 font-medium text-right">
                              {totalWithFee < channel.minAmount
                                ? `Min Rp ${channel.minAmount.toLocaleString('id-ID')}`
                                : `Max Rp ${channel.maxAmount.toLocaleString('id-ID')}`}
                            </span>
                          );
                        } else {
                          // Valid and available -> Show Price + Admin Fee
                          statusLabel = (
                            <span className="text-sm text-gray-500 font-medium text-right">
                              {formatCurrency(Math.round(totalWithFee), currency)}
                            </span>
                          );
                        }
                      }

                      // Determine effective availability for styling only (logic handled above)
                      // If it's balance and logged out, we style slightly differently
                      const isClickable = !isDisabled;

                      return (
                        <button
                          key={channel.code}
                          onClick={() => isClickable && handleSelectPayment(channel)}
                          disabled={isDisabled && !(!isLoggedIn && isBalance)} // Allow click if login needed
                          className={cn(
                            'flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 transition-all text-left relative',
                            isSelected
                              ? 'border-primary-500 bg-white dark:bg-gray-800 shadow-md ring-1 ring-primary-500'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
                            isDisabled && !(isBalance && !isLoggedIn)
                              ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50'
                              : 'hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer'
                          )}
                        >
                          <Image
                            src={channel.image}
                            alt={channel.name}
                            width={48}
                            height={32}
                            className={cn("h-8 w-auto object-contain", isDisabled && !(isBalance && !isLoggedIn) && "grayscale")}
                          />

                          <div className="flex flex-1 items-center justify-between gap-3 overflow-hidden">
                            <span className="font-medium text-gray-900 dark:text-white truncate pb-0.5">
                              {channel.name}
                            </span>

                            <div className="flex items-center gap-2 shrink-0">
                              {statusLabel}

                              {/* Login Button for Balance */}
                              {isBalance && !isLoggedIn && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs px-4 bg-primary-50 text-primary-600 border-primary-200 hover:bg-primary-100 hover:border-primary-300 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-400"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowLoginModal(true);
                                  }}
                                >
                                  {t('login')}
                                </Button>
                              )}
                            </div>
                          </div>

                          {isSelected && (
                            <div className="ml-3 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center shrink-0">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    });
                  })()}

                  {/* Payment channels with categories */}
                  {paymentCategories.map((category) => (
                    <PaymentCategorySection
                      key={category.code}
                      category={category}
                      channels={paymentChannels}
                      selectedChannel={selectedPayment}
                      onSelect={handleSelectPayment}
                      isExpanded={expandedPayment === category.code}
                      onToggle={() =>
                        setExpandedPayment(
                          expandedPayment === category.code ? '' : category.code
                        )
                      }
                      amount={subtotal} // Pass subtotal (price * quantity)
                      currency={currency}
                      user={user}
                      isLoggedIn={!!user}
                      onLogin={() => setShowLoginModal(true)}
                      locale={language}
                    />
                  ))}
                </div>
              </StepSection>
            </div>

            {/* 5. Contact Info */}
            {/* 5. Contact Info & Promo Code */}
            <div ref={contactSectionRef} className="space-y-6">
              <StepSection
                title={`${t('contactInfo')}`}
                number="5"
                isActive={!!selectedPayment}
                isCompleted={false}
                disabled={false} // Always meaningful to be editable
              >
                <div className="space-y-4">
                  <PhoneInput
                    label={language === 'id'
                      ? 'Nomor Whatsapp'
                      : 'Whatsapp Number'}
                    value={contactInfo.phoneNumber}
                    onChange={(value) => {
                      setContactInfo((prev) => ({ ...prev, phoneNumber: value }));
                      setFieldErrors((prev) => ({ ...prev, phoneNumber: '' }));
                    }}
                    defaultCountryCode={regionCode === 'MY' ? '+60' : regionCode === 'PH' ? '+63' : regionCode === 'SG' ? '+65' : regionCode === 'TH' ? '+66' : '+62'}
                    required
                    error={fieldErrors.phoneNumber}
                  />
                  {/* Email Dropdown (Replaces Input for Manual Proof) */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEmail(!showEmail)}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm font-medium",
                          showEmail
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500 text-primary-900 dark:text-primary-100"
                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Mail className={cn("w-4 h-4", showEmail ? "text-primary-500" : "text-gray-400")} />
                          <span>{language === 'id' ? 'Kirim Bukti Pembayaran' : 'Send Payment Proof'}</span>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 transition-transform text-gray-400", showEmail && "rotate-180 text-primary-500")} />
                      </button>

                      <AnimatePresence>
                        {showEmail && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 z-30 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4"
                          >
                            <Input
                              label={t('emailAddress')}
                              type="email"
                              value={contactInfo.email}
                              className={fieldErrors.email ? "!border-red-500 focus:!ring-red-500" : "bg-gray-50 dark:bg-gray-900/50"}
                              onChange={(e) => {
                                setContactInfo((prev) => ({ ...prev, email: e.target.value }));
                                setFieldErrors((prev) => ({ ...prev, email: '' }));
                              }}
                            />
                            {fieldErrors.email && (
                              <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{fieldErrors.email}</p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                              {language === 'id'
                                ? 'Bukti pembayaran akan dikirimkan ke email ini.'
                                : 'Payment proof will be sent to this email.'}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {/* Error outside (when collapsed) */}
                      {!showEmail && fieldErrors.email && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 font-medium px-1">
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                    {language === 'id'
                      ? 'Bukti pembayaran akan dikirimkan ke email ini.'
                      : 'Payment proof will be sent to this email.'}
                  </p>
                </div>
              </StepSection>

              {/* 6. Promo Code */}
              <div ref={promoSectionRef}>
                <StepSection
                  title={language === 'id' ? 'Kode Promo' : 'Promo Code'}
                  number="6"
                  isActive={Boolean(contactInfo.phoneNumber)}
                  disabled={false}
                >
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1 group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                          <TicketPercent className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value.toUpperCase());
                            setPromoError('');
                            setPromoDiscount(0);
                          }}
                          placeholder={language === 'id' ? 'Masukkan kode promo' : 'Enter promo code'}
                          className={cn(
                            "w-full h-12 pl-11 pr-4 bg-gray-50 dark:bg-gray-800 border-2 rounded-xl text-sm font-medium outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600",
                            promoError
                              ? "border-red-200 focus:border-red-500 text-red-900 dark:text-red-100"
                              : "border-gray-200 dark:border-border-700 border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-gray-900 dark:text-white"
                          )}
                        />
                      </div>
                      <Button
                        onClick={handleValidatePromo}
                        disabled={!promoCode.trim() || isValidatingPromo}
                        isLoading={isValidatingPromo}
                        className="h-12 px-6 rounded-xl font-bold shadow-lg shadow-primary-500/20 shrink-0"
                      >
                        {language === 'id' ? 'Gunakan' : 'Apply'}
                      </Button>
                    </div>

                    {/* Promo Error Feedback */}
                    {promoError && (
                      <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/20 animate-in slide-in-from-top-1">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span className="font-medium">{promoError}</span>
                      </div>
                    )}

                    {/* Success Feedback */}
                    {promoDiscount > 0 && (
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-200 dark:border-green-900/30 animate-in slide-in-from-top-1">
                        <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center shrink-0">
                          <Tag className="w-3 h-3" />
                        </div>
                        <span className="font-bold">
                          {language === 'id' ? 'Hemat' : 'Save'} {formatCurrency(promoDiscount, currency)}
                        </span>
                      </div>
                    )}

                    {/* Find Promo Button */}
                    <button
                      onClick={() => {
                        if (!canOrder) {
                          toast.error(language === 'id' ? 'Lengkapi semua data diatas terlebih dahulu!' : 'Please complete all data above first!');
                          return;
                        }
                        setShowPromoModal(true);
                      }}
                      className="w-full group relative flex items-center justify-between p-3 md:p-4 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl border border-primary-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                          <TicketPercent className="w-5 h-5 text-primary-500" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                            {language === 'id' ? 'Lihat Promo Tersedia' : 'View Available Promos'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {availablePromos.length > 0
                              ? (language === 'id' ? `${availablePromos.length} Kupon menunggu dipakai` : `${availablePromos.length} Coupons waiting for you`)
                              : (language === 'id' ? 'Cek ketersediaan promo' : 'Check promo availability')
                            }
                          </p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center border border-gray-100 dark:border-gray-600 group-hover:border-primary-200">
                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary-500 -rotate-90" />
                      </div>
                    </button>
                  </div>
                </StepSection>
              </div>
            </div>
          </div> {/* This closes the lg:col-span-2 div for main content */}

          {/* Mobile Reviews Tab Content */}
          <div className={cn("lg:col-span-2 lg:hidden", activeMobileTab === 'reviews' ? "block" : "hidden")}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  {t('reviewsAndRating')}
                </h3>
                {reviewStats && (
                  <div className="flex items-center gap-4">
                    <span className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tighter leading-none">
                      {Number(reviewStats.rating).toLocaleString(language === 'id' ? 'id-ID' : 'en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                    </span>
                    <div className="flex flex-col gap-1 pt-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={cn("w-4 h-4", s <= Math.round(Number(reviewStats.rating)) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700")} />
                        ))}
                      </div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {language === 'id' ? 'Berdasarkan total' : 'Based on'} <span className="text-gray-900 dark:text-white font-bold">{new Intl.NumberFormat(language === 'id' ? 'id-ID' : 'en-US', { notation: "compact", compactDisplay: "short", maximumFractionDigits: 1 }).format(Number(reviewStats.totalReviews))}</span> rating
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <ReviewList reviews={reviews} />
              </div>
            </div>
          </div>


          {/* Order Summary Sidebar */}
          <div className="hidden lg:block lg:col-span-1 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar space-y-4 pb-4">
            <ReviewsSidebarCard />
            <OrderSummary
              product={product}
              sku={selectedSKU}
              paymentChannel={selectedPayment}
              promoDiscount={promoDiscount}
              accountData={accountData}
              currency={currency}
              canOrder={canOrder}
              isLoading={isOrdering}
              orderError={orderError}
              onOrder={handleOrder}
              quantity={quantity}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden font-sans">
        <AnimatePresence>
          {isMobileSummaryExpanded && (
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 pb-24 pt-6 px-6"
              onClick={() => setIsMobileSummaryExpanded(false)}
            >
              {/* Drag Handle */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />

              <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shrink-0">
                    {product?.thumbnail && (
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate">{product?.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{selectedSKU?.name || 'Belum pilih item'}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Metode</span>
                    <span className="font-medium text-gray-900 dark:text-white truncate max-w-[200px] text-right">
                      {selectedPayment?.name || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Harga</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Jumlah</span>
                    <span className="font-medium text-gray-900 dark:text-white">{quantity}x</span>
                  </div>
                  {paymentFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Biaya Admin</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(Math.round(paymentFee), currency)}</span>
                    </div>
                  )}
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                      <span className="font-medium">Diskon</span>
                      <span className="font-bold">-{formatCurrency(promoDiscount, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                    <span className="font-bold text-gray-900 dark:text-white">Total Bayar</span>
                    <span className="font-bold text-primary-600 dark:text-primary-400 text-lg">
                      {selectedPayment ? formatCurrency(Math.round(totalPrice), currency) : 'Rp 0'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Always Visible Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl ring-1 ring-gray-200 dark:ring-gray-700 relative z-20">
          <div className="flex items-center gap-4 max-w-7xl mx-auto">
            <button
              onClick={() => setIsMobileSummaryExpanded(!isMobileSummaryExpanded)}
              className="flex flex-col gap-0.5 shrink-0 w-10 h-10 items-center justify-center rounded-full active:bg-gray-100 dark:active:bg-gray-700 transition-colors"
            >
              {isMobileSummaryExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronUp className="w-5 h-5 text-gray-500 animate-bounce" />
              )}
            </button>

            <div className="flex-1" onClick={() => setIsMobileSummaryExpanded(!isMobileSummaryExpanded)}>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Pembayaran</p>
              <p className="text-lg font-extrabold text-primary-600 dark:text-primary-400 leading-tight">
                {selectedPayment ? formatCurrency(Math.round(totalPrice), currency) : 'Rp 0'}
              </p>
            </div>

            <Button
              onClick={handleOrder}
              disabled={!canOrder}
              isLoading={isOrdering}
              className="flex-1 max-w-[160px] font-bold shadow-lg shadow-primary-500/20 rounded-xl h-12"
            >
              {isOrdering ? 'Proses...' : 'Bayar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setAgreedToTerms(false);
        }}
        onConfirm={handleConfirmOrder}
        orderData={orderInquiryData}
        product={product}
        locale={language}
        currency={currency}
        isLoading={isOrdering}
        agreedToTerms={agreedToTerms}
        onAgreeToTerms={setAgreedToTerms}
        error={createOrderError}
        quantity={quantity}
        paymentFee={paymentFee}
        promoDiscount={promoDiscount}
        paymentMethodName={selectedPayment?.name}
      />

      {/* Promo Modal */}
      <PromoModal
        isOpen={showPromoModal}
        onClose={() => setShowPromoModal(false)}
        promos={availablePromos}
        isLoading={isLoadingPromos}
        currency={currency}
        locale={language}
        onSelectPromo={handleSelectPromo}
      />
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </MainLayout >
  );
}


