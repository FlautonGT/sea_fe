'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Zap, Star, TrendingUp } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { BannerCarousel, ProductCard, LoadingPage, Popup } from '@/components/ui';
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
        <h3 className="font-medium text-[10px] md:text-xs text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 transition-colors">
          {sku.name}
        </h3>
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

// Favorite Product Card - Compact design
function FavoriteProductCard({ product }: { product: Product }) {
  const { getLocalizedPath } = useLocale();

  return (
    <Link
      href={getLocalizedPath(`/${product.slug}`)}
      className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-card hover:shadow-card-hover transition-all"
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
        <Image
          src={product.thumbnail}
          alt={product.title}
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
          {product.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {product.publisher}
        </p>
      </div>
    </Link>
  );
}

// Trending Product Card - Polished List Style
function TrendingProductCard({ product, rank }: { product: Product; rank: number }) {
  const { getLocalizedPath } = useLocale();

  // Rank colors - Updated for better visibility
  const getRankStyles = (r: number) => {
    switch (r) {
      case 1: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 2: return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 3: return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-500';
    }
  };

  return (
    <Link
      href={getLocalizedPath(`/${product.slug}`)}
      className="group flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary-100 dark:hover:border-primary-900 transition-all duration-300"
    >
      {/* Rank Badge */}
      <div className={cn(
        "w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0 transition-transform group-hover:scale-110",
        getRankStyles(rank)
      )}>
        {rank}
      </div>

      {/* Game Thumbnail */}
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
        <Image
          src={product.thumbnail}
          alt={product.title}
          width={56}
          height={56}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Game Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="font-bold text-sm md:text-base text-gray-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">
          {product.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
          {product.publisher || 'Direct Top Up'}
        </p>
      </div>

      {/* Arrow */}
      <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors flex-shrink-0">
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
      </div>
    </Link>
  );
}

// Category Tabs Component - New design
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
    <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
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

      // Infinite scroll logic (reset when reaching end)
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth - 1) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Banner Carousel - Pure image */}
        {banners.length > 0 && (
          <BannerCarousel banners={banners} />
        )}

        {/* Promo/Flash Sale Section */}
        {promoSKUs.length > 0 && (
          <section
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 shadow-sm border border-gray-100/50 dark:border-gray-800"
            onMouseEnter={() => setIsPromoHovered(true)}
            onMouseLeave={() => setIsPromoHovered(false)}
            onTouchStart={() => setIsPromoHovered(true)}
            onTouchEnd={() => setTimeout(() => setIsPromoHovered(false), 3000)}
          >
            {/* Background Decoration */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-colors" />

            <div className="relative flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <span className="text-xl">🔥</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                    {t('flashSale')}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('endsIn')}</p>
                    <div className="bg-red-500 text-white px-2 py-0.5 rounded-lg text-xs font-bold shadow-sm shadow-red-500/30">
                      {flashSaleEndTime && <CountdownTimer endTime={flashSaleEndTime} />}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              ref={promoScrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1 -mx-1"
            >
              {promoSKUs.map((sku) => (
                <PromoSKUCard key={sku.code} sku={sku} />
              ))}
            </div>
          </section>
        )}

        {/* Favorites Section */}
        {favoriteProducts.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('yourFavorites')}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteProducts.slice(0, 6).map((product) => (
                <FavoriteProductCard key={product.code} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Trending Section */}
        {trendingProducts.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('trending')}
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {trendingProducts.slice(0, 8).map((product, index) => (
                <TrendingProductCard key={product.code} product={product} rank={index + 1} />
              ))}
            </div>
          </section>
        )}

        {/* Voucher & Top Up Section */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('gameSelection')}
            </h2>

            {/* Category Tabs - Refined */}
            {categories.length > 0 && (
              <CategoryTabs
                categories={categories}
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
              />
            )}
          </div>

          {/* Products Grid - Increased spacing for premium feel */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-5">
            {filteredProducts.slice(0, 12).map((product) => (
              <Link
                key={product.code}
                href={getLocalizedPath(`/${product.slug}`)}
                className="transition-transform duration-300 hover:-translate-y-1 block"
              >
                <ProductCard product={product} />
              </Link>
            ))}
          </div>

          {filteredProducts.length > 12 && (
            <div className="mt-8 text-center">
              <Link
                href={getLocalizedPath(`/category/${selectedCategory}`)}
                className="inline-flex items-center gap-2 px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full font-semibold text-gray-900 dark:text-white transition-all shadow-sm hover:shadow-md"
              >
                {t('seeAllGames')}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}

