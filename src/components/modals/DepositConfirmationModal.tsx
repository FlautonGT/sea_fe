'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/translations';
import { DepositInquiry } from '@/types';

interface DepositConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    depositData: DepositInquiry | null;
    locale: string;
    isLoading: boolean;
}

export default function DepositConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    depositData,
    locale,
    isLoading,
}: DepositConfirmationModalProps) {
    if (!isOpen || !depositData) return null;

    const { deposit } = depositData;

    // Translations
    const trans = {
        title: locale === 'id' ? 'Konfirmasi Deposit' : 'Confirm Deposit',
        desc: locale === 'id' ? 'Pastikan data deposit sudah benar' : 'Please ensure deposit details are correct',
        amount: locale === 'id' ? 'Nominal Top Up' : 'Top Up Amount',
        fee: locale === 'id' ? 'Biaya Admin' : 'Admin Fee',
        total: locale === 'id' ? 'Total Pembayaran' : 'Total Payment',
        payment: locale === 'id' ? 'Metode Pembayaran' : 'Payment Method',
        cancel: locale === 'id' ? 'Batal' : 'Cancel',
        confirm: locale === 'id' ? 'Bayar Sekarang' : 'Pay Now',
    };

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
                        {trans.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {trans.desc}
                    </p>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 space-y-4">
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-gray-500 dark:text-gray-400">{trans.payment}</span>
                            <span className="font-bold text-gray-900 dark:text-white text-right max-w-[200px] truncate">
                                {deposit.payment.name}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 dark:text-gray-400">{trans.amount}</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {formatCurrency(deposit.amount, deposit.payment.currency)}
                            </span>
                        </div>
                        {deposit.pricing.paymentFee > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400">{trans.fee}</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {formatCurrency(deposit.pricing.paymentFee, deposit.payment.currency)}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-200 dark:border-gray-600">
                            <span className="font-bold text-gray-900 dark:text-white">{trans.total}</span>
                            <span className="font-extrabold text-lg text-primary-600 dark:text-primary-400">
                                {formatCurrency(deposit.pricing.total, deposit.payment.currency)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        fullWidth
                        disabled={isLoading}
                        className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 border-none text-gray-700 dark:text-gray-200"
                    >
                        {trans.cancel}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        fullWidth
                        isLoading={isLoading}
                        className="bg-primary-500 hover:bg-primary-600 text-white font-bold shadow-lg shadow-primary-500/20"
                    >
                        {trans.confirm}
                    </Button>
                </div>
            </div>
        </div>
    );
}
