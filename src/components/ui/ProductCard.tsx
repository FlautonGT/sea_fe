'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'large';
  showPrice?: boolean;
  className?: string;
}

export default function ProductCard({
  product,
  variant = 'default',
  className,
}: ProductCardProps) {
  const href = `/${product.slug}`;

  if (variant === 'compact') {
    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl hover:shadow-card-hover transition-all group",
          className
        )}
      >
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={product.thumbnail}
            alt={product.title}
            width={48}
            height={48}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
            {product.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {product.publisher}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === 'large') {
    return (
      <Link
        href={href}
        className={cn(
          "product-card block",
          className
        )}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={product.banner || product.thumbnail}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.isPopular && (
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                Popular
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
            {product.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {product.description}
          </p>
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {product.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "product-card block group h-full relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300",
        className
      )}
    >
      <div className="product-card-image relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {/* Overlay on hover - Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {product.isPopular && (
          <div className="absolute top-2 left-2 z-10">
            <span className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 backdrop-blur-md text-white text-[10px] font-bold rounded-full shadow-lg shadow-orange-500/30">
              🔥 Hot
            </span>
          </div>
        )}
      </div>
      <div className="p-4 relative">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 transition-colors">
          {product.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 font-medium">
          {product.publisher || 'Direct Top Up'}
        </p>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 transform skew-x-12" />
        </div>
      </div>
    </Link>
  );
}

