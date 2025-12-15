'use client';

import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils'; // Assuming date formatter exists or I will accept raw string and format inline if needed

interface TimelineItem {
    message: string;
    status: string;
    timestamp: string;
}

interface TimelineProps {
    items?: TimelineItem[];
    className?: string;
    language?: 'id' | 'en';
}

export default function Timeline({ items = [], className, language = 'id' }: TimelineProps) {
    if (!items || items.length === 0) return null;

    // Icons mapping based on status
    const getIcon = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'PENDING':
                return <Clock className="w-5 h-5 text-amber-500" />;
            case 'PROCESSING':
                return <RefreshCcw className="w-5 h-5 text-blue-500 animate-spin-slow" />; // animate-spin-slow needs to be in tailwind or just spin
            case 'FAILED':
            case 'FAILED_PAYMENT':
            case 'FAILED_TRANSACTION':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'EXPIRED':
                return <AlertCircle className="w-5 h-5 text-gray-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS': return 'bg-green-100 border-green-200 dark:bg-green-900/20 dark:border-green-800';
            case 'PENDING': return 'bg-amber-100 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
            case 'PROCESSING': return 'bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
            case 'FAILED':
            case 'FAILED_PAYMENT':
            case 'FAILED_TRANSACTION':
                return 'bg-red-100 border-red-200 dark:bg-red-900/20 dark:border-red-800';
            case 'EXPIRED': return 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
            default: return 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700';
        }
    };

    return (
        <div className={cn("bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm", className)}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-600" />
                {language === 'id' ? 'Riwayat Transaksi' : 'Transaction History'}
            </h3>

            <div className="relative pl-4 border-l-2 border-gray-100 dark:border-gray-700 space-y-8">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const status = item.status;

                    return (
                        <motion.div
                            key={`${index}-${item.timestamp}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                        >
                            {/* Dot on the line */}
                            <div className="absolute -left-[25px] top-1">
                                <div className={cn("w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center bg-white dark:bg-gray-800 shadow-sm")}>
                                    {getIcon(status)}
                                </div>
                            </div>

                            <div className={cn("p-4 rounded-xl border", getStatusColor(status))}>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                                    <span className={cn(
                                        "text-xs font-bold px-2 py-0.5 rounded-full w-fit",
                                        status === 'SUCCESS' ? "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200" :
                                            status === 'PENDING' ? "bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200" :
                                                status === 'PROCESSING' ? "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                                                    status === 'FAILED' ? "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200" :
                                                        "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                    )}>
                                        {status}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                        {new Date(item.timestamp).toLocaleString(language === 'id' ? 'id-ID' : 'en-US', {
                                            day: 'numeric', month: 'short', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-2">
                                    {item.message}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
