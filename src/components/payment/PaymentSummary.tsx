'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Copy, CheckCircle, ExternalLink, ChevronDown, ChevronUp, Download, Clock } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatCurrency, cn } from '@/lib/utils';
import { Order } from '@/types';
import { useLocale } from '@/contexts/LocaleContext';

interface PaymentSummaryProps {
  order: Order;
  currency: string;
  language: 'id' | 'en';
  onCopy?: (text: string) => void;
  copied?: boolean;
}

// Progress Step Component
function ProgressStep({
  step,
  label,
  sublabel,
  isActive,
  isCompleted,
  isLast
}: {
  step: number;
  label: string;
  sublabel: string;
  isActive: boolean;
  isCompleted: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex-1 flex flex-col items-center relative">
      {/* Connector line */}
      {!isLast && (
        <div className={cn(
          "absolute top-4 left-1/2 w-full h-0.5",
          isCompleted ? "bg-green-500" : "bg-gray-200"
        )} />
      )}

      {/* Step circle */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center z-10 text-sm font-bold transition-all",
        isCompleted ? "bg-green-500 text-white" :
          isActive ? "bg-primary-600 text-white" :
            "bg-gray-200 text-gray-400"
      )}>
        {isCompleted ? <CheckCircle className="w-5 h-5" /> : step}
      </div>

      {/* Labels */}
      <span className={cn(
        "mt-2 text-xs font-semibold text-center",
        isActive || isCompleted ? "text-primary-600" : "text-gray-400"
      )}>
        {label}
      </span>
      <span className="text-[10px] text-gray-400 text-center mt-0.5 max-w-[80px]">
        {sublabel}
      </span>
    </div>
  );
}

