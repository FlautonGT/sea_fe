'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, Home } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button, LoadingPage } from '@/components/ui';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { useAuth } from '@/contexts/AuthContext';
import { Invoice } from '@/types';
import { getInvoiceDetails } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import PaymentStatusAnimation from '@/components/payment/PaymentStatusAnimation';
import { AnimatedCheck, AnimatedProcessing, AnimatedPending, AnimatedFailed, AnimatedExpired, AnimatedRefunded } from '@/components/ui/AnimatedIcons';
import { formatCurrency, cn } from '@/lib/utils';
import { getTransactionStatusColor, getPaymentStatusColor, getStatusTranslationKey } from '@/lib/status';
import { translations } from '@/lib/translations';
import { saveRecentAccount } from '@/lib/recentAccounts';
import { getLocalTransactions, syncLocalTransaction } from '@/lib/localHistory';

// New Components
import HorizontalStepper from '@/components/payment/HorizontalStepper';
import AccountInfoCard from '@/components/payment/AccountInfoCard';
import TransactionStatusCard from '@/components/payment/TransactionStatusCard';
import PaymentInstructionCard from '@/components/payment/PaymentInstructionCard';
import Timeline from '@/components/payment/Timeline'; // Kept as optional legacy/history view if needed at bottom
import { getReviews, postReview } from '@/lib/api';
import { Review, ReviewPayload } from '@/types';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { toast } from 'sonner';

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

  // Review State
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [isCheckingReview, setIsCheckingReview] = useState(false);

  // Helper to check for client-side expiry
  const checkExpiry = (data: Invoice): Invoice => {
    const { paymentStatus, transactionStatus } = data.status;

    // If already final state, return as is
    if (paymentStatus === 'PAID' || paymentStatus === 'EXPIRED' || paymentStatus === 'REFUNDED' || paymentStatus === 'FAILED') return data;
    if (transactionStatus === 'SUCCESS' || transactionStatus === 'FAILED') return data;

    // Check if expired
    if (data.expiredAt && new Date() >= new Date(data.expiredAt)) {
      return {
        ...data,
        status: {
          ...data.status,
          paymentStatus: 'EXPIRED',
          transactionStatus: 'FAILED' // As requested: "expired and failed"
        }
      };
    }
    return data;
  };

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
          const checked = checkExpiry(response.data);
          setInvoice(checked);
          // Sync with local storage
          syncLocalTransaction(regionCode, checked);
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
    if (!invoice || (invoice.status.transactionStatus !== 'PENDING' && invoice.status.transactionStatus !== 'PROCESSING')) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await getInvoiceDetails(
          invoiceNumber,
          regionCode,
          token?.accessToken
        );
        if (response.data) {
          const checkedData = checkExpiry(response.data);
          // Compare with current invoice state logic could be complex due to object ref, 
          // but we mainly care if status changed OR if it just expired client-side.
          // Simplest is to just set it if anything different or just set it.
          // Let's check status specifically to avoid unnecessary re-renders/animations if deep equal.
          if (
            checkedData.status.transactionStatus !== invoice.status.transactionStatus ||
            checkedData.status.paymentStatus !== invoice.status.paymentStatus
          ) {
            setInvoice(checkedData);
            setShowAnimation(true);
            setAnimationComplete(false);
          }
          // Sync with local storage
          syncLocalTransaction(regionCode, checkedData);
        }
      } catch (error) {
        console.error('Failed to poll invoice status:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [invoice, invoiceNumber, regionCode, token]);

  // Save successful transaction to recent accounts
  useEffect(() => {
    if (invoice && invoice.status.transactionStatus === 'SUCCESS') {
      const accountData = invoice.account as any;
      if (accountData?.userId) {
        const inputs = [
          { label: 'id', value: accountData.userId }
        ];
        if (accountData.zoneId) {
          inputs.push({ label: 'server', value: accountData.zoneId });
        }

        saveRecentAccount(regionCode, invoice.product?.code || '', {
          nickname: invoice.account?.nickname || '',
          inputs: inputs,
          lastUsed: new Date().toISOString(),
        });
      }
    }
  }, [invoice, regionCode]);

  // Fetch last transactions
  const [lastTransactions, setLastTransactions] = useState<any[]>([]);
  useEffect(() => {
    // Import dynamically or assume imported
    setLastTransactions(getLocalTransactions(regionCode));
  }, [regionCode]);

  // Check for existing review
  useEffect(() => {
    async function checkReview() {
      if (invoice?.status.transactionStatus === 'SUCCESS') {
        setIsCheckingReview(true);
        try {
          const res = await getReviews({ invoiceNumber: invoiceNumber, region: regionCode });
          if (res.data && res.data.reviews.length > 0) {
            setExistingReview(res.data.reviews[0]);
          }
        } catch (e) {
          console.error("Failed to check review", e);
        } finally {
          setIsCheckingReview(false);
        }
      }
    }
    if (invoiceNumber && invoice?.status.transactionStatus === 'SUCCESS') {
      checkReview();
    }
  }, [invoice, invoiceNumber, regionCode]);

  const handleReviewSubmit = async (data: ReviewPayload) => {
    try {
      const res = await postReview(data);
      if (res.data) {
        setExistingReview(res.data);
        toast.success(language === 'id' ? "Ulasan berhasil dikirim!" : "Review submitted!");
      } else {
        toast.error(language === 'id' ? "Gagal mengirim ulasan." : "Failed to submit review.");
      }
    } catch (e) {
      console.error(e);
      toast.error(language === 'id' ? "Gagal mengirim ulasan." : "Failed to submit review.");
    }
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    setAnimationComplete(true);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  // Determine detailed status for Animation
  const getDisplayStatus = () => {
    // OLD: const { status, paymentStatus } = invoice;
    // NEW:
    const { paymentStatus, transactionStatus } = invoice.status;

    if (transactionStatus === 'SUCCESS') return 'SUCCESS';

    if (paymentStatus === 'REFUNDED') return 'REFUNDED';
    if (paymentStatus === 'EXPIRED') return 'EXPIRED';

    // Check Transaction FAILED first (Prioritize showing failure over weird states if transaction explicitly failed)
    if (transactionStatus === 'FAILED') return 'FAILED_TRANSACTION';

    if (paymentStatus === 'FAILED') return 'FAILED_PAYMENT';

    if (paymentStatus === 'PAID' || transactionStatus === 'PROCESSING') return 'PROCESSING';
    return 'PENDING';
  };

  const displayStatus = getDisplayStatus();

  // Animation Status Mapping
  const getAnimationStatus = (): 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' => {
    switch (displayStatus) {
      case 'SUCCESS': return 'SUCCESS';
      case 'PROCESSING': return 'PROCESSING';
      case 'EXPIRED': return 'EXPIRED';
      case 'FAILED_PAYMENT':
      case 'FAILED_TRANSACTION':
      case 'REFUNDED':
        return 'FAILED';
      default: return 'PENDING';
    }
  };

  const shouldShowAnimation = showAnimation && !animationComplete;

  return (
    <MainLayout>
      <AnimatePresence mode="wait">
        {shouldShowAnimation && (
          <PaymentStatusAnimation
            key="animation"
            status={getAnimationStatus()}
            paymentCode={invoice?.payment?.code}
            onAnimationComplete={handleAnimationComplete}
            message={displayStatus === 'SUCCESS' ? (language === 'id' ? 'Pembayaran Berhasil!' : 'Payment Successful!') : undefined}
          />
        )}

        {animationComplete && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-slate-50 dark:bg-slate-950/50 pb-20 relative overflow-hidden"
          >
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">
              {/* Header Progress Stepper */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <HorizontalStepper
                  status={displayStatus}
                  language={language}
                  timeline={invoice.timeline}
                />
              </motion.div>

              {/* Main Content Grid */}
              <div className="mt-8 grid grid-cols-1 gap-8">

                {/* Account & Transaction Dashboards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <AccountInfoCard order={invoice} language={language} />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <TransactionStatusCard
                      order={invoice}
                      language={language}
                      onCopy={handleCopy}
                      copied={copied}
                    />
                  </motion.div>
                </div>

                {invoice.status.transactionStatus === 'PENDING' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <PaymentInstructionCard
                      order={invoice}
                      language={language}
                      onCopy={handleCopy}
                      copied={copied}
                    />
                  </motion.div>
                )}

                {/* Review Section (Success Only) */}
                {invoice.status.transactionStatus === 'SUCCESS' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    {!existingReview ? (
                      <ReviewForm invoiceNumber={invoiceNumber} onSubmit={handleReviewSubmit} />
                    ) : (
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                          {language === 'id' ? 'Ulasan Anda' : 'Your Review'}
                        </h3>
                        <ReviewCard review={existingReview} />
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Last Transactions List Removed */}

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
