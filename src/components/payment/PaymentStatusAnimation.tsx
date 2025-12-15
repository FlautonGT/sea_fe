'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock, CreditCard, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedCheck, AnimatedProcessing, AnimatedPending, AnimatedFailed } from '@/components/ui/AnimatedIcons';

interface PaymentStatusAnimationProps {
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';
  paymentCode?: string;
  onAnimationComplete?: () => void;
  message?: string;
  subMessage?: string;
}

const statusConfig = {
  PENDING: {
    color: 'from-amber-400 to-yellow-500',
    bgColor: 'bg-gradient-to-br from-amber-400 to-yellow-500',
    iconBg: 'bg-white/20',
    title: { id: 'Menunggu Pembayaran', en: 'Awaiting Payment' },
    subtitle: { id: 'Silahkan untuk melakukan pembayaran dengan metode yang kamu pilih.', en: 'Please make payment with your selected method.' },
  },
  PROCESSING: {
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600',
    iconBg: 'bg-white/20',
    title: { id: 'Sedang Diproses', en: 'Processing' },
    subtitle: { id: 'Pembayaran diterima, pesanan sedang diproses.', en: 'Payment received, order is being processed.' },
  },
  SUCCESS: {
    color: 'from-emerald-400 to-green-500',
    bgColor: 'bg-gradient-to-br from-emerald-400 to-green-500',
    iconBg: 'bg-white/30',
    title: { id: 'Pesanan Selesai!', en: 'Order Complete!' },
    subtitle: { id: 'Pesanan kamu sudah berhasil diproses!', en: 'Your order has been successfully processed!' },
  },
  FAILED: {
    color: 'from-red-400 to-red-500',
    bgColor: 'bg-gradient-to-br from-red-400 to-red-500',
    iconBg: 'bg-white/20',
    title: { id: 'Transaksi Gagal', en: 'Transaction Failed' },
    subtitle: { id: 'Mohon maaf, transaksi kamu gagal. Silahkan coba lagi atau hubungi admin.', en: 'We are sorry, your transaction failed. Please try again or contact admin.' },
  },
  EXPIRED: {
    color: 'from-red-400 to-red-500',
    bgColor: 'bg-gradient-to-br from-red-400 to-red-500',
    iconBg: 'bg-white/20',
    title: { id: 'Transaksi Kadaluarsa', en: 'Transaction Expired' },
    subtitle: { id: 'Waktu pembayaran telah berakhir. Transaksi dibatalkan otomatis.', en: 'Payment time has ended. Transaction automatically cancelled.' },
  },
};

