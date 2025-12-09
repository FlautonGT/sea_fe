'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { addToFavorites } from '@/lib/favorites';
import { Zap, Clock, Shield, Tag, ChevronDown, ChevronUp } from 'lucide-react';
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
}) {
  const { t } = useTranslation();
  // Import AnimatedIcons dynamically or assume it's available in scope if imported at top
  // For safety in this file refactor, we usually expect imports at top. 
  // We'll use the AnimatedFailed from imports. 
  // Note: We need to make sure AnimatedFailed is imported in the main file.

  const subtotal = sku?.price || 0;
  const paymentFee = paymentChannel
    ? paymentChannel.feeAmount + (subtotal * paymentChannel.feePercentage) / 100
    : 0;
  const total = subtotal - promoDiscount + paymentFee;

  return (
    <div className="sticky top-24 h-fit">
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl ring-1 ring-black/5">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            Ringkasan Pesanan
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
                Belum ada pesanan
              </p>
              <p className="text-xs text-gray-500 max-w-[200px] mx-auto">
                Silahkan lengkapi data akun dan pilih item terlebih dahulu
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
                    {sku?.name || 'Belum pilih item'}
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

              {/* Error Animation */}
              {orderError && (
                <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100 dark:border-red-900/20 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="transform scale-75">
                      <AnimatedFailed />
                    </div>
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-1">
                      {orderError}
                    </p>
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                {paymentChannel && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Metode</span>
                    <span className="font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                      {paymentChannel.name}
                    </span>
                  </div>
                )}

                {sku && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Harga</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(subtotal, currency)}
                    </span>
                  </div>
                )}

                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                    <span className="font-medium">Diskon</span>
                    <span className="font-bold">-{formatCurrency(promoDiscount, currency)}</span>
                  </div>
                )}

                {paymentFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Biaya Admin</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(Math.round(paymentFee), currency)}
                    </span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    Total Bayar
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
            size="lg"
            disabled={!canOrder}
            isLoading={isLoading}
            className={cn(
              "font-bold shadow-lg shadow-primary-500/20 py-6 transition-all",
              canOrder
                ? "hover:shadow-primary-500/40 hover:-translate-y-0.5"
                : "opacity-50 cursor-not-allowed"
            )}
          >
            {isLoading ? 'Memproses...' : 'Pesan Sekarang'}
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
}: {
  category: PaymentChannelCategory;
  channels: PaymentChannel[];
  selectedChannel: PaymentChannel | null;
  onSelect: (channel: PaymentChannel) => void;
  isExpanded: boolean;
  onToggle: () => void;
  amount: number;
  currency: string;
}) {
  const categoryChannels = channels.filter((ch) => {
    if (category.code === '') {
      return !ch.category || !ch.category.code;
    }
    return ch.category?.code === category.code;
  });

  if (categoryChannels.length === 0) return null;

  // Mobile: 3, Desktop: 4
  const previewChannels = categoryChannels.slice(0, 4);

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
            <div className="flex items-center gap-1">
              {/* Show only 3 on mobile, 4 on desktop */}
              {previewChannels.map((ch, idx) => (
                <div key={ch.code} className={cn("relative h-4 w-auto md:h-5", idx >= 3 && "hidden md:block")}>
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
              const fee =
                channel.feeAmount + (amount * channel.feePercentage) / 100;
              const totalWithFee = amount + fee;

              return (
                <button
                  key={channel.code}
                  onClick={() => onSelect(channel)}
                  className={cn(
                    'relative flex flex-col items-center p-2 rounded-lg border transition-all hover:border-gray-300 dark:hover:border-gray-600',
                    isSelected
                      ? 'border-primary-500 bg-white dark:bg-gray-800 ring-1 ring-primary-500 shadow-sm'
                      : 'border-transparent bg-white dark:bg-gray-800'
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
                    {formatCurrency(Math.round(totalWithFee), currency)}
                  </span>

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

  const { user, token } = useAuth();
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
  const [isLoadingPromos, setIsLoadingPromos] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderInquiryData, setOrderInquiryData] = useState<OrderInquiry | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isMobileSummaryExpanded, setIsMobileSummaryExpanded] = useState(false);

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

  // Section Refs for Auto-scroll
  const accountSectionRef = useRef<HTMLDivElement>(null);
  const skuSectionRef = useRef<HTMLDivElement>(null);
  const paymentSectionRef = useRef<HTMLDivElement>(null);
  const contactSectionRef = useRef<HTMLDivElement>(null); // Added Contact Info Ref

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

  // Validate account when fields are filled
  const handleValidateAccount = useCallback(async () => {
    if (!product || fields.length === 0) return;

    // Check if all required fields are filled
    const requiredFields = fields.filter((f) => f.required);
    const allFilled = requiredFields.every(
      (f) => fieldValues[f.key] && fieldValues[f.key].trim() !== ''
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
          ...fieldValues,
        },
        token?.accessToken
      );

      if (response.error) {
        setAccountError(response.error.message);
        setAccountData(null);
      } else if (response.data) {
        setAccountData(response.data);
        // Auto-scroll to Product
        setTimeout(() => scrollToSection(skuSectionRef), 100);
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
        region: regionCode,
        amount: selectedSKU.price.toString(),
      });

      if (res.error) {
        setPromoError(res.error.message);
        setPromoDiscount(0);
      } else if (res.data) {
        setPromoDiscount(res.data.discountAmount);
        setPromoError('');
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
    setTimeout(() => scrollToSection(paymentSectionRef), 100);
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

    try {
      // Create order inquiry first
      const inquiryData: Record<string, unknown> = {
        productCode: product.code,
        skuCode: selectedSKU.code,
        quantity: 1,
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
        setOrderError(inquiryRes.error.message);
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

    try {
      // Create actual order
      const orderRes = await createOrder(
        orderInquiryData.validationToken,
        token?.accessToken
      );

      if (orderRes.error) {
        setOrderError(orderRes.error.message);
        setShowConfirmModal(false);
        return;
      }

      if (orderRes.data?.order) {
        // Add product to favorites
        if (product) {
          addToFavorites(product.code);
        }
        // Close modal and redirect to payment page
        setShowConfirmModal(false);
        router.push(getLocalizedPath(`/invoice/${orderRes.data.order.invoiceNumber}`));
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

  const subtotal = selectedSKU?.price || 0;
  const paymentFee = selectedPayment
    ? selectedPayment.feeAmount + (subtotal * selectedPayment.feePercentage) / 100
    : 0;
  const totalPrice = subtotal - promoDiscount + paymentFee;

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

      <div className="max-w-7xl mx-auto px-4 pt-16 pb-32 lg:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. Account Data */}
            <div ref={accountSectionRef}>
              <StepSection
                title={`${t('accountData')} ${fields.length > 0 ? "*" : ""}`}
                number="1"
                isActive={true}
                isCompleted={!!accountData}
              >
                {fields.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fields.map((field) => (
                        <Input
                          key={field.key}
                          label={field.name}
                          type={field.type === 'number' ? 'text' : field.type}
                          inputMode={field.type === 'number' ? 'numeric' : undefined}
                          value={fieldValues[field.key] || ''}
                          onChange={(e) => {
                            setFieldValues((prev) => ({
                              ...prev,
                              [field.key]: e.target.value,
                            }));
                            setAccountData(null);
                          }}
                          onBlur={handleValidateAccount}
                          placeholder={field.placeholder}
                          hint={field.hint}
                          required={field.required}
                        />
                      ))}
                    </div>
                    {isValidating && (
                      <div className="flex items-center gap-2 text-primary-600">
                        <span className="loading loading-spinner loading-sm"></span>
                        <span className="text-sm font-medium">{t('loading')}</span>
                      </div>
                    )}
                    {accountError && (
                      <p className="text-sm text-red-500 font-medium animate-pulse">{accountError}</p>
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
                            Akun Valid: {accountData.account.nickname}
                          </span>
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 pl-7">
                          Region: {accountData.account.region} | ID: {accountData.product.code}
                        </p>
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
                title={`${t('selectItem')} *`}
                number="2"
                isActive={fields.length === 0 || !!accountData}
                isCompleted={!!selectedSKU}
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
                    Semua Item
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

            {/* 3. Payment Methods */}
            <div ref={paymentSectionRef}>
              <StepSection
                title={`${t('selectPayment')} *`}
                number="3"
                isActive={!!selectedSKU}
                isCompleted={!!selectedPayment}
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

                      return (
                        <button
                          key={channel.code}
                          onClick={() => handleSelectPayment(channel)}
                          className={cn(
                            'flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 transition-all text-left',
                            isSelected
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md ring-1 ring-primary-500'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                          )}
                        >
                          <Image
                            src={channel.image}
                            alt={channel.name}
                            width={48}
                            height={32}
                            className="h-8 w-auto object-contain"
                          />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {channel.name}
                          </span>
                          {isSelected && (
                            <div className="ml-auto w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
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
                      amount={selectedSKU?.price || 0}
                      currency={currency}
                    />
                  ))}
                </div>
              </StepSection>
            </div>

            {/* 4. Contact Info */}
            {/* 4. Contact Info & Promo Code */}
            <div ref={contactSectionRef} className="space-y-6">
              <StepSection
                title={`${t('contactInfo') || 'Kontak Saya'} *`}
                number="4"
                isActive={!!selectedPayment}
                isCompleted={Boolean(contactInfo.phoneNumber)}
                disabled={false} // Always meaningful to be editable
              >
                <div className="space-y-4">
                  <PhoneInput
                    label="Nomor Whatsapp (Wajib)"
                    value={contactInfo.phoneNumber}
                    onChange={(value) =>
                      setContactInfo((prev) => ({ ...prev, phoneNumber: value }))
                    }
                    defaultCountryCode={regionCode === 'MY' ? '+60' : regionCode === 'PH' ? '+63' : regionCode === 'SG' ? '+65' : regionCode === 'TH' ? '+66' : '+62'}
                    required
                  />
                  <Input
                    label="Email (Opsional)"
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) =>
                      setContactInfo((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="Kirim bukti pembayaran ke email..."
                  />
                  <p className="text-xs text-gray-500">*Bukti pembayaran akan dikirimkan ke nomor Whatsapp dan Email kamu.</p>
                </div>
              </StepSection>

              {/* 5. Promo Code */}
              <StepSection
                title="Kode Promo"
                number="5"
                isActive={true}
                disabled={false}
              >
                <div className="space-y-3">
                  <Input
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value.toUpperCase());
                      setPromoError('');
                      setPromoDiscount(0);
                    }}
                    placeholder="Punya kode promo? Masukkan disini"
                  />
                  {promoError && (
                    <p className="text-sm text-red-500">{promoError}</p>
                  )}
                  {promoDiscount > 0 && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg border border-green-200">
                      <Tag className="w-4 h-4" />
                      ✓ Hemat {formatCurrency(promoDiscount, currency)}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleValidatePromo}
                      disabled={!promoCode.trim() || isValidatingPromo}
                      className="flex-1"
                    >
                      {isValidatingPromo ? t('loading') : 'Gunakan'}
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 text-primary-600 hover:bg-primary-50"
                      onClick={() => {
                        if (!canOrder) {
                          toast.error(language === 'id' ? 'Lengkapi semua data diatas terlebih dahulu!' : 'Please complete all data above first!');
                          return;
                        }
                        setShowPromoModal(true);
                      }}
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      Cari Promo
                    </Button>
                  </div>
                </div>
              </StepSection>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
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
            />
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden font-sans">
        <AnimatePresence>
          {isMobileSummaryExpanded && (
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-gray-100 dark:border-gray-700 pb-24 pt-6 px-6"
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
                    <span className="text-gray-500">Harga</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(subtotal, currency)}</span>
                  </div>
                  {paymentFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Biaya Admin</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(Math.round(paymentFee), currency)}</span>
                    </div>
                  )}
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Diskon</span>
                      <span>-{formatCurrency(promoDiscount, currency)}</span>
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
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] relative z-20">
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
        isLoading={isOrdering}
        agreedToTerms={agreedToTerms}
        onAgreeToTerms={setAgreedToTerms}
      />

      {/* Promo Modal */}
      <PromoModal
        isOpen={showPromoModal}
        onClose={() => setShowPromoModal(false)}
        promos={availablePromos}
        isLoading={isLoadingPromos}
        currency={currency}
        onSelectPromo={handleSelectPromo}
      />
    </MainLayout>
  );
}

