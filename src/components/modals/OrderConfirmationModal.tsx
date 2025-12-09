'use client';

import React from 'react';
import Image from 'next/image';
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
}: OrderConfirmationModalProps) {
  console.log('OrderConfirmationModal render:', { isOpen, hasOrderData: !!orderData, orderData });
  
  if (!isOpen || !orderData) {
    console.log('Modal not showing - conditions not met:', { isOpen, orderData: !!orderData });
    return null;
  }

  console.log('Modal rendering with data:', orderData);
  const { order } = orderData;

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
              <span className="text-gray-500 dark:text-gray-400">{t('username', locale)}:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {order.account.nickname || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{t('gameId', locale)}:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {order.account.userId}
              </span>
            </div>
            {order.account.zoneId && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t('server', locale)}:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {order.account.zoneId}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{t('item', locale)}:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {order.sku.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{t('product', locale)}:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {order.product.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{t('payment', locale)}:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {order.payment.name}
              </span>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="px-6 pb-4">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => onAgreeToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {t('agreeToTerms', locale)}{' '}
              <a
                href="#"
                className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Open terms and conditions page
                }}
              >
                {t('termsAndConditions', locale)}
              </a>
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <Button
            variant="outline"
            onClick={onClose}
            fullWidth
            disabled={isLoading}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {t('cancel', locale)}
          </Button>
          <Button
            onClick={onConfirm}
            fullWidth
            isLoading={isLoading}
            disabled={!agreedToTerms}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {t('orderNow', locale)}!
          </Button>
        </div>
      </div>
    </div>
  );
}

