'use client';

import React from 'react';
import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { Order } from '@/types';
import { useLocale } from '@/contexts/LocaleContext';

interface PaymentFailedProps {
  order: Order;
  currency?: string;
  language: 'id' | 'en';
  onCopy?: (text: string) => void;
  copied?: boolean;
  onNewTransaction?: () => void;
}

export default function PaymentFailed({
  order,
  language,
  onNewTransaction,
}: PaymentFailedProps) {
  const { getLocalizedPath } = useLocale();
  const { payment, account, productName, skuName } = order;
  
  const accountData = account as any;
  const accountId = accountData?.userId || (accountData?.inputs ? accountData.inputs.split(' - ')[0] : '') || '';
  const accountNickname = account?.nickname || '';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="text-center p-6 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {language === 'id' ? 'Pembayaran Gagal!' : 'Payment Failed!'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {language === 'id'
            ? 'Kamu melewati batas waktu pembayaran. Silakan buat transaksi baru untuk melanjutkan.'
            : 'You have exceeded the payment time limit. Please create a new transaction to continue.'}
        </p>
        
        {/* Failed Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center">
            <XCircle className="w-12 h-12 text-white" />
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

      {/* Action Buttons */}
      <div className="p-6 pt-4 flex gap-4 border-t border-gray-100 dark:border-gray-700">
        <Link href={getLocalizedPath('/check-transaction')} className="flex-1">
          <Button variant="outline" fullWidth>
            {language === 'id' ? 'Cek Riwayat Pesanan' : 'Check Order History'}
          </Button>
        </Link>
        <Link href={getLocalizedPath('/')} className="flex-1">
          <Button fullWidth className="bg-primary-600 hover:bg-primary-700">
            {language === 'id' ? 'Buat Transaksi Baru' : 'Create New Transaction'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
