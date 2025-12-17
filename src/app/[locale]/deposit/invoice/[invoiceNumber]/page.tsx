'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, Home, CheckCircle, Wallet, Clock, XOctagon } from 'lucide-react';
import { Button, LoadingPage } from '@/components/ui';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { useAuth } from '@/contexts/AuthContext';
import { Deposit, Order } from '@/types';
import { getDepositInvoice } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import PaymentStatusAnimation from '@/components/payment/PaymentStatusAnimation';
import HorizontalStepper from '@/components/payment/HorizontalStepper';
import AccountInfoCard from '@/components/payment/AccountInfoCard';
import TransactionStatusCard from '@/components/payment/TransactionStatusCard';
import PaymentInstructionCard from '@/components/payment/PaymentInstructionCard';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DepositInvoicePage() {
    const params = useParams();
    const invoiceNumber = params.invoiceNumber as string;

    const { token, user } = useAuth();
    const { regionCode, currency, getLocalizedPath, language } = useLocale();
    const { t } = useTranslation();

    const [deposit, setDeposit] = useState<Deposit | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    // Animation States
    const [showAnimation, setShowAnimation] = useState(true);
    const [animationComplete, setAnimationComplete] = useState(false);

    // Helper to normalize API response
    const normalizeDeposit = (data: any): Deposit => {
        if (data && typeof data.status === 'object' && data.status?.status) {
            return { ...data, status: data.status.status };
        }
        return data as Deposit;
    };

    const fetchInvoice = useCallback(async () => {
        if (!token) return;
        try {
            const response = await getDepositInvoice(
                invoiceNumber,
                token.accessToken
            );

            if (response.error) {
                setError(response.error.message);
                // If error, stop loading so we show error state
                setIsLoading(false);
            } else if (response.data) {
                let data = normalizeDeposit(response.data);

                // Client-side expiry check
                if (data.status === 'PENDING' && data.expiredAt && new Date() >= new Date(data.expiredAt)) {
                    data = { ...data, status: 'EXPIRED' };
                }

                setDeposit(data);
                // IMPORTANT: Only set loading to false on initial load or success
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Failed to fetch invoice:', error);
            setError(language === 'id' ? 'Gagal memuat data invoice' : 'Failed to load invoice');
            setIsLoading(false);
        }
    }, [token, invoiceNumber, language]);

    useEffect(() => {
        if (invoiceNumber) {
            setIsLoading(true);
            fetchInvoice();
        }
    }, [invoiceNumber, token, language, fetchInvoice]);

    // Polling for status updates (for pending deposits)
    useEffect(() => {
        if (!deposit || deposit.status !== 'PENDING') return;

        const pollInterval = setInterval(async () => {
            try {
                const response = await getDepositInvoice(
                    invoiceNumber,
                    token?.accessToken || ''
                );

                if (response.data) {
                    let normalizedData = normalizeDeposit(response.data);

                    // Client-side expiry check
                    if (normalizedData.status === 'PENDING' && normalizedData.expiredAt && new Date() >= new Date(normalizedData.expiredAt)) {
                        normalizedData = { ...normalizedData, status: 'EXPIRED' };
                    }

                    if (normalizedData.status !== deposit.status) {
                        setDeposit(normalizedData);
                        setShowAnimation(true);
                        setAnimationComplete(false);
                    }
                }
            } catch (error) {
                console.error('Failed to poll deposit status:', error);
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(pollInterval);
    }, [deposit, invoiceNumber, token]);

    const handleAnimationComplete = () => {
        setShowAnimation(false);
        setAnimationComplete(true);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
            </div>
        );
    }

    if (error || !deposit) {
        return (
            <div className="max-w-lg mx-auto px-4 py-12 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {language === 'id' ? 'Invoice tidak ditemukan' : 'Invoice not found'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {error || (language === 'id' ? 'Invoice yang Anda cari tidak dapat ditemukan' : 'The invoice you are looking for could not be found')}
                </p>
                <Link href={getLocalizedPath('/deposit')}>
                    <Button>
                        <Home className="w-4 h-4 mr-2" />
                        {language === 'id' ? 'Kembali ke Riwayat' : 'Back to History'}
                    </Button>
                </Link>
            </div>
        );
    }

    // Helper to map Deposit to Order for PaymentInstructionCard and other components reuse
    const mapDepositToOrder = (deposit: Deposit): Order => {
        return {
            // Mock required fields suited for Deposit display
            invoiceNumber: deposit.invoiceNumber,
            createdAt: deposit.createdAt,
            expiredAt: deposit.expiredAt || '',
            product: {
                code: 'DEPOSIT',
                image: '',
                name: language === 'id' ? 'Isi Ulang Saldo' : 'Balance Recharge'
            },
            sku: {
                code: 'WALLET',
                image: '',
                name: formatCurrency(deposit.total, deposit.currency || 'IDR')
            },
            quantity: 1,
            // Map nested status to Order status structure
            status: {
                transactionStatus: deposit.status as any,
                paymentStatus: deposit.status === 'SUCCESS' ? 'PAID' : 'UNPAID'
            },
            // Mock account info with current user data since it's a self-deposit
            account: {
                nickname: user?.firstName || 'User',
                userId: user?.email || '',
                zoneId: ''
            },
            contact: {
                phoneNumber: user?.phoneNumber || ''
            },
            timeline: deposit.timeline || [],

            pricing: {
                total: deposit.total,
                subtotal: deposit.amount, // Using amount as subtotal
                paymentFee: deposit.paymentFee,
                currency: deposit.currency || 'IDR',
                discount: 0
            },
            payment: {
                code: deposit.payment.code,
                name: deposit.payment.name,
                image: deposit.payment.image || '',
                expiredAt: deposit.payment.expiredAt || deposit.expiredAt || '',

                paymentCode: deposit.payment.paymentCode,
                paymentType: deposit.payment.paymentType as any,

                qrString: deposit.payment.qrString || deposit.payment.code, // Fallback logic if needed
                accountNumber: deposit.payment.accountNumber,
                redirectUrl: deposit.payment.redirectUrl,

                instructions: deposit.payment.instruction ? [deposit.payment.instruction] : undefined,
            }
        } as unknown as Order;
    };

    const orderMapped = mapDepositToOrder(deposit);

    // Determine detailed status for Animation
    const getDisplayStatus = () => {
        const status = deposit.status;

        if (status === 'SUCCESS') return 'SUCCESS';
        if (status === 'FAILED') return 'FAILED_TRANSACTION'; // Use specific failed type if consistent with InvoicePage
        if (status === 'EXPIRED') return 'EXPIRED';
        if (status === 'PENDING') return 'PENDING';

        return 'PENDING';
    };

    const displayStatus = getDisplayStatus();

    // Animation Status Mapping
    const getAnimationStatus = (): 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' => {
        switch (displayStatus) {
            case 'SUCCESS': return 'SUCCESS';
            // Deposit doesn't usually have "PROCESSING", but if it did:
            // case 'PROCESSING': return 'PROCESSING';
            case 'EXPIRED': return 'EXPIRED';
            case 'FAILED_TRANSACTION': return 'FAILED';
            default: return 'PENDING';
        }
    };

    const shouldShowAnimation = showAnimation && !animationComplete;

    return (
        <DashboardLayout>
            <AnimatePresence mode="wait">
                {shouldShowAnimation && (
                    <PaymentStatusAnimation
                        key="animation"
                        status={getAnimationStatus()}
                        paymentCode={deposit.payment.paymentCode}
                        onAnimationComplete={handleAnimationComplete}
                        message={displayStatus === 'SUCCESS' ? (language === 'id' ? 'Deposit Berhasil!' : 'Deposit Successful!') : undefined}
                    />
                )}

                {animationComplete && (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="min-h-screen pb-20 relative overflow-hidden"
                    >
                        {/* Ambient Background Effects */}
                        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
                        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

                        <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">
                            {/* Breadcrumb / Back Link */}
                            <Link href={getLocalizedPath('/deposit')} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6">
                                <Home className="w-4 h-4 mr-2" />
                                {language === 'id' ? 'Kembali ke Riwayat' : 'Back to History'}
                            </Link>

                            {/* Header Progress Stepper */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="mb-8"
                            >
                                <HorizontalStepper
                                    status={displayStatus}
                                    language={language}
                                    timeline={deposit.timeline}
                                />
                            </motion.div>

                            {/* Main Content Grid */}
                            <div className="grid grid-cols-1 gap-8">
                                {/* Account & Transaction Dashboards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    >
                                        <AccountInfoCard order={orderMapped} language={language} />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.3 }}
                                    >
                                        <TransactionStatusCard
                                            order={orderMapped}
                                            language={language}
                                            onCopy={handleCopy}
                                            copied={copied}
                                        />
                                    </motion.div>
                                </div>

                                {/* Payment Instructions (Only if Pending) */}
                                {deposit.status === 'PENDING' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.4 }}
                                    >
                                        <PaymentInstructionCard
                                            order={orderMapped}
                                            language={language}
                                            onCopy={handleCopy}
                                            copied={copied}
                                        />
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
