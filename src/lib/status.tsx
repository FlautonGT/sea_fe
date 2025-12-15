import { Transaction, Deposit } from "@/types";

export type TransactionStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'FAILED' | 'EXPIRED' | 'REFUNDED';

export const getTransactionStatusColor = (status: string): string => {
    switch (status) {
        case 'SUCCESS':
            return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
        case 'PENDING':
            return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
        case 'PROCESSING':
            return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
        case 'FAILED':
            return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
        default:
            return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
};

export const getPaymentStatusColor = (status: string): string => {
    switch (status) {
        case 'PAID':
            return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
        case 'UNPAID':
            return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
        case 'REFUNDED':
            return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
        case 'EXPIRED':
            return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
        case 'FAILED':
            return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
        default:
            return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
};

export const getStatusTranslationKey = (status: string, type: 'transaction' | 'payment'): string => {
    if (!status) return '';
    const normalizedStatus = status.toLowerCase();
    if (type === 'transaction') {
        return `status_${normalizedStatus}`;
    }
    return `status_${normalizedStatus}`;
};
