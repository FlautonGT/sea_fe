'use client';

import React from 'react';
import Image from 'next/image';
import { SKU } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';

interface SKUCardProps {
  sku: SKU;
  isSelected: boolean;
  onSelect: (sku: SKU) => void;
  currency?: string;
}

export default function SKUCard({ sku, isSelected, onSelect, currency = 'IDR' }: SKUCardProps) {
  const hasDiscount = sku.originalPrice > sku.price;

  return (
    <button
      onClick={() => onSelect(sku)}
      disabled={!sku.isAvailable}
      className={cn(
        "relative p-3 sm:p-4 text-left rounded-xl border-2 transition-all",
        isSelected
          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
          : "border-gray-200 dark:border-gray-700 hover:border-primary-300 bg-white dark:bg-gray-800",
        !sku.isAvailable && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Badge */}
      {sku.badge && (
        <span
          className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-semibold text-white rounded-full"
          style={{ backgroundColor: sku.badge.color }}
        >
          {sku.badge.text}
        </span>
      )}

      {/* Content */}
      <div className="flex items-start gap-3">
        {sku.image && (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={sku.image}
              alt={sku.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">
            {sku.name}
          </h4>
          {sku.info && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {sku.info}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="font-bold text-primary-600 dark:text-primary-400 text-sm">
              {formatCurrency(sku.price, currency)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {formatCurrency(sku.originalPrice, currency)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}