// Confetti/Sparkle particle for success animation
function Particle({ delay, x, y, color }: { delay: number; x: number; y: number; color: string }) {
  return (
    <div
      className={cn(
        "absolute w-2 h-2 rounded-full animate-ping",
        color
      )}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${delay}ms`,
        animationDuration: '1.5s',
      }}
    />
  );
}

// Decorative dots around the icon
function DecorativeDots({ status }: { status: string }) {
  const isSuccess = status === 'SUCCESS';
  const isFailed = status === 'FAILED' || status === 'EXPIRED';

  const dots = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30) * (Math.PI / 180);
    const radius = 60;
    const x = 50 + Math.cos(angle) * radius / 2;
    const y = 50 + Math.sin(angle) * radius / 2;

    return (
      <div
        key={i}
        className={cn(
          "absolute w-1.5 h-1.5 rounded-full transition-all duration-500",
          isSuccess ? "bg-green-300/60" : isFailed ? "bg-red-300/60" : "bg-white/40"
        )}
        style={{
          left: `${x}%`,
          top: `${y}%`,
          transform: 'translate(-50%, -50%)',
          animationDelay: `${i * 100}ms`,
        }}
      />
    );
  });

  return <>{dots}</>;
}

// Success confetti particles
function SuccessParticles() {
  const particles = [
    { x: 30, y: 20, color: 'bg-pink-400', delay: 0 },
    { x: 70, y: 25, color: 'bg-red-400', delay: 200 },
    { x: 25, y: 35, color: 'bg-white/60', delay: 400 },
    { x: 75, y: 40, color: 'bg-emerald-200', delay: 100 },
    { x: 35, y: 50, color: 'bg-white/40', delay: 300 },
    { x: 65, y: 55, color: 'bg-pink-300', delay: 500 },
    { x: 40, y: 25, color: 'bg-red-300', delay: 150 },
    { x: 60, y: 30, color: 'bg-white/50', delay: 250 },
  ];

  return (
    <>
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}
    </>
  );
}
import { useLocale } from '@/contexts/LocaleContext';

export default function PaymentStatusAnimation({
  status,
  paymentCode,
  onAnimationComplete,
  message,
  subMessage,
}: PaymentStatusAnimationProps) {
  const { language } = useLocale();
  const [isMounted, setIsMounted] = useState(true);
  const config = statusConfig[status];

  useEffect(() => {
    // Determine wait time based on status (failed/expired might need less "celebration" time)
    const waitTime = status === 'PENDING' ? 3000 : 3500;

    const timer = setTimeout(() => {
      setIsMounted(false);
      // Trigger completion slightly after to allow state change to propagate
      // But for layout animation, we want the swap to happen. 
      // Actually, if we want layout animation, we need the component to unmount 
      // exactly when the new one mounts.
      onAnimationComplete?.();
    }, waitTime);

    return () => clearTimeout(timer);
  }, [status, onAnimationComplete]);

  // We rely on the parent removing this component to trigger the layout animation
  // The parent should conditionally render this OR the content.
  // We use motion.div with layoutId to seamlessly morph into the target.

  const size = 80;
  const renderIcon = () => {
    switch (status) {
      case 'SUCCESS':
        return (
          <div className="relative">
            <motion.div
              layoutId="status-icon-bg"
              className="w-32 h-32 rounded-full flex items-center justify-center bg-white shadow-2xl"
            >
              <AnimatedCheck size={size} color="#10B981" />
            </motion.div>
            <SuccessParticles />
            <DecorativeDots status={status} />
          </div>
        );
      case 'FAILED':
      case 'EXPIRED':
        return (
          <div className="relative">
            <motion.div
              layoutId="status-icon-bg"
              className="w-32 h-32 rounded-full flex items-center justify-center bg-white shadow-2xl"
            >
              <AnimatedFailed size={size} color="#EF4444" />
            </motion.div>
            <DecorativeDots status={status} />
          </div>
        );
      case 'PROCESSING':
        return (
          <motion.div
            layoutId="status-icon-bg"
            className="w-32 h-32 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md shadow-xl border border-white/20"
          >
            <AnimatedProcessing size={size} color="white" />
          </motion.div>
        );
      default: // PENDING
        return (
          <div className="relative">
            <motion.div
              layoutId="status-icon-bg"
              className="w-32 h-32 rounded-2xl flex items-center justify-center bg-white shadow-2xl rotate-3"
            >
              <AnimatedPending size={size} color="#F59E0B" />
            </motion.div>
          </div>
        );
    }
  };

  return (
    <motion.div
      layoutId="status-container"
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center p-4",
        config.bgColor
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
    >
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center max-w-lg w-full">
        {/* Icon */}
        <div className="mb-8">
          {renderIcon()}
        </div>

        {/* Title */}
        <motion.h1
          layoutId="status-title"
          className="text-3xl md:text-5xl font-extrabold text-white text-center mb-6 tracking-tight drop-shadow-md"
        >
          {message || (language === 'id' ? config.title.id : config.title.en)}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          layoutId="status-text"
          className="text-white/90 text-lg md:text-xl text-center font-medium leading-relaxed drop-shadow-sm"
        >
          {subMessage || (language === 'id' ? config.subtitle.id : config.subtitle.en)}
        </motion.p>
      </div>
    </motion.div>
  );
}
