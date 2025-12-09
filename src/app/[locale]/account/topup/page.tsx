'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Wallet, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, Input, LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { PaymentChannel, PaymentChannelCategory } from '@/types';
import {
  getPaymentChannelCategories,
  getPaymentChannels,
  createDepositInquiry,
  createDeposit,
} from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';

const presetAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

export default function TopUpPage() {
  const { token } = useAuth();
  const { regionCode, currency, getLocalizedPath, language } = useLocale();
  const { t } = useTranslation();

  const [paymentCategories, setPaymentCategories] = useState<PaymentChannelCategory[]>([]);
  const [paymentChannels, setPaymentChannels] = useState<PaymentChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [amount, setAmount] = useState<number>(100000);
  const [selectedPayment, setSelectedPayment] = useState<PaymentChannel | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string>('');

  useEffect(() => {
    async function fetchPaymentMethods() {
      setIsLoading(true);
      try {
        const [categoriesRes, channelsRes] = await Promise.all([
          getPaymentChannelCategories(regionCode, 'deposit'),
          getPaymentChannels(regionCode, 'deposit'),
        ]);

        if (categoriesRes.data) {
          setPaymentCategories(categoriesRes.data);
          if (categoriesRes.data.length > 0) {
            setExpandedCategory(categoriesRes.data[0].code);
          }
        }
        if (channelsRes.data) {
          setPaymentChannels(channelsRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch payment methods:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPaymentMethods();
  }, [regionCode]);

  const handleSubmit = async () => {
    if (!token || !selectedPayment || amount <= 0) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Create deposit inquiry
      const inquiryRes = await createDepositInquiry(
        {
          amount,
          paymentCode: selectedPayment.code,
        },
        token.accessToken,
        regionCode
      );

      if (inquiryRes.error) {
        setError(inquiryRes.error.message);
        return;
      }

      if (inquiryRes.data?.validationToken) {
        // Create actual deposit
        const depositRes = await createDeposit(
          inquiryRes.data.validationToken,
          token.accessToken
        );

        if (depositRes.error) {
          setError(depositRes.error.message);
          return;
        }

        if (depositRes.data?.deposit) {
          // Redirect to invoice page
          window.location.href = getLocalizedPath(`/invoice/${depositRes.data.deposit.invoiceNumber}`);
        }
      }
    } catch (error) {
      console.error('Deposit error:', error);
      setError(language === 'id' ? 'Gagal membuat deposit' : 'Failed to create deposit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fee = selectedPayment
    ? selectedPayment.feeAmount + (amount * selectedPayment.feePercentage) / 100
    : 0;
  const total = amount + fee;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {t('topUp')}
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Amount Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('selectAmount')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    className={cn(
                      'py-3 px-4 rounded-xl border-2 font-semibold transition-all',
                      amount === preset
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                    )}
                  >
                    {formatCurrency(preset, currency)}
                  </button>
                ))}
              </div>
              <Input
                label={t('customAmount')}
                type="number"
                value={amount.toString()}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                leftIcon={<span className="text-sm text-gray-500">{currency}</span>}
              />
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('selectPayment')}
              </label>
              <div className="space-y-3">
                {paymentCategories.map((category) => {
                  const categoryChannels = paymentChannels.filter(
                    (ch) => ch.category.code === category.code
                  );

                  if (categoryChannels.length === 0) return null;

                  const isExpanded = expandedCategory === category.code;

                  return (
                    <div
                      key={category.code}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedCategory(isExpanded ? '' : category.code)
                        }
                        className="flex items-center justify-between w-full px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">
                          {category.title}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {categoryChannels.map((channel) => {
                              const isSelected =
                                selectedPayment?.code === channel.code;
                              const channelFee =
                                channel.feeAmount +
                                (amount * channel.feePercentage) / 100;
                              const channelTotal = amount + channelFee;

                              return (
                                <button
                                  key={channel.code}
                                  onClick={() => setSelectedPayment(channel)}
                                  className={cn(
                                    'relative flex flex-col items-center p-4 rounded-xl border-2 transition-all',
                                    isSelected
                                      ? 'border-primary-500 bg-white dark:bg-gray-800'
                                      : 'border-transparent bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                                  )}
                                >
                                  <Image
                                    src={channel.image}
                                    alt={channel.name}
                                    width={48}
                                    height={32}
                                    className="h-8 w-auto object-contain mb-2"
                                  />
                                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                                    {channel.name}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {formatCurrency(Math.round(channelTotal), currency)}
                                  </span>

                                  {isSelected && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                                      <svg
                                        className="w-3 h-3 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={3}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            {selectedPayment && amount > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {t('summary')}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      {t('amount')}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formatCurrency(amount, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      {t('paymentMethod')}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedPayment.name}
                    </span>
                  </div>
                  {fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Fee</span>
                      <span className="text-gray-900 dark:text-white">
                        {formatCurrency(Math.round(fee), currency)}
                      </span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {t('total')}
                      </span>
                      <span className="font-bold text-primary-600 dark:text-primary-400">
                        {formatCurrency(Math.round(total), currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              fullWidth
              disabled={!selectedPayment || amount <= 0}
              isLoading={isSubmitting}
            >
              <Wallet className="w-4 h-4 mr-2" />
              {t('topUpNow')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