// Countdown Timer
function CountdownTimer({ expiredAt }: { expiredAt: string }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expired = new Date(expiredAt).getTime();
      const diff = Math.max(0, expired - now);

      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [expiredAt]);

  return (
    <div className="text-sm text-gray-600">
      QR Code akan hangus pada{' '}
      <span className="text-red-500 font-bold">
        {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

export default function PaymentSummary({
  order,
  currency,
  language,
  onCopy,
  copied,
}: PaymentSummaryProps) {
  const { getLocalizedPath } = useLocale();
  const { payment, pricing, account, productName, skuName, quantity, invoiceNumber, timeline, expiredAt, createdAt } = order;
  const { transactionStatus } = order.status;

  // Handle account data
  const accountData = account as any;
  const accountId = accountData?.userId || (accountData?.inputs ? accountData.inputs.split(' - ')[0] : '') || '';
  const accountZoneId = accountData?.zoneId || (accountData?.inputs ? accountData.inputs.split(' - ')[1] : '') || '';
  const accountNickname = account?.nickname || '';

  const subtotal = pricing?.subtotal || 0;
  const discount = pricing?.discount || 0;
  const paymentFee = pricing?.paymentFee || 0;
  const total = pricing?.total || 0;
  const orderCurrency = pricing?.currency || currency;

  // Determine payment type from paymentType or categoryCode
  const paymentType = (payment as any)?.paymentType?.toUpperCase() || '';
  const categoryCode = payment?.categoryCode?.toUpperCase() || '';
  const methodCode = payment?.code?.toUpperCase() || '';

  const isQRIS = paymentType === 'QRIS' || categoryCode === 'QRIS' || methodCode.includes('QRIS');
  const isVA = paymentType === 'VIRTUAL_ACCOUNT' || categoryCode === 'VIRTUAL_ACCOUNT' || methodCode.includes('VA');
  const isEWallet = paymentType === 'E_WALLET' || categoryCode === 'E_WALLET' || ['GOPAY', 'DANA', 'OVO', 'SHOPEEPAY'].some(w => methodCode.includes(w));
  const isRetail = paymentType === 'RETAIL' || categoryCode === 'RETAIL' || ['ALFAMART', 'INDOMARET'].some(r => methodCode.includes(r));
  const isCard = categoryCode === 'CARD' || ['CARD', 'CREDIT', 'DEBIT'].some(c => methodCode.includes(c));

  // Payment code from new API format (unified paymentCode field)
  const unifiedPaymentCode = (payment as any)?.paymentCode || '';

  // QR Code URL from qrserver API (for QRIS)
  const qrCodeUrl = (isQRIS && unifiedPaymentCode)
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(unifiedPaymentCode)}`
    : null;

  // Barcode URL (for Retail)
  const barcodeUrl = (isRetail && unifiedPaymentCode)
    ? `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(unifiedPaymentCode)}&scale=3&height=15&includetext`
    : null;

  // Expandable sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    pricing: false,
    instruction: false,
  });
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="text-center p-6 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {language === 'id' ? 'Yuk Segera Selesaikan Pembayaran!' : 'Complete Your Payment Soon!'}
        </h2>
        {isQRIS && expiredAt && (
          <CountdownTimer expiredAt={expiredAt} />
        )}
        {!isQRIS && expiredAt && (
          <p className="text-sm text-gray-500">
            {language === 'id' ? 'Lakukan pembayaran sebelum' : 'Make payment before'}{' '}
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {new Date(expiredAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}{' '}
              Pukul{' '}
              {new Date(expiredAt).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </p>
        )}
      </div>

      {/* QRIS QR Code - Only show when PENDING */}
      {transactionStatus === 'PENDING' && isQRIS && qrCodeUrl && (
        <div className="p-6 flex flex-col items-center border-b border-gray-100 dark:border-gray-700">
          <div className="mb-2">
            <Image
              src="/qris-logo.png"
              alt="QRIS"
              width={80}
              height={30}
              className="h-6 w-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <Image
              src={qrCodeUrl}
              alt="QR Code"
              width={200}
              height={200}
              className="rounded"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              const link = document.createElement('a');
              link.href = qrCodeUrl;
              link.download = `qris-${invoiceNumber}.png`;
              link.click();
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Unduh Kode QR
          </Button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Screenshot jika QR Code tidak di download.
          </p>
        </div>
      )}

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
            {payment?.code && (
              <Image
                src={`/payment/${payment.code.toLowerCase()}.png`}
                alt={payment.name || ''}
                width={60}
                height={20}
                className="h-5 w-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              {payment?.name || payment?.code}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center px-6 py-3">
          <span className="text-sm text-gray-500">Total Pembayaran</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(total, orderCurrency)}
            </span>
            <button
              onClick={() => onCopy?.(total.toString())}
              className="px-3 py-1 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
            >
              {copied ? '✓ Disalin' : 'Salin'}
            </button>
          </div>
        </div>

        {/* Virtual Account Number - Only show when PENDING */}
        {transactionStatus === 'PENDING' && isVA && unifiedPaymentCode && (
          <div className="flex justify-between items-center px-6 py-3 bg-blue-50 dark:bg-blue-900/20">
            <span className="text-sm text-gray-500">Nomor Virtual Account</span>
            <div className="flex items-center gap-2">
              <code className="font-mono font-bold text-gray-900 dark:text-white">
                {unifiedPaymentCode}
              </code>
              <button
                onClick={() => onCopy?.(unifiedPaymentCode)}
                className="px-3 py-1 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
              >
                {copied ? '✓ Disalin' : 'Salin'}
              </button>
            </div>
          </div>
        )}

        {/* Retail Code with Barcode - Only show when PENDING */}
        {transactionStatus === 'PENDING' && isRetail && unifiedPaymentCode && (
          <div className="px-6 py-4 bg-orange-50 dark:bg-orange-900/20">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500">Kode Pembayaran</span>
              <div className="flex items-center gap-2">
                <code className="font-mono font-bold text-gray-900 dark:text-white">
                  {unifiedPaymentCode}
                </code>
                <button
                  onClick={() => onCopy?.(unifiedPaymentCode)}
                  className="px-3 py-1 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
                >
                  {copied ? '✓ Disalin' : 'Salin'}
                </button>
              </div>
            </div>
            {barcodeUrl && (
              <div className="flex justify-center">
                <Image
                  src={barcodeUrl}
                  alt="Barcode"
                  width={200}
                  height={60}
                  className="rounded"
                  unoptimized
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* E-Wallet / Card Redirect Button - Only show when PENDING */}
      {transactionStatus === 'PENDING' && (isEWallet || isCard) && (unifiedPaymentCode || payment?.redirectUrl) && paymentType === 'E_WALLET' && (
        <div className="p-6 border-t border-gray-100 dark:border-gray-700">
          <Button
            fullWidth
            onClick={() => window.open(unifiedPaymentCode || payment?.redirectUrl, '_blank')}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {isEWallet ? `Bayar dengan ${payment?.name}` : 'Lanjutkan ke Gateway Pembayaran'}
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
          {payment?.deeplink && (
            <Button
              variant="outline"
              fullWidth
              className="mt-2"
              onClick={() => window.location.href = payment.deeplink!}
            >
              Buka Aplikasi
            </Button>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-6 flex gap-4 border-t border-gray-100 dark:border-gray-700">
        <Link href={getLocalizedPath('/invoice')} className="flex-1">
          <Button variant="outline" fullWidth>
            Cek Riwayat Pesanan
          </Button>
        </Link>
        <Link href={getLocalizedPath('/')} className="flex-1">
          <Button fullWidth className="bg-primary-600 hover:bg-primary-700">
            Topup Voucher Lainnya
          </Button>
        </Link>
      </div>

      {/* Payment Guide - Only show when PENDING */}
      {transactionStatus === 'PENDING' && (
        <div className="border-t border-gray-100 dark:border-gray-700">
          <h3 className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
            Panduan Pembayaran
          </h3>

          {/* How to Pay - Expandable */}
          <button
            onClick={() => toggleSection('instruction')}
            className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-t border-gray-100 dark:border-gray-700"
          >
            <span className="text-sm text-gray-700 dark:text-gray-300">Cara Melakukan Pembayaran</span>
            {expandedSections.instruction ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          {expandedSections.instruction && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {isQRIS ? (
                  <>
                    <li>Pilih aplikasi e-wallet favoritmu (GoPay, DANA, OVO, dll)</li>
                    <li>Pilih menu &quot;Bayar dengan QR&quot; atau &quot;Scan&quot;</li>
                    <li>Scan QR code yang ditampilkan</li>
                    <li>Konfirmasi pembayaran di aplikasi</li>
                  </>
                ) : isVA ? (
                  <>
                    <li>Buka aplikasi mobile banking atau ATM</li>
                    <li>Pilih menu Transfer ke Virtual Account</li>
                    <li>Masukkan nomor Virtual Account</li>
                    <li>Konfirmasi jumlah dan lakukan pembayaran</li>
                  </>
                ) : isEWallet ? (
                  <>
                    <li>Klik tombol &quot;Bayar&quot; di atas</li>
                    <li>Anda akan diarahkan ke aplikasi e-wallet</li>
                    <li>Konfirmasi pembayaran di aplikasi</li>
                  </>
                ) : isRetail ? (
                  <>
                    <li>Kunjungi gerai {payment?.retailName || 'retail'} terdekat</li>
                    <li>Tunjukkan kode pembayaran ke kasir</li>
                    <li>Lakukan pembayaran</li>
                  </>
                ) : (
                  <>
                    <li>Ikuti instruksi pembayaran</li>
                    <li>Konfirmasi pembayaran</li>
                  </>
                )}
              </ol>
            </div>
          )}

          {/* Additional Note */}
          <div className="px-6 py-3 text-sm text-gray-500 border-t border-gray-100 dark:border-gray-700">
            Gunakan <span className="text-primary-600 font-medium">E-wallet</span> atau <span className="text-primary-600 font-medium">aplikasi mobile banking</span> yang tersedia scan QRIS
          </div>
        </div>
      )}
    </div>
  );
}
