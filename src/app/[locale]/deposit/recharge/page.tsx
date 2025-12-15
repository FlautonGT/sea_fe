'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Wallet, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, Input, LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { PaymentChannel, PaymentChannelCategory, DepositInquiry } from '@/types';
import {
    getPaymentChannelCategories,
    getPaymentChannels,
    createDepositInquiry,
    createDeposit,
} from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import DepositConfirmationModal from '@/components/modals/DepositConfirmationModal';
import DashboardLayout from '@/components/layout/DashboardLayout';

const presetAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

// Payment Category Component
function PaymentCategorySection({
    category,
    channels,
    selectedChannel,
    onSelect,
    isExpanded,
    onToggle,
    amount,
    currency,
}: {
    category: PaymentChannelCategory;
    channels: PaymentChannel[];
    selectedChannel: PaymentChannel | null;
    onSelect: (channel: PaymentChannel) => void;
    isExpanded: boolean;
    onToggle: () => void;
    amount: number;
    currency: string;
}) {
    const categoryChannels = channels.filter((ch) => {
        return ch.category?.code === category.code;
    });

    if (categoryChannels.length === 0) return null;

    // Mobile: 3, Desktop: 4
    const previewChannels = categoryChannels.slice(0, 4);

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-3 last:mb-0">
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full px-3 py-3 md:px-4 md:py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            >
                <span className="font-bold text-sm md:text-base text-gray-900 dark:text-white">
                    {category.title}
                </span>
                <div className="flex items-center gap-2 md:gap-3">
                    {!isExpanded && previewChannels.length > 0 && (
                        <div className="flex items-center gap-1">
                            {/* Show only 3 on mobile, 4 on desktop */}
                            {previewChannels.map((ch, idx) => (
                                <div key={ch.code} className={cn("relative h-4 w-auto md:h-6", idx >= 3 && "hidden md:block")}>
                                    <Image
                                        src={ch.image}
                                        alt={ch.name}
                                        width={32}
                                        height={24}
                                        className="h-full w-auto object-contain"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    )}
                </div>
            </button>

            {isExpanded && (
                <div className="p-3 md:p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 xs:grid-cols-3 gap-3 md:gap-4">
                        {categoryChannels.map((channel) => {
                            const isSelected = selectedChannel?.code === channel.code;
                            const fee =
                                channel.feeAmount + (amount * channel.feePercentage) / 100;
                            const totalWithFee = amount + fee;

                            const isAvailable = amount > 0 ? (totalWithFee >= channel.minAmount && totalWithFee <= channel.maxAmount) : true;

                            return (
                                <button
                                    key={channel.code}
                                    onClick={() => {
                                        if (isAvailable) onSelect(channel);
                                    }}
                                    disabled={!isAvailable}
                                    className={cn(
                                        'relative flex flex-col items-center p-3 md:p-4 rounded-xl border-2 transition-all min-h-[100px] justify-center text-center group',
                                        isSelected
                                            ? 'border-primary-500 bg-white dark:bg-gray-800 ring-4 ring-primary-500/10 shadow-lg shadow-primary-500/10'
                                            : 'border-transparent bg-white dark:bg-gray-800 shadow-sm',
                                        isAvailable
                                            ? 'hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md hover:-translate-y-0.5'
                                            : 'opacity-50 cursor-not-allowed grayscale bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                                    )}
                                >
                                    <div className="relative h-8 md:h-10 w-full mb-3 flex items-center justify-center">
                                        <Image
                                            src={channel.image}
                                            alt={channel.name}
                                            width={64}
                                            height={40}
                                            className="h-full w-auto object-contain"
                                        />
                                    </div>

                                    <span className={cn(
                                        "text-[10px] md:text-xs font-semibold leading-tight line-clamp-2",
                                        isSelected ? "text-primary-700 dark:text-primary-400" : "text-gray-700 dark:text-gray-300"
                                    )}>
                                        {channel.name}
                                    </span>

                                    {amount > 0 && isAvailable && (
                                        <div className="mt-2 flex flex-col items-center">
                                            <span className="text-[10px] text-gray-400 line-through">
                                                {fee > 0 ? formatCurrency(amount, currency) : ''}
                                            </span>
                                            <span className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(Math.round(totalWithFee), currency)}
                                            </span>
                                        </div>
                                    )}

                                    {!isAvailable && amount > 0 && (
                                        <span className="text-[9px] md:text-[10px] text-red-500 font-bold mt-2 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                                            {totalWithFee < channel.minAmount
                                                ? `Min ${formatCurrency(channel.minAmount, currency)}`
                                                : `Max ${formatCurrency(channel.maxAmount, currency)}`}
                                        </span>
                                    )}

                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center shadow-sm">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
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
}

export default function RechargePage() {
    const router = useRouter(); // Initialize router
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

    // Modal State
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [depositInquiryData, setDepositInquiryData] = useState<DepositInquiry | null>(null);

    useEffect(() => {
        async function fetchPaymentMethods() {
            setIsLoading(true);
            try {
                const [categoriesRes, channelsRes] = await Promise.all([
                    getPaymentChannelCategories(regionCode, 'deposit'),
                    getPaymentChannels(regionCode, 'deposit'),
                ]);

                const categories = categoriesRes.data || [];
                const channels = channelsRes.data || [];

                setPaymentCategories(categories);
                setPaymentChannels(channels);

                // Auto-expand first category if available
                if (categories.length > 0) {
                    setExpandedCategory(categories[0].code);
                }

            } catch (error) {
                console.error('Failed to fetch payment methods:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchPaymentMethods();
    }, [regionCode, language]);

    // Handle Inquiry Creation (Step 1)
    const handleCreateInquiry = async () => {
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
                setIsSubmitting(false);
                return;
            }

            if (inquiryRes.data) {
                // Set data and show modal
                // Cast to unknown first to avoid strict type mismatch if inferred type differs slightly
                setDepositInquiryData(inquiryRes.data as unknown as DepositInquiry);
                setShowConfirmModal(true);
                // Note: Keep isSubmitting true or false?
                // Usually false to stop button loading, but then modal handles its own loading.
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Deposit inquiry error:', error);
            setError(language === 'id' ? 'Gagal membuat permintaan deposit' : 'Failed to create deposit inquiry');
            setIsSubmitting(false);
        }
    };

    // Handle Final Deposit Creation (Step 2 - from Modal)
    const handleConfirmDeposit = async () => {
        if (!token || !depositInquiryData) return;

        setIsSubmitting(true); // Helper validasi loading di modal

        try {
            const depositRes = await createDeposit(
                depositInquiryData.validationToken,
                token.accessToken
            );

            if (depositRes.error) {
                setError(depositRes.error.message);
                setShowConfirmModal(false); // Close modal on error to show error toast
                return;
            }

            if (depositRes.data?.deposit) {
                // Redirect to DEPOSIT invoice page (SPA)
                router.push(getLocalizedPath(`/deposit/invoice/${depositRes.data.deposit.invoiceNumber}`));
            }
        } catch (error) {
            console.error('Deposit error:', error);
            setError(language === 'id' ? 'Gagal membuat deposit' : 'Failed to create deposit');
            setShowConfirmModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const fee = selectedPayment
        ? selectedPayment.feeAmount + (amount * selectedPayment.feePercentage) / 100
        : 0;
    const total = amount + fee;

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-3xl mx-auto">
                {/* Header Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 shadow-sm">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {t('topUp')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {language === 'id' ? 'Isi saldo akunmu dengan mudah dan aman' : 'Top up your account balance easily and securely'}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Main Content */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 shadow-sm">
                        {isLoading ? (
                            <div className="flex justify-center py-20">
                                <LoadingSpinner size="lg" />
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Amount Selection */}
                                <div>
                                    <label className="block text-base font-bold text-gray-900 dark:text-white mb-4">
                                        {t('selectAmount')}
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                                        {presetAmounts.map((preset) => (
                                            <button
                                                key={preset}
                                                onClick={() => setAmount(preset)}
                                                className={cn(
                                                    'py-4 px-4 rounded-2xl border-2 font-bold transition-all text-sm md:text-base',
                                                    amount === preset
                                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 ring-2 ring-primary-500/20'
                                                        : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50'
                                                )}
                                            >
                                                {formatCurrency(preset, currency)}
                                            </button>
                                        ))}
                                    </div>
                                    <Input
                                        label=""
                                        type="number"
                                        placeholder={t('customAmount')}
                                        value={amount.toString()}
                                        onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                                        leftIcon={<span className="text-sm font-bold text-gray-500">{currency}</span>}
                                        className="text-lg font-bold"
                                    />
                                </div>

                                {/* Payment Method Selection */}
                                <div>
                                    <label className="block text-base font-bold text-gray-900 dark:text-white mb-4">
                                        {t('selectPayment')}
                                    </label>
                                    <div className="space-y-3">
                                        {/* 1. Uncategorized Channels (e.g. QRIS) - List Style */}
                                        {(() => {
                                            const channelsWithoutCategory = paymentChannels.filter(
                                                (ch) => !ch.category || !ch.category.code
                                            );
                                            if (channelsWithoutCategory.length === 0) return null;

                                            return channelsWithoutCategory.map((channel) => {
                                                const isSelected = selectedPayment?.code === channel.code;
                                                const channelFee = channel.feeAmount + (amount * channel.feePercentage) / 100;
                                                const totalWithFee = amount + channelFee;
                                                const isAvailable = amount > 0 ? (totalWithFee >= channel.minAmount && totalWithFee <= channel.maxAmount) : true;

                                                return (
                                                    <button
                                                        key={channel.code}
                                                        onClick={() => isAvailable && setSelectedPayment(channel)}
                                                        disabled={!isAvailable}
                                                        className={cn(
                                                            'flex items-center gap-3 md:gap-4 w-full px-4 py-4 rounded-xl border-2 transition-all text-left relative',
                                                            isSelected
                                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/10 ring-1 ring-primary-500'
                                                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
                                                            isAvailable
                                                                ? 'hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer hover:shadow-md hover:-translate-y-0.5'
                                                                : 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50 grayscale'
                                                        )}
                                                    >
                                                        <div className="relative h-10 w-16 shrink-0">
                                                            <Image
                                                                src={channel.image}
                                                                alt={channel.name}
                                                                fill
                                                                className="object-contain"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col flex-1 min-w-0">
                                                            <span className="font-bold text-gray-900 dark:text-white text-sm md:text-base truncate">
                                                                {channel.name}
                                                            </span>

                                                            {amount > 0 && isAvailable ? (
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className="text-xs text-gray-400 line-through hidden sm:inline-block">
                                                                        {channelFee > 0 ? formatCurrency(amount, currency) : ''}
                                                                    </span>
                                                                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                                                                        {formatCurrency(Math.round(totalWithFee), currency)}
                                                                    </span>
                                                                </div>
                                                            ) : !isAvailable && amount > 0 ? (
                                                                <span className="text-[10px] md:text-xs text-red-500 font-bold mt-0.5">
                                                                    {totalWithFee < channel.minAmount
                                                                        ? `Min Rp ${channel.minAmount.toLocaleString('id-ID')}`
                                                                        : `Max Rp ${channel.maxAmount.toLocaleString('id-ID')}`}
                                                                </span>
                                                            ) : null}
                                                        </div>

                                                        {isSelected && (
                                                            <div className="shrink-0 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-sm animate-in zoom-in-50 duration-200">
                                                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            });
                                        })()}

                                        {/* 2. Categorized Channels - Accordion Style */}
                                        {paymentCategories.map((category) => (
                                            <PaymentCategorySection
                                                key={category.code}
                                                category={category}
                                                channels={paymentChannels}
                                                selectedChannel={selectedPayment}
                                                onSelect={setSelectedPayment}
                                                isExpanded={expandedCategory === category.code}
                                                onToggle={() => setExpandedCategory(expandedCategory === category.code ? '' : category.code)}
                                                amount={amount}
                                                currency={currency}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sticky Footer Summary */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 md:static md:bg-transparent md:border-0 md:shadow-none md:p-0">
                        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Total Bayar</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg md:text-xl font-extrabold text-primary-600 dark:text-primary-400">
                                        {selectedPayment ? formatCurrency(Math.round(total), currency) : '-'}
                                    </span>
                                    {fee > 0 && <span className="text-xs text-gray-400">(Termasuk Fee)</span>}
                                </div>
                            </div>

                            <Button
                                onClick={handleCreateInquiry}
                                disabled={!selectedPayment || amount <= 0}
                                isLoading={isSubmitting}
                                className="w-auto px-8 rounded-full font-bold shadow-lg shadow-primary-500/20"
                                size="lg"
                            >
                                {t('topUpNow')}
                            </Button>
                        </div>
                    </div>
                    {/* Spacer for fixed footer */}
                    <div className="h-20 md:hidden" />
                </div>

                {/* Confirmation Modal */}
                <DepositConfirmationModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={handleConfirmDeposit}
                    depositData={depositInquiryData}
                    locale={language}
                    isLoading={isSubmitting}
                />

                {/* Error Toast */}
                {error && (
                    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium animate-in slide-in-from-bottom-5 z-50">
                        {error}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
