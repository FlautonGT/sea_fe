'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Receipt, Clock, Tag } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Input, Button } from '@/components/ui';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';

import { getLocalTransactions } from '@/lib/localHistory';
import Link from 'next/link';
import { formatCurrency, cn } from '@/lib/utils';
import { getTransactionStatusColor, getPaymentStatusColor, getStatusTranslationKey } from '@/lib/status';
import { translations } from '@/lib/translations';
import Image from 'next/image';

export default function CheckTransactionPage() {
  const router = useRouter();
  const { getLocalizedPath, regionCode, currency } = useLocale();
  const { t, language } = useTranslation();

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  // Load history on mount
  React.useEffect(() => {
    setHistory(getLocalTransactions(regionCode));
  }, [regionCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!invoiceNumber.trim()) {
      setError(language === 'id' ? 'Nomor invoice wajib diisi' : 'Invoice number is required');
      return;
    }

    // Redirect to invoice page
    router.push(getLocalizedPath(`/invoice/${invoiceNumber.trim()}`));
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Check Transaction Form */}
        <div className="max-w-lg mx-auto mb-16">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('checkTransaction')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('checkTransactionDesc')}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={t('invoiceNumber')}
                value={invoiceNumber}
                onChange={(e) => {
                  setInvoiceNumber(e.target.value);
                  setError('');
                }}
                placeholder={t('invoiceNumberPlaceholder')}
                leftIcon={<Search className="w-4 h-4" />}
                error={error}
              />

              <Button type="submit" fullWidth>
                {t('checkNow')}
              </Button>
            </form>
          </div>
        </div>

        {/* Local History Section */}
        {history.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {language === 'id' ? 'Transaksi Terakhir' : 'Last Transactions'}
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">No. Invoice</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User Input</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Harga</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Pembayaran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {history.map((trx) => (
                      <tr key={trx.invoiceNumber} className="group hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-all">
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 align-middle">
                          <Link href={getLocalizedPath(`/invoice/${trx.invoiceNumber}`)} className="hover:text-primary-600 transition-colors font-medium">
                            {trx.invoiceNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                              {trx.product.name}
                            </span>
                            <span className="text-xs text-gray-500 mt-0.5">
                              {trx.sku.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 align-middle font-mono text-xs">
                          {/* Handling potential different structures of account inputs */}
                          {/* New structure relies on account.userId/zoneId as per user request */}
                          {(trx.account as any).inputs
                            ? (Array.isArray((trx.account as any).inputs)
                              ? (trx.account as any).inputs.map((i: any) => i.value).join(' ')
                              : (trx.account as any).inputs)
                            : (trx.account?.userId ? `${trx.account.userId} ${trx.account.zoneId ? `(${trx.account.zoneId})` : ''}`
                              : trx.account?.nickname || '-')
                          }
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white align-middle">
                          {formatCurrency(trx.pricing?.total || 0, currency)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 align-middle font-medium">
                          {new Date(trx.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-right align-middle">
                          <span className={cn(
                            "font-bold text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border",
                            getTransactionStatusColor(trx.status.transactionStatus)
                          )}>
                            {translations[language]?.[getStatusTranslationKey(trx.status.transactionStatus, 'transaction')] || trx.status.transactionStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right align-middle">
                          <span className={cn(
                            "font-bold text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border",
                            getPaymentStatusColor(trx.status.paymentStatus)
                          )}>
                            {translations[language]?.[getStatusTranslationKey(trx.status.paymentStatus, 'payment')] || trx.status.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

