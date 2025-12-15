'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/translations';
import { OrderInquiry, Product } from '@/types';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderData: OrderInquiry | null;
  product: Product | null;
  locale: string;
  isLoading: boolean;
  agreedToTerms: boolean;
  onAgreeToTerms: (agreed: boolean) => void;
  error?: string;
  currency: string;
  quantity: number;
  paymentFee: number;
  promoDiscount: number;
  paymentMethodName?: string;
}

export default function OrderConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  orderData,
  product,
  locale,
  isLoading,
  agreedToTerms,
  onAgreeToTerms,
  error,
  currency,
  quantity,
  paymentFee,
  promoDiscount,
  paymentMethodName,
}: OrderConfirmationModalProps) {
  // console.log('OrderConfirmationModal render:', { isOpen, hasOrderData: !!orderData, orderData });

  if (!isOpen || !orderData) {
    return null;
  }

  const { order } = orderData;

  // Error State UI
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />

        {/* Modal */}
        <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl animate-scale-in overflow-hidden">
          {/* Error Icon */}
          <div className="flex justify-center pt-6 pb-2">
            <div className="relative">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center animate-shake">
                <X className="w-10 h-10 text-red-500" strokeWidth={3} />
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="px-6 pb-4 text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {locale === 'id' ? 'Gagal Membuat Pesanan' : 'Failed to Create Order'}
            </h2>
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                {error}
              </p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
              {locale === 'id'
                ? 'Mohon maaf, terjadi kesalahan saat memproses pesanan Anda. Silakan coba buat pesanan baru.'
                : 'We apologize, an error occurred while processing your order. Please try creating a new order.'}
            </p>
          </div>

          {/* Footer - Close Button Only */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <Button
              onClick={onClose}
              fullWidth
              className="font-bold bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              {locale === 'id' ? 'Tutup & Buat Baru' : 'Close & Try Again'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate Total Display in Modal (re-calculation for display safety, though page usually handles logic)
  // Or just trust the display values passed in.
  // const displayTotal = order.pricing.total; // Use total from backend as the source of truth for "Total Bayar" but we display breakdown

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl animate-scale-in overflow-hidden">
        {/* Success Icon */}
        <div className="flex justify-center pt-6 pb-2">
          <div className="relative">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="px-6 pb-4 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('createOrder', locale)}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {t('confirmOrderDesc', locale)}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 pb-4 space-y-3">
          {/* Order Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{locale === 'id' ? 'Username' : 'Username'}:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {order.account.nickname || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{locale === 'id' ? 'ID User' : 'User ID'}:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {order.account.userId}
              </span>
            </div>
            {order.account.zoneId && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{locale === 'id' ? 'ID Server' : 'Server ID'}:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {order.account.zoneId}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{locale === 'id' ? 'Item' : 'Item'}:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {order.sku.name}
              </span>
            </div>

            {/* Added Fields */}
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{locale === 'id' ? 'Jumlah' : 'Quantity'}:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {quantity}x
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{locale === 'id' ? 'Harga' : 'Price'}:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {/* Base price (Unit Price * Quantity) or just subtotal */}
                {/* Displaying total price here might be confusing if we have detailed breakdown.
                     Let's match the summary sidebar style.
                 */}
                {formatCurrency((order.pricing.subtotal || 0), currency)}
              </span>
            </div>

            {paymentFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{locale === 'id' ? 'Biaya Admin' : 'Admin Fee'}:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {formatCurrency(paymentFee, currency)}
                </span>
              </div>
            )}

            {promoDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{locale === 'id' ? 'Diskon' : 'Discount'}:</span>
                <span className="text-green-600 font-medium">
                  -{formatCurrency(promoDiscount, currency)}
                </span>
              </div>
            )}

            <div className="flex justify-between pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">{locale === 'id' ? 'Metode Pembayaran' : 'Payment Method'}:</span>
              <span className="text-gray-900 dark:text-white font-medium text-right max-w-[200px]">
                {paymentMethodName || order.payment.name}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-900 dark:text-white font-bold">{locale === 'id' ? 'Total Bayar' : 'Total Payment'}:</span>
              <span className="text-primary-600 dark:text-primary-400 font-bold text-lg">
                {formatCurrency(order.pricing.total, currency)}
              </span>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3 pt-2">
            <div className="relative flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => onAgreeToTerms(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <label htmlFor="terms" className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
              {locale === 'id' ? (
                <>
                  Dengan klik Konfirmasi, Anda setuju dengan{' '}
                  <Link href="/terms" className="text-primary-600 hover:underline" target="_blank">
                    Syarat dan Ketentuan
                  </Link>{' '}
                  serta{' '}
                  <Link href="/privacy" className="text-primary-600 hover:underline" target="_blank">
                    Kebijakan Privasi
                  </Link>{' '}
                  kami.
                </>
              ) : (
                <>
                  By clicking Confirm, you agree to our{' '}
                  <Link href="/terms" className="text-primary-600 hover:underline" target="_blank">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary-600 hover:underline" target="_blank">
                    Privacy Policy
                  </Link>.
                </>
              )}
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={isLoading}
          >
            {locale === 'id' ? 'Batal' : 'Cancel'}
          </Button>
          <Button
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={!agreedToTerms || isLoading}
            className="flex-[2] font-bold shadow-lg shadow-primary-500/20"
          >
            {locale === 'id' ? 'Konfirmasi' : 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  );
}
