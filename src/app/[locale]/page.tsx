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
      className="flex-shrink-0 w-32 md:w-36 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all group border border-gray-100 dark:border-gray-700"
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
          <div className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            -{discountPercent}%
          </div>
        )}
      </div>
      <div className="p-2">
        <h3 className="font-medium text-xs text-gray-900 dark:text-white line-clamp-1">
          {sku.name}
        </h3>
        <div className="mt-1 flex flex-col">
          <span className="font-bold text-xs text-primary-600 dark:text-primary-400">
            {formatCurrency(sku.price, currency)}
          </span>
          {hasDiscount && (
            <span className="text-[10px] text-gray-400 line-through">
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

// Trending Product Card - Horizontal with rank badge
function TrendingProductCard({ product, rank }: { product: Product; rank: number }) {
  const { getLocalizedPath } = useLocale();
  
  // Rank colors
  const rankColors = {
    1: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900',
    2: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700',
    3: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white',
  };
  const defaultRankColor = 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
  
  return (
    <Link
      href={getLocalizedPath(`/${product.slug}`)}
      className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group border border-gray-100 dark:border-gray-700"
    >
      {/* Rank Badge */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0",
        rankColors[rank as keyof typeof rankColors] || defaultRankColor
      )}>
        {rank}
      </div>
      
      {/* Game Thumbnail */}
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={product.thumbnail}
          alt={product.title}
          width={48}
          height={48}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
        />
      </div>
      
      {/* Game Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
          {product.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {product.publisher || 'Top Up'}
        </p>
      </div>
      
      {/* Arrow */}
      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
    </Link>
  );
}

// Category Tabs Component - New design
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
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0">
      {categories.map((category) => (
        <button
          key={category.code}
          onClick={() => onSelect(category.code)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all border",
            selectedCategory === category.code
              ? "bg-primary-600 text-white border-primary-600"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          )}
        >
          {category.title}
        </button>
      ))}
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

  // Flash sale end time (example: 24 hours from now)
  const flashSaleEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Auto-scroll promo section
  useEffect(() => {
    if (!promoScrollRef.current || isPromoHovered || promoSKUs.length === 0) return;
    
    const scrollContainer = promoScrollRef.current;
    let scrollAmount = 0;
    const scrollSpeed = 1; // pixels per frame
    const scrollInterval = 30; // ms between frames
    
    const autoScroll = setInterval(() => {
      if (!scrollContainer) return;
      
      scrollAmount += scrollSpeed;
      scrollContainer.scrollLeft = scrollAmount;
      
      // Reset to start when reaching end
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
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
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700"
            onMouseEnter={() => setIsPromoHovered(true)}
            onMouseLeave={() => setIsPromoHovered(false)}
            onTouchStart={() => setIsPromoHovered(true)}
            onTouchEnd={() => setTimeout(() => setIsPromoHovered(false), 3000)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔥</span>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Promo
                </h2>
                <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                  <Zap className="w-3 h-3" />
                  <CountdownTimer endTime={flashSaleEndTime} />
                </div>
              </div>
              <Link 
                href={getLocalizedPath('/promos')}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                Lihat Semua
              </Link>
            </div>
            <div 
              ref={promoScrollRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide"
            >
              {promoSKUs.map((sku) => (
                <PromoSKUCard key={sku.code} sku={sku} />
              ))}
            </div>
          </section>
        )}

        {/* Favorites Section - From localStorage */}
        {favoriteProducts.length > 0 && (
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                Favorite
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {favoriteProducts.slice(0, 6).map((product) => (
                <FavoriteProductCard key={product.code} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Trending Section */}
        {trendingProducts.length > 0 && (
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Game Trending
                </h2>
              </div>
              <Link 
                href={getLocalizedPath('/trending')}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {trendingProducts.slice(0, 8).map((product, index) => (
                <TrendingProductCard key={product.code} product={product} rank={index + 1} />
              ))}
            </div>
          </section>
        )}

        {/* Voucher & Top Up Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">
            Voucher & Top Up
          </h2>
          
          {/* Category Tabs */}
          {categories.length > 0 && (
            <div className="mb-4">
              <CategoryTabs
                categories={categories}
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
              />
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
            {filteredProducts.slice(0, 12).map((product) => (
              <Link key={product.code} href={getLocalizedPath(`/${product.slug}`)}>
                <ProductCard product={product} />
              </Link>
            ))}
          </div>

          {filteredProducts.length > 12 && (
            <div className="mt-6 text-center">
              <Link
                href={getLocalizedPath(`/category/${selectedCategory}`)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                Lihat Semua
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}

