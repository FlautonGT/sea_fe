'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, Home } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button, LoadingPage } from '@/components/ui';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { useAuth } from '@/contexts/AuthContext';
import { Invoice } from '@/types';
import { getInvoiceDetails } from '@/lib/api';
import PaymentStatusAnimation from '@/components/payment/PaymentStatusAnimation';
import PaymentSummary from '@/components/payment/PaymentSummary';
import PaymentSuccess from '@/components/payment/PaymentSuccess';
import PaymentFailed from '@/components/payment/PaymentFailed';
import { AnimatedCheck, AnimatedProcessing, AnimatedPending, AnimatedFailed } from '@/components/ui/AnimatedIcons';

export default function InvoicePage() {
  const params = useParams();
  const invoiceNumber = params.invoiceNumber as string;

  const { token } = useAuth();
  const { regionCode, currency, getLocalizedPath, language } = useLocale();
  const { t } = useTranslation();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    async function fetchInvoice() {
      setIsLoading(true);
      try {
        const response = await getInvoiceDetails(
          invoiceNumber,
          regionCode,
          token?.accessToken
        );

        if (response.error) {
          setError(response.error.message);
        } else if (response.data) {
          setInvoice(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch invoice:', error);
        setError(language === 'id' ? 'Gagal memuat data invoice' : 'Failed to load invoice');
      } finally {
        setIsLoading(false);
      }
    }

    if (invoiceNumber) {
      fetchInvoice();
    }
  }, [invoiceNumber, regionCode, token, language]);

  // Polling for status updates (for pending orders)
  useEffect(() => {
    if (!invoice || invoice.status !== 'PENDING') return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await getInvoiceDetails(
          invoiceNumber,
          regionCode,
          token?.accessToken
        );
        if (response.data && response.data.status !== invoice.status) {
          setInvoice(response.data);
          setShowAnimation(true);
          setAnimationComplete(false);
        }
      } catch (error) {
        console.error('Failed to poll invoice status:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [invoice, invoiceNumber, regionCode, token]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    setAnimationComplete(true);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingPage message={t('loading')} />
      </MainLayout>
    );
  }

  if (error || !invoice) {
    return (
      <MainLayout>
        <div className="max-w-lg mx-auto px-4 py-12 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'id' ? 'Invoice tidak ditemukan' : 'Invoice not found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || (language === 'id' ? 'Invoice yang Anda cari tidak dapat ditemukan' : 'The invoice you are looking for could not be found')}
          </p>
          <Link href={getLocalizedPath('/')}>
            <Button>
              <Home className="w-4 h-4 mr-2" />
              {t('backToHome')}
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Map status for animation
  const getAnimationStatus = (): 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' => {
    const status = invoice.status;
    if (status === 'PENDING') return 'PENDING';
    if (status === 'PAID' || status === 'PROCESSING') return 'PROCESSING';
    if (status === 'SUCCESS') return 'SUCCESS';
    if (status === 'FAILED' || status === 'EXPIRED' || status === 'CANCELLED') return 'FAILED';
    return 'PENDING';
  };

  // Determine which component to show
  const isPending = invoice.status === 'PENDING';
  const isProcessing = invoice.status === 'PAID' || invoice.status === 'PROCESSING';
  const isSuccess = invoice.status === 'SUCCESS';
  const isFailed = invoice.status === 'FAILED' || invoice.status === 'EXPIRED' || invoice.status === 'CANCELLED';

  // Only show animation on initial load or status change
  const shouldShowAnimation = showAnimation && !animationComplete;

  return (
    <MainLayout>
      {/* Full Screen Animation */}
      {shouldShowAnimation && (
        <PaymentStatusAnimation
          status={getAnimationStatus()}
          paymentCode={invoice.payment?.code}
          onAnimationComplete={handleAnimationComplete}
        />
      )}

      {/* Content - only show after animation completes */}
      {animationComplete && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Status Header - Enhanced version */}
          <div className={`
            relative overflow-hidden rounded-3xl p-8 mb-8 text-center shadow-xl
            ${isPending ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
              isProcessing ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                isSuccess ? 'bg-gradient-to-br from-emerald-400 to-green-600' :
                  'bg-gradient-to-br from-red-500 to-pink-600'}
          `}>
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-4 bg-white/20 p-4 rounded-full backdrop-blur-md border border-white/30 shadow-inner">
                {/* Dynamic Status Icon */}
                {(() => {
                  const iconProps = { size: 40, color: 'white' };

                  if (isSuccess) return <AnimatedCheck {...iconProps} />;
                  if (isProcessing) return <AnimatedProcessing {...iconProps} />;
                  if (isFailed) return <AnimatedFailed {...iconProps} />;
                  return <AnimatedPending {...iconProps} />;
                })()}
              </div>

              <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                {isPending ? (language === 'id' ? 'Menunggu Pembayaran' : 'Awaiting Payment') :
                  isProcessing ? (language === 'id' ? 'Sedang Diproses' : 'Processing') :
                    isSuccess ? (language === 'id' ? 'Pesanan Selesai!' : 'Order Complete!') :
                      (language === 'id' ? 'Pembayaran Kadaluarsa' : 'Payment Expired')}
              </h1>
              <p className="text-white/90 text-base font-medium max-w-lg mx-auto leading-relaxed">
                {isPending ? (language === 'id' ? 'Silahkan untuk melakukan pembayaran dengan metode yang kamu pilih.' : 'Please make payment with your selected method.') :
                  isProcessing ? (language === 'id' ? 'Pembayaran diterima, pesanan sedang diproses.' : 'Payment received, order is being processed.') :
                    isSuccess ? (language === 'id' ? 'Pesanan kamu sudah berhasil diproses, layanan telah masuk ke akunmu!' : 'Your order has been successfully processed!') :
                      (language === 'id' ? 'Batas waktu pembayaran telah berakhir. Silahkan lakukan pembelian ulang.' : 'Payment deadline has expired. Please make a new purchase.')}
              </p>
            </div>
          </div>

          {/* Payment Summary / Details */}
          {isPending && (
            <PaymentSummary
              order={invoice}
              currency={currency}
              language={language}
              onCopy={handleCopy}
              copied={copied}
            />
          )}

          {isProcessing && (
            <PaymentSummary
              order={{ ...invoice, status: 'PROCESSING' }}
              currency={currency}
              language={language}
              onCopy={handleCopy}
              copied={copied}
            />
          )}

          {isSuccess && (
            <PaymentSuccess
              order={invoice}
              currency={currency}
              language={language}
              onCopy={handleCopy}
              copied={copied}
            />
          )}

          {isFailed && (
            <PaymentFailed
              order={invoice}
              currency={currency}
              language={language}
              onCopy={handleCopy}
              copied={copied}
            />
          )}
        </div>
      )}
    </MainLayout>
  );
}
