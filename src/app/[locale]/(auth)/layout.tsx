'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';
import Logo from '@/components/ui/Logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getLocalizedPath } = useLocale();

  return (
    <div className="min-h-screen flex">
      {/* Left side - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="absolute inset-0">
          <Image
            src="https://nos.jkt-1.neo.id/gate/banners/mobile-legends-banner.webp"
            alt="Game Background"
            fill
            className="object-cover opacity-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-primary-600/60" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <Link href={getLocalizedPath('/')}>
            <Image
              src="/logo.svg"
              alt="Seaply"
              width={150}
              height={50}
              className="h-12 w-auto brightness-0 invert"
            />
          </Link>
          <h1 className="text-3xl font-bold text-white mt-8 text-center">
            Top Up Game & Pulsa
          </h1>
          <p className="text-white/80 mt-4 text-center max-w-md">
            Semua kebutuhan game & pulsa dalam satu aplikasi, dijamin cepat, mudah, aman.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col min-h-screen bg-white dark:bg-gray-900">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-gray-200 dark:border-gray-700">
          <Link href={getLocalizedPath('/')}>
            <Logo className="h-8 w-auto" />
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

