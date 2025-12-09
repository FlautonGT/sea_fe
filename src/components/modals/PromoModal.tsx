'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { PromoCode } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  promos: PromoCode[];
  isLoading: boolean;
  currency: string;
  onSelectPromo: (promo: PromoCode) => void;
}

export default function PromoModal({
  isOpen,
  onClose,
  promos,
  isLoading,
  currency,
  onSelectPromo,
}: PromoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Promo yang tersedia
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Memuat...</p>
            </div>
          ) : promos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Tidak ada promo tersedia</p>
            </div>
          ) : (
            <div className="space-y-4">
              {promos.map((promo) => {
                const discountText = promo.promoPercentage > 0
                  ? `Diskon hingga ${promo.promoPercentage}%`
                  : promo.promoFlat > 0
                  ? `Diskon ${formatCurrency(promo.promoFlat, currency)}`
                  : 'Diskon';
                
                const isAvailable = new Date(promo.expiredAt) > new Date() && promo.isAvailable;
                const minAmountText = promo.minAmount > 0
                  ? `Minimum pembelian ${formatCurrency(promo.minAmount, currency)}`
                  : '';

                return (
                  <div
                    key={promo.code}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-orange-300 dark:hover:border-orange-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-1">
                          {discountText}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {promo.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Promo berlaku hingga {new Date(promo.expiredAt).toLocaleDateString('id-ID')}</span>
                      </div>
                      {minAmountText && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{minAmountText}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Batas penggunaan {promo.maxUsagePerId} kali untuk setiap akun.</span>
                      </div>
                      {promo.products && promo.products.length > 0 && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>
                            Promo ini hanya berlaku untuk produk {promo.products.map(p => p.name).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                        Kode Promo: {promo.code}
                      </span>
                      <button
                        onClick={() => onSelectPromo(promo)}
                        disabled={!isAvailable}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                          isAvailable
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        )}
                      >
                        {isAvailable ? 'Gunakan' : 'Tidak Tersedia'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

