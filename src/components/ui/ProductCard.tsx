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
        "product-card block group h-full relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300",
        className
      )}
    >
      <div className="product-card-image relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Overlay on hover - Subtle gloss effect only */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {product.isPopular && (
          <div className="absolute top-2 left-2 z-10">
            <span className="px-2 py-0.5 bg-orange-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full shadow-sm">
              🔥 Hot
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 transition-colors">
          {product.title}
        </h3>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
          {product.publisher || 'Direct Top Up'}
        </p>
      </div>
    </Link>
  );
}

