
'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { BannerCarousel, ProductCard, LoadingPage, Popup } from '@/components/ui';
import { AnimatedZap, AnimatedStar, AnimatedTrending } from '@/components/ui/AnimatedIcons';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { Banner, Product, SKU, Category } from '@/types';
import {
  getBanners,
  getProducts,
  getPopularProducts,
  getPromoSKUs,
  getCategories,
} from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { getFavorites } from '@/lib/favorites';

// Countdown Timer Component
function CountdownTimer({ endTime }: { endTime: Date }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="flex items-center gap-1 text-sm">
      <span className="bg-white text-gray-900 px-2 py-1 rounded font-mono font-bold">
        {String(timeLeft.hours).padStart(2, '0')}
      </span>
      <span className="text-white font-bold">:</span>
      <span className="bg-white text-gray-900 px-2 py-1 rounded font-mono font-bold">
        {String(timeLeft.minutes).padStart(2, '0')}
      </span>
      <span className="text-white font-bold">:</span>
      <span className="bg-white text-gray-900 px-2 py-1 rounded font-mono font-bold">
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

// Promo SKU Card Component - Compact design
function PromoSKUCard({ sku }: { sku: SKU }) {
  const { getLocalizedPath, currency } = useLocale();
  const hasDiscount = sku.originalPrice > sku.price;
  const discountPercent = hasDiscount
    ? Math.round(((sku.originalPrice - sku.price) / sku.originalPrice) * 100)
    : 0;

  // Link to product page with SKU pre-selected
  const href = sku.product?.slug
    ? getLocalizedPath(`/${sku.product.slug}?sku=${sku.code}`)
    : '#';

  return (
    <Link
      href={href}
      className="flex-shrink-0 w-28 md:w-32 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all group border border-gray-100 dark:border-gray-700"
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
        <Image
          src={sku.image || sku.product?.thumbnail || '/placeholder.png'}
          alt={sku.name}
          fill
          className="object-contain p-2 group-hover:scale-110 transition-transform"
        />
        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
            -{discountPercent}%
          </div>
        )}
      </div>
      <div className="p-2">
        <h3 className="font-bold text-xs text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 transition-colors">
          {sku.name}
        </h3>
        {sku.product?.title && (
          <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">
            {sku.product.title}
          </p>
        )}
        <div className="mt-1 flex flex-col">
          <span className="font-bold text-xs text-primary-600 dark:text-primary-400">
            {formatCurrency(sku.price, currency)}
          </span>
          {hasDiscount && (
            <span className="text-[9px] text-gray-400 line-through">
              {formatCurrency(sku.originalPrice, currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// Favorite Product Card - Matches Trending Design
function FavoriteProductCard({ product }: { product: Product }) {
  const { getLocalizedPath } = useLocale();

  return (
    <Link
      href={getLocalizedPath(`/${product.slug}`)}
      className="group flex flex-row items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary-100 dark:hover:border-primary-900 transition-all duration-300 w-full"
    >
      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 shadow-inner">
        <Image
          src={product.thumbnail}
          alt={product.title}
          width={48}
          height={48}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate w-full group-hover:text-primary-600 transition-colors">
          {product.title}
        </h3>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5 font-medium w-full">
          {product.publisher || 'Direct Top Up'}
        </p>
      </div>
      {/* Arrow - Hidden on mobile, visible on desktop */}
      <div className="hidden md:flex w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-700 items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors flex-shrink-0">
        <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-primary-600 transition-colors" />
      </div>
    </Link>
  );
}

// Trending Product Card - Responsive Grid (Matches Favorites Style)
function TrendingProductCard({ product }: { product: Product }) {
  const { getLocalizedPath } = useLocale();

  return (
    <Link
      href={getLocalizedPath(`/${product.slug}`)}
      className="group flex flex-row items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary-100 dark:hover:border-primary-900 transition-all duration-300 w-full"
    >
      {/* Game Thumbnail */}
      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 shadow-inner">
        <Image
          src={product.thumbnail}
          alt={product.title}
          width={48}
          height={48}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Game Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate w-full group-hover:text-primary-600 transition-colors">
          {product.title}
        </h3>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5 font-medium w-full">
          {product.publisher || 'Direct Top Up'}
        </p>
      </div>

      {/* Arrow - Hidden on mobile, visible on desktop to match requested simple look */}
      <div className="hidden md:flex w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-700 items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors flex-shrink-0">
        <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-primary-600 transition-colors" />
      </div>
    </Link>
  );
}

// Category Tabs Component - Premium Pill Design
function CategoryTabs({
  categories,
  selectedCategory,
  onSelect,
}: {
  categories: Category[];
  selectedCategory: string;
  onSelect: (code: string) => void;
}) {
  return (
    <div className="flex overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
      <div className="flex gap-2.5 mx-auto md:mx-0">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.code;
          return (
            <button
              key={category.code}
              onClick={() => onSelect(category.code)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all duration-300",
                isSelected
                  ? "bg-primary-600 text-white shadow-md shadow-primary-600/25 scale-105"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              {category.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Main Home Page Component
export default function HomePage() {
  const { regionCode, currency, getLocalizedPath } = useLocale();
  const { t, language } = useTranslation();
  const promoScrollRef = useRef<HTMLDivElement>(null);
  const [isPromoHovered, setIsPromoHovered] = useState(false);

  const [banners, setBanners] = useState<Banner[]>([]);
  const [promoSKUs, setPromoSKUs] = useState<SKU[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Flash sale end time (Next Midnight WIB / UTC+7)
  const [flashSaleEndTime, setFlashSaleEndTime] = useState<Date | null>(null);

  useEffect(() => {
    // Calculate next midnight WIB (UTC+7)
    // 00:00 WIB is 17:00 UTC previous day.
    // So 00:00 WIB Tomorrow = 17:00 UTC Today (Jakarta Date).
    const now = new Date();
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric', month: 'numeric', day: 'numeric'
    });
    const parts = fmt.formatToParts(now);
    const day = parseInt(parts.find(p => p.type === 'day')!.value);
    const month = parseInt(parts.find(p => p.type === 'month')!.value);
    const year = parseInt(parts.find(p => p.type === 'year')!.value);

    // Target: Today's Jakarta Date at 17:00 UTC = Tomorrow 00:00 WIB
    const nextMidnight = new Date(Date.UTC(year, month - 1, day, 17, 0, 0));
    setFlashSaleEndTime(nextMidnight);
  }, []);

  // Auto-scroll promo section - Fixed Resume Logic
  useEffect(() => {
    const scrollContainer = promoScrollRef.current;
    if (!scrollContainer || isPromoHovered || promoSKUs.length === 0) return;

    // Initialize scrollAmount from current position to prevent reset
    let scrollAmount = scrollContainer.scrollLeft;
    const scrollSpeed = 0.5; // Slower, smoother speed
    const scrollInterval = 16; // ~60fps

    const autoScroll = setInterval(() => {
      if (!scrollContainer) return;

      scrollAmount += scrollSpeed;
      scrollContainer.scrollLeft = scrollAmount;

      // Infinite scroll logic (seamless loop)
      // When we scroll past half the content (the first set), reset to 0 instantly
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
        scrollAmount = 0;
        scrollContainer.scrollLeft = 0;
      }
    }, scrollInterval);

    return () => clearInterval(autoScroll);
  }, [isPromoHovered, promoSKUs.length]);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [bannersRes, promoRes, popularRes, productsRes, categoriesRes] =
          await Promise.all([
            getBanners(regionCode),
            getPromoSKUs(regionCode),
            getPopularProducts(regionCode),
            getProducts(regionCode),
            getCategories(regionCode),
          ]);

        if (bannersRes.data) setBanners(bannersRes.data);
        if (promoRes.data) setPromoSKUs(promoRes.data);
        if (popularRes.data) setPopularProducts(popularRes.data);
        if (productsRes.data && Array.isArray(productsRes.data)) {
          setAllProducts(productsRes.data);

          // Get favorite products from localStorage
          const savedFavorites = getFavorites();
          if (savedFavorites.length > 0 && productsRes.data) {
            const productData = productsRes.data;
            const favProducts = savedFavorites
              .map(f => productData.find((p: Product) => p.code === f.code))
              .filter(Boolean) as Product[];
            setFavoriteProducts(favProducts);
          } else if (productsRes.data) {
            // Fallback: Show first 4 products if no favorites (for design preview)
            setFavoriteProducts(productsRes.data.slice(0, 4));
          }
        }
        if (categoriesRes.data) {
          setCategories(categoriesRes.data);
          if (categoriesRes.data.length > 0) {
            setSelectedCategory(categoriesRes.data[0].code);
          }
        }
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [regionCode]);

  // Filter products by category
  const filteredProducts = selectedCategory
    ? allProducts.filter((p) => p.category.code === selectedCategory)
    : allProducts;

  // Trending products (using popular products or first 10)
  const trendingProducts = popularProducts.length > 0 ? popularProducts : allProducts.slice(0, 10);

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingPage message={t('loading')} />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Popup region={regionCode} />

      {/* Decorative Background Mesh */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary-100/30 dark:bg-primary-900/10 blur-[100px]" />
        <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/30 dark:bg-blue-900/10 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Banner Carousel - Enhanced Container */}
        {banners.length > 0 && (
          <div className="rounded-3xl overflow-hidden shadow-2xl shadow-primary-900/10 border border-white/20 dark:border-white/5 bg-white dark:bg-gray-800">
            <BannerCarousel banners={banners} />
          </div>
        )}

        {/* Promo/Flash Sale Section - Redesigned */}
        {promoSKUs.length > 0 && (
          <section
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-8 shadow-lg ring-1 ring-red-100 dark:ring-red-900/30"
          >
            {/* Background Decoration */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full blur-[60px]" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white dark:bg-white/10 rounded-2xl shadow-md shadow-red-500/10">
                  <AnimatedZap className="w-8 h-8 text-red-500" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                    {t('flashSale')}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                    {t('flashSaleTitle')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/60 dark:bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 dark:border-white/10">
                <p className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('endsIn')}</p>
                <div className="text-red-600 dark:text-red-400">
                  {flashSaleEndTime && <CountdownTimer endTime={flashSaleEndTime} />}
                </div>
              </div>
            </div>

            <div
              ref={promoScrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide py-4 px-2 -mx-2"
              onMouseEnter={() => setIsPromoHovered(true)}
              onMouseLeave={() => setIsPromoHovered(false)}
              onTouchStart={() => setIsPromoHovered(true)}
              onTouchEnd={() => setTimeout(() => setIsPromoHovered(false), 3000)}
            >
              {[...promoSKUs, ...promoSKUs].map((sku, index) => (
                <PromoSKUCard key={`${sku.code}-${index}`} sku={sku} />
              ))}
            </div>
          </section>
        )}

        {/* Favorites Section */}
        {favoriteProducts.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
                <AnimatedStar className="w-6 h-6 text-yellow-500" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('yourFavorites')}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {favoriteProducts.slice(0, 4).map((product) => (
                <FavoriteProductCard key={product.code} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Trending Section */}
        {trendingProducts.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                <AnimatedTrending className="w-6 h-6 text-blue-500" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('trending')}
              </h2>
            </div>

            {/* 2-Column Grid on Mobile and Desktop */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {trendingProducts.slice(0, 8).map((product) => (
                <TrendingProductCard key={product.code} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Voucher & Top Up Section - Refined Header */}
        <section className="space-y-8">
          <div className="flex flex-col gap-6 border-b border-gray-100 dark:border-gray-800 pb-6 items-center md:items-start">
            {/* Category Tabs */}
            {categories.length > 0 && (
              <CategoryTabs
                categories={categories}
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
              />
            )}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
            {filteredProducts.slice(0, 12).map((product) => (
              <Link
                key={product.code}
                href={getLocalizedPath(`/${product.slug}`)}
                className="transition-transform duration-300 hover:-translate-y-1 block h-full"
              >
                <ProductCard product={product} />
              </Link>
            ))}
          </div>

          {filteredProducts.length > 12 && (
            <div className="mt-12 text-center">
              <Link
                href={getLocalizedPath(`/category/${selectedCategory}`)}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-full font-bold text-gray-900 dark:text-white transition-all shadow-sm hover:shadow-lg hover:shadow-primary-500/10"
              >
                {t('seeAllGames')}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}

// Additional icons for Trust Section
function ShieldCheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function HeadsetIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 11v3a8 8 0 0 0 16 0v-3" />
      <path d="M2.5 10a2.5 2.5 0 0 1 5 0v5a2.5 2.5 0 0 1-5 0Z" />
      <path d="M16.5 10a2.5 2.5 0 0 1 5 0v5a2.5 2.5 0 0 1-5 0Z" />
      <path d="M12 6a8 8 0 0 0-8 8" />
      <path d="M12 6a8 8 0 0 1 8 8" />
    </svg>
  )
}
