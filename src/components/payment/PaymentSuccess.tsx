'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Copy } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatCurrency, cn } from '@/lib/utils';
import { Order } from '@/types';
import { useLocale } from '@/contexts/LocaleContext';

interface PaymentSuccessProps {
  order: Order;
  currency: string;
  language: 'id' | 'en';
  onCopy?: (text: string) => void;
  copied?: boolean;
}

export default function PaymentSuccess({
  order,
  currency,
  language,
  onCopy,
  copied,
}: PaymentSuccessProps) {
  const { getLocalizedPath } = useLocale();
  const { payment, pricing, account, productName, skuName, invoiceNumber } = order;

  const accountData = account as any;
  const accountId = accountData?.userId || (accountData?.inputs ? accountData.inputs.split(' - ')[0] : '') || '';
  const accountNickname = account?.nickname || '';

  const total = pricing?.total || 0;
  const orderCurrency = pricing?.currency || currency;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="text-center p-6 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {language === 'id' ? 'Transaksi Selesai!' : 'Transaction Completed!'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {language === 'id'
            ? `Transaksi berhasil — ${skuName} segera masuk. Cek game kamu sebentar lagi`
            : `Transaction successful — ${skuName} will be credited soon. Check your game shortly`}
        </p>

        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>

      {/* Order Details Table */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        <div className="flex justify-between items-center px-6 py-3">
          <span className="text-sm text-gray-500">Jenis Pembelian</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-white text-sm">{skuName}</span>
          </div>
        </div>

        <div className="flex justify-between items-center px-6 py-3">
          <span className="text-sm text-gray-500">ID Akun</span>
          <span className="font-semibold text-gray-900 dark:text-white text-sm">{accountId || '-'}</span>
        </div>

        {accountNickname && (
          <div className="flex justify-between items-center px-6 py-3">
            <span className="text-sm text-gray-500">Nama Akun</span>
            <span className="font-semibold text-gray-900 dark:text-white text-sm">{accountNickname}</span>
          </div>
        )}

        <div className="flex justify-between items-center px-6 py-3">
          <span className="text-sm text-gray-500">Metode Pembayaran</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              {payment?.name || payment?.code}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-6 border-t border-gray-100 dark:border-gray-700">
        <Link href={getLocalizedPath('/')}>
          <Button fullWidth className="bg-primary-600 hover:bg-primary-700">
            {language === 'id' ? 'Kembali' : 'Back'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
