'use client';

import React from 'react';
import { Clock, TicketPercent } from 'lucide-react';
import { PromoCode } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  promos: PromoCode[];
  isLoading: boolean;
  currency: string;
  onSelectPromo: (promo: PromoCode) => void;
  locale?: string;
}

export default function PromoModal({
  isOpen,
  onClose,
  promos,
  isLoading,
  currency,
  onSelectPromo,
  locale = 'id',
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
            {locale === 'id' ? 'Promo yang tersedia' : 'Available Promos'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium">{locale === 'id' ? 'Memuat promo...' : 'Loading promos...'}</p>
            </div>
          ) : promos.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <TicketPercent className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-900 dark:text-white font-bold text-lg mb-1">{locale === 'id' ? 'Belum ada promo' : 'No promos yet'}</p>
              <p className="text-gray-500 text-sm max-w-[250px]">{locale === 'id' ? 'Cek lagi nanti untuk penawaran menarik lainnya!' : 'Check back later for more exciting offers!'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {promos.map((promo) => {
                const discountText = promo.promoPercentage > 0
                  ? (locale === 'id' ? `Diskon ${promo.promoPercentage}%` : `${promo.promoPercentage}% OFF`)
                  : promo.promoFlat > 0
                    ? (locale === 'id' ? `Potongan ${formatCurrency(promo.promoFlat, currency)}` : `Save ${formatCurrency(promo.promoFlat, currency)}`)
                    : (locale === 'id' ? 'Diskon Spesial' : 'Special Discount');

                const isAvailable = new Date(promo.expiredAt) > new Date() && promo.isAvailable;
                const minAmountText = promo.minAmount > 0
                  ? (locale === 'id' ? `Min. belanja ${formatCurrency(promo.minAmount, currency)}` : `Min. spend ${formatCurrency(promo.minAmount, currency)}`)
                  : (locale === 'id' ? 'Tanpa minimum belanja' : 'No min. spend');

                return (
                  <div
                    key={promo.code}
                    className={cn(
                      "group relative flex flex-col sm:flex-row bg-white dark:bg-gray-800 border rounded-2xl overflow-hidden transition-all duration-300",
                      isAvailable
                        ? "border-primary-100 dark:border-primary-900/30 hover:shadow-lg hover:shadow-primary-500/5 hover:border-primary-300 dark:hover:border-primary-700"
                        : "border-gray-200 dark:border-gray-700 opacity-60 grayscale-[0.5]"
                    )}
                  >
                    {/* Left Side - Visual & Main Info */}
                    <div className={cn(
                      "flex-1 p-5 relative overflow-hidden",
                      isAvailable ? "bg-gradient-to-br from-primary-50/50 to-blue-50/30 dark:from-primary-900/10 dark:to-blue-900/5" : "bg-gray-50 dark:bg-gray-800"
                    )}>
                      {/* Decorative Circle */}
                      <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-2xl opacity-50 pointer-events-none"></div>

                      <div className="flex items-start gap-4 relative z-10">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                          isAvailable ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400" : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                        )}>
                          <TicketPercent className="w-6 h-6" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className={cn("text-lg font-bold mb-1 truncate", isAvailable ? "text-primary-700 dark:text-primary-300" : "text-gray-700 dark:text-gray-300")}>
                            {discountText}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                            {promo.description}
                          </p>

                          <div className="flex flex-wrap gap-y-1 gap-x-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1.5 bg-white dark:bg-gray-700 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-600 shadow-sm">
                              <Clock className="w-3.5 h-3.5 text-orange-500" />
                              <span>Exp: {new Date(promo.expiredAt).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white dark:bg-gray-700 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-600 shadow-sm">
                              <div className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[8px] font-bold">$</div>
                              <span>{minAmountText}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Action (Desktop: Right, Mobile: Bottom) */}
                    <div className="relative p-4 sm:w-40 flex flex-col justify-center items-center gap-3 border-t sm:border-t-0 sm:border-l border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                      {/* Cutouts for ticket effect */}
                      <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-white dark:bg-gray-800 rounded-full sm:hidden"></div>
                      <div className="absolute -right-1.5 -top-1.5 w-3 h-3 bg-white dark:bg-gray-800 rounded-full sm:hidden"></div>
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white dark:bg-gray-800 rounded-full hidden sm:block"></div>
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white dark:bg-gray-800 rounded-full hidden sm:block"></div>

                      <div className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg py-1.5 px-3 text-center">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">{locale === 'id' ? 'KODE' : 'CODE'}</p>
                        <p className="font-mono font-bold text-gray-900 dark:text-white select-all">{promo.code}</p>
                      </div>

                      <button
                        onClick={() => onSelectPromo(promo)}
                        disabled={!isAvailable}
                        className={cn(
                          'w-full py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all transform active:scale-95',
                          isAvailable
                            ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/20'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        )}
                      >
                        {isAvailable ? (locale === 'id' ? 'Pakai' : 'Use') : (locale === 'id' ? 'Habis' : 'N/A')}
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

