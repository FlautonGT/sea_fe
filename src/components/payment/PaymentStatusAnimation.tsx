'use client';

import React, { useEffect, useState } from 'react';
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
    title: { id: 'Pembayaran Kadaluarsa', en: 'Payment Expired' },
    subtitle: { id: 'Batas waktu pembayaran telah berakhir. Silahkan lakukan pembelian ulang.', en: 'Payment deadline has expired. Please make a new purchase.' },
  },
  EXPIRED: {
    color: 'from-red-400 to-red-500',
    bgColor: 'bg-gradient-to-br from-red-400 to-red-500',
    iconBg: 'bg-white/20',
    title: { id: 'Pembayaran Kadaluarsa', en: 'Payment Expired' },
    subtitle: { id: 'Batas waktu pembayaran telah berakhir. Silahkan lakukan pembelian ulang.', en: 'Payment deadline has expired. Please make a new purchase.' },
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

export default function PaymentStatusAnimation({
  status,
  paymentCode,
  onAnimationComplete,
  message,
  subMessage,
}: PaymentStatusAnimationProps) {
  const [phase, setPhase] = useState<'fullscreen' | 'collapsing' | 'complete'>('fullscreen');
  const [showContent, setShowContent] = useState(false);
  const config = statusConfig[status];


  useEffect(() => {
    // Show content after small delay
    const contentTimer = setTimeout(() => setShowContent(true), 200);

    // Start collapsing after 3 seconds (giving more time to see animation)
    const collapseTimer = setTimeout(() => setPhase('collapsing'), 3000);

    // Complete after 4 seconds
    const completeTimer = setTimeout(() => {
      setPhase('complete');
      onAnimationComplete?.();
    }, 4000);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(collapseTimer);
      clearTimeout(completeTimer);
    };
  }, [onAnimationComplete]);

  if (phase === 'complete') return null;

  const renderIcon = () => {
    const size = 80;

    switch (status) {
      case 'SUCCESS':
        return (
          <div className="relative">
            <div className={cn(
              "w-32 h-32 rounded-full flex items-center justify-center bg-white shadow-2xl animate-in zoom-in duration-500",
            )}>
              <AnimatedCheck size={size} color="#10B981" />
            </div>
            <SuccessParticles />
            <DecorativeDots status={status} />
          </div>
        );
      case 'FAILED':
      case 'EXPIRED':
        return (
          <div className="relative">
            <div className={cn(
              "w-32 h-32 rounded-full flex items-center justify-center bg-white shadow-2xl animate-in zoom-in duration-500",
            )}>
              <AnimatedFailed size={size} color="#EF4444" />
            </div>
            <DecorativeDots status={status} />
          </div>
        );
      case 'PROCESSING':
        return (
          <div className={cn(
            "w-32 h-32 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md shadow-xl border border-white/20 animate-in zoom-in duration-500",
          )}>
            <AnimatedProcessing size={size} color="white" />
          </div>
        );
      default: // PENDING
        return (
          <div className="relative">
            <div className={cn(
              "w-32 h-32 rounded-2xl flex items-center justify-center bg-white shadow-2xl rotate-3 animate-in zoom-in duration-500",
            )}>
              <AnimatedPending size={size} color="#F59E0B" />
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)]",
        config.bgColor,
        phase === 'collapsing' ? "translate-y-full opacity-0 rounded-[50%]" : "translate-y-0 text-white rounded-none"
      )}
    >
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Icon */}
        <div className={cn(
          "mb-8 transition-all duration-700 delay-100",
          showContent ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-50 translate-y-12"
        )}>
          {renderIcon()}
        </div>

        {/* Title */}
        <h1 className={cn(
          "text-3xl md:text-5xl font-extrabold text-white text-center mb-6 tracking-tight drop-shadow-md transition-all duration-700 delay-200",
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {message || config.title.id}
        </h1>

        {/* Subtitle */}
        <p className={cn(
          "text-white/90 text-lg md:text-xl text-center max-w-lg px-6 font-medium leading-relaxed drop-shadow-sm transition-all duration-700 delay-300",
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {subMessage || config.subtitle.id}
        </p>
      </div>
    </div>
  );
}
