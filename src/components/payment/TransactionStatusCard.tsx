import React from 'react';
import Image from 'next/image';
import { CreditCard, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Order, Invoice } from '@/types';
import { getTransactionStatusColor, getPaymentStatusColor, getStatusTranslationKey } from '@/lib/status';
import { translations } from '@/lib/translations';

interface TransactionStatusCardProps {
    order: Order | Invoice;
    language: string;
    onCopy: (text: string) => void;
    copied: boolean;
}

export default function TransactionStatusCard({ order, language, onCopy, copied }: TransactionStatusCardProps) {
    const { payment, status, invoiceNumber } = order;
    const { paymentStatus, transactionStatus } = status;

    const getStatusBadge = (statusStr: string, type: 'transaction' | 'payment') => {
        const colorClass = type === 'transaction'
            ? getTransactionStatusColor(statusStr)
            : getPaymentStatusColor(statusStr);

        const translationKey = getStatusTranslationKey(statusStr, type);
        const label = translations[language]?.[translationKey] || statusStr;

        return (
            <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", colorClass)}>
                {label}
            </span>
        );
    };

    const getMessage = () => {
        if (paymentStatus === 'EXPIRED') return language === 'id' ? 'Waktu pembayaran telah berakhir. Transaksi kadaluarsa.' : 'Payment time has ended. Transaction expired.';
        if (transactionStatus === 'PENDING') return language === 'id' ? 'Menunggu pembayaran...' : 'Waiting for payment...';
        if (transactionStatus === 'PROCESSING') return language === 'id' ? 'Pesanan Anda sedang diproses. Mohon tunggu!' : 'Your order is being processed. Please wait!';
        if (transactionStatus === 'SUCCESS') return language === 'id' ? 'Transaksi Anda telah selesai' : 'Your transaction has been completed';
        if (transactionStatus === 'FAILED') return language === 'id' ? 'Transaksi gagal. Silahkan hubungi CS.' : 'Transaction failed. Please contact support.';
        if (transactionStatus === 'EXPIRED') return language === 'id' ? 'Waktu pembayaran berakhir.' : 'Payment time expired.';
        return '';
    };

    return (
        <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/20 dark:hover:border-white/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div>
                <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-6 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    {language === 'id' ? 'Metode Pembayaran' : 'Payment Method'}
                </h3>

                <div className="flex items-center gap-4 mb-8 bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                    {payment?.image || payment?.code ? (
                        <div className="bg-white p-2 rounded-lg shadow-sm shrink-0 border border-slate-100">
                            <Image
                                src={payment.image || `/payment/${payment.code.toLowerCase()}.png`}
                                alt={payment.name || 'Payment'}
                                width={50}
                                height={20}
                                className="h-6 w-auto object-contain"
                            />
                        </div>
                    ) : (
                        <div className="bg-slate-200 dark:bg-white/10 p-2 rounded-lg shadow-sm shrink-0 h-10 w-14 flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-slate-400" />
                        </div>
                    )}
                    <div>
                        <p className="text-slate-900 dark:text-white font-bold text-lg leading-tight">{payment?.name || payment?.code}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{payment?.categoryCode?.replace('_', ' ') || 'Direct Payment'}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                        <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{language === 'id' ? 'Nomor Invoice' : 'Invoice Number'}</span>
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-black/20 pl-3 pr-2 py-1 rounded-lg border border-slate-200 dark:border-white/5">
                            <span className="text-slate-700 dark:text-white font-mono text-sm tracking-wide">{invoiceNumber}</span>
                            <button onClick={() => onCopy(invoiceNumber)} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white transition-colors p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded">
                                <Copy className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                        <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{language === 'id' ? 'Status Pembayaran' : 'Payment Status'}</span>
                        {getStatusBadge(paymentStatus || 'UNPAID', 'payment')}
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                        <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{language === 'id' ? 'Status Transaksi' : 'Transaction Status'}</span>
                        {getStatusBadge(transactionStatus, 'transaction')}
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center">
                    {getMessage()}
                </p>
            </div>
        </div>
    );
}
