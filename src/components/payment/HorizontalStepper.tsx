'use client';

import React from 'react';
import { Check, ShoppingBag, CreditCard, Loader2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HorizontalStepperProps {
    status: string;
    language: 'id' | 'en';
    timeline?: {
        status: string;
        message: string;
        timestamp: string;
    }[];
}

export default function HorizontalStepper({ status, language, timeline = [] }: HorizontalStepperProps) {
    const [activeTooltip, setActiveTooltip] = React.useState<number | null>(null);

    const isTransactionFailed = status === 'FAILED_TRANSACTION';

    const steps = [
        {
            id: 1,
            label: language === 'id' ? 'Transaksi Dibuat' : 'Transaction Created',
            icon: ShoppingBag,
            matchStatus: ['PENDING'],
        },
        {
            id: 2,
            label: status === 'EXPIRED'
                ? (language === 'id' ? 'Kadaluarsa' : 'Expired')
                : (language === 'id' ? 'Pembayaran' : 'Payment'),
            icon: status === 'EXPIRED' ? XCircle : CreditCard,
            matchStatus: ['PAYMENT', 'EXPIRED'],
        },
        {
            id: 3,
            label: language === 'id' ? 'Sedang Di Proses' : 'Processing',
            icon: Loader2,
            matchStatus: ['PROCESSING'],
        },
        {
            id: 4,
            label: isTransactionFailed
                ? (language === 'id' ? 'Transaksi Gagal' : 'Transaction Failed')
                : (language === 'id' ? 'Transaksi Selesai' : 'Transaction Success'),
            icon: isTransactionFailed ? XCircle : Check,
            matchStatus: ['SUCCESS', 'FAILED'],
        },
    ];

    // Helper to find relevant timeline info for a step
    const getStepInfo = (stepMatchStatus: string[]) => {
        return timeline?.find(t => stepMatchStatus.includes(t.status));
    };

    // Map status to progress value (0 to 3, can be fractional)
    // 0: Transaction Created
    // 1: Payment
    // 2: Processing
    // 3: Transaction Success
    const getProgressValue = () => {
        switch (status) {
            case 'PENDING': return 0.75; // Halfway between Created (0) and Payment (1)
            case 'PAID': return 1.15; // Halfway between Payment (1) and Processing (2)
            case 'PROCESSING': return 2.25; // Halfway between Processing (2) and Success (3)
            case 'SUCCESS': return 3; // Full Success
            case 'FAILED_TRANSACTION': return 2.75; // Full Fail (Fail at end)
            case 'FAILED': return 2.75;
            case 'FAILED_PAYMENT': return 2.75;
            case 'EXPIRED': return 1.15;
            case 'REFUNDED': return 2.75;
            case 'CANCELLED': return 2.75;
            default: return 0;
        }
    };

    // Map status to the ACTIVE step dot (0-3)
    const getActiveStepIndex = () => {
        switch (status) {
            case 'PENDING': return 1; // Waiting for Payment (Step 2)
            case 'PAID': return 2; // Payment done, entering Processing (Step 3)
            case 'PROCESSING': return 2.5; // Still Processing (Step 3)
            case 'SUCCESS': return 3; // Success (Step 4)
            case 'FAILED_TRANSACTION': return 3; // Fail (Step 4)
            case 'FAILED': return 3;
            case 'FAILED_PAYMENT': return 1;
            case 'EXPIRED': return 1;
            case 'REFUNDED': return 3;
            case 'CANCELLED': return 1;
            default: return 1; // Shows error at Payment step usually
        }
    };

    const progressValue = getProgressValue();
    const activeStepIndex = getActiveStepIndex();
    const isFailed = ['FAILED', 'FAILED_PAYMENT', 'FAILED_TRANSACTION', 'EXPIRED', 'REFUNDED', 'CANCELLED'].includes(status);

    return (
        <div className="w-full py-8">
            <div className="relative flex justify-between">
                {/* Progress Bar Background */}
                <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full -z-10" />

                {/* Active Progress Bar */}
                <motion.div
                    className={cn(
                        "absolute top-5 left-0 h-1 rounded-full -z-0 shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-500",
                        isFailed ? "bg-red-500 shadow-red-500/50" : "bg-emerald-500 shadow-emerald-500/50"
                    )}
                    initial={{ width: '0%' }}
                    animate={{ width: `${(progressValue / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index < activeStepIndex || (index === steps.length - 1 && activeStepIndex === steps.length - 1);
                    const isActive = index === activeStepIndex;
                    const isError = isFailed && isActive;

                    const isFinalSuccess = status === 'SUCCESS' && index === 3;
                    const effectiveCompleted = isCompleted || isFinalSuccess;

                    const stepInfo = getStepInfo(step.matchStatus);
                    const showTooltip = activeTooltip === step.id;

                    return (
                        <div
                            key={step.id}
                            className="flex flex-col items-center group relative w-1/4"
                            onMouseEnter={() => setActiveTooltip(step.id)}
                            onMouseLeave={() => setActiveTooltip(null)}
                            onClick={() => setActiveTooltip(activeTooltip === step.id ? null : step.id)}
                        >
                            <div className="relative z-20">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: isActive ? 1.2 : 1,
                                        backgroundColor: isError ? '#ef4444' : effectiveCompleted ? '#10b981' : 'var(--step-bg)',
                                    }}
                                    className={cn(
                                        "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10 cursor-pointer",
                                        !effectiveCompleted && !isActive && "bg-white dark:bg-slate-800 border-slate-200 dark:border-700 text-slate-300 dark:text-slate-500",
                                        effectiveCompleted && !isError && "bg-emerald-500 border-emerald-400 text-white",
                                        isError && "bg-red-500 border-red-400 text-white"
                                    )}
                                >
                                    <step.icon className={cn("w-3 h-3 md:w-4 md:h-4")} strokeWidth={3} />
                                </motion.div>

                                {/* Tooltip / Popover */}
                                <AnimatePresence>
                                    {showTooltip && stepInfo && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                            transition={{ duration: 0.2 }}
                                            className={cn(
                                                "absolute top-12 md:top-14 w-48 md:w-64 bg-white dark:bg-slate-800 p-2 md:p-3 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 text-center",
                                                index < 2 ? "left-0" : "right-0" // Left align first 2, Right align last 2
                                            )}
                                        >
                                            <div className="text-[10px] md:text-xs font-bold text-slate-900 dark:text-white mb-1">
                                                {new Date(stepInfo.timestamp).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}
                                            </div>
                                            <p className="text-[10px] md:text-xs text-slate-600 dark:text-slate-400 leading-snug">
                                                {stepInfo.message}
                                            </p>

                                            {/* Arrow */}
                                            <div className={cn(
                                                "absolute -top-1.5 w-3 h-3 bg-white dark:bg-slate-800 border-t border-l border-slate-200 dark:border-slate-700 rotate-45",
                                                index < 2 ? "left-4 md:left-5" : "right-4 md:right-5" // Adjust arrow to center of icon (w-8/w-10 -> 16px/20px center)
                                            )} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="text-center mt-2 md:mt-4 space-y-1">
                                <p className={cn(
                                    "text-[10px] sm:text-xs md:text-sm font-bold transition-colors uppercase tracking-tight leading-3 md:leading-normal",
                                    isError ? "text-red-500" : effectiveCompleted ? "text-emerald-500" : "text-slate-400 dark:text-slate-500"
                                )}>
                                    {step.label}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
