'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Receipt } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Input, Button } from '@/components/ui';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';

export default function CheckTransactionPage() {
  const router = useRouter();
  const { getLocalizedPath } = useLocale();
  const { t, language } = useTranslation();
  
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [error, setError] = useState('');

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
      <div className="max-w-lg mx-auto px-4 py-12">
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

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
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
    </MainLayout>
  );
}

