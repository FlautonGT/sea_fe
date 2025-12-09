'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Receipt, ChevronRight, Search, Filter } from 'lucide-react';
import { Input, Button, LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { Transaction } from '@/types';
import { getTransactions } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  UNPAID: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  PAID: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SUCCESS: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  EXPIRED: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
  REFUNDED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export default function TransactionsPage() {
  const { token } = useAuth();
  const { regionCode, currency, getLocalizedPath, language } = useLocale();
  const { t } = useTranslation();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    async function fetchTransactions() {
      if (!token) return;
      setIsLoading(true);

      try {
        const response = await getTransactions(token.accessToken, {
          region: regionCode,
          page,
          limit: 20,
        });

        if (response.data) {
          const transactions = response.data.transactions;
          if (page === 1) {
            setTransactions(transactions);
          } else {
            setTransactions((prev) => [...prev, ...transactions]);
          }
          setHasMore(transactions.length === 20);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, [token, regionCode, page]);

  const filteredTransactions = transactions.filter((t) =>
    t.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.productName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('transactions')}
          </h1>
          <div className="flex items-center gap-2">
            <Input
              placeholder={t('searchTransaction')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="w-full sm:w-64"
            />
          </div>
        </div>

        {isLoading && page === 1 ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {t('noTransactions')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <Link
                key={transaction.invoiceNumber}
                href={getLocalizedPath(`/invoice/${transaction.invoiceNumber}`)}
                className="block bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {transaction.productName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.skuName}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                        {transaction.invoiceNumber}
                      </span>
                      <span className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded-full',
                        statusColors[transaction.status] || statusColors.UNPAID
                      )}>
                        {transaction.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </span>
                      <span className="font-semibold text-primary-600 dark:text-primary-400">
                        {formatCurrency(transaction.pricing?.total || 0, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  isLoading={isLoading}
                >
                  {t('loadMore')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

