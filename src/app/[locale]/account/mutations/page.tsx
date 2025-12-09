'use client';

import React, { useEffect, useState } from 'react';
import { History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button, LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { Mutation } from '@/types';
import { getMutations } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';

export default function MutationsPage() {
  const { token } = useAuth();
  const { regionCode, currency, language } = useLocale();
  const { t } = useTranslation();

  const [mutations, setMutations] = useState<Mutation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    async function fetchMutations() {
      if (!token) return;
      setIsLoading(true);

      try {
        const response = await getMutations(token.accessToken, {
          region: regionCode,
          page,
          limit: 20,
        });

        if (response.data) {
          const mutationsList = response.data.mutations || [];
          if (page === 1) {
            setMutations(mutationsList);
          } else {
            setMutations((prev) => [...prev, ...mutationsList]);
          }
          setHasMore(mutationsList.length === 20);
        }
      } catch (error) {
        console.error('Failed to fetch mutations:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMutations();
  }, [token, regionCode, page]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {t('mutations')}
        </h1>

        {isLoading && page === 1 ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : mutations.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {t('noMutations')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {mutations.map((mutation, index) => {
              const isCredit = mutation.type === 'CREDIT';
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    isCredit
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                  )}>
                    {isCredit ? (
                      <ArrowDownLeft className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {mutation.description}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(mutation.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      'font-semibold',
                      isCredit
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    )}>
                      {isCredit ? '+' : '-'}{formatCurrency(mutation.amount, currency)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {language === 'id' ? 'Saldo' : 'Balance'}: {formatCurrency(mutation.balanceAfter, currency)}
                    </p>
                  </div>
                </div>
              );
            })}

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

