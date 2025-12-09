'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { User, Receipt, History, FileText, Wallet, Settings } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { generateInitials, formatCurrency, cn } from '@/lib/utils';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { currency, getLocalizedPath, localeString } = useLocale();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(getLocalizedPath('/login'));
    }
  }, [isAuthenticated, isLoading, router, getLocalizedPath]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const menuItems = [
    { icon: User, label: t('profile'), href: '/account' },
    { icon: Receipt, label: t('transactions'), href: '/account/transactions' },
    { icon: History, label: t('mutations'), href: '/account/mutations' },
    { icon: FileText, label: t('reports'), href: '/account/reports' },
    { icon: Wallet, label: t('topUp'), href: '/account/topup' },
  ];

  const isActive = (href: string) => {
    const localizedHref = getLocalizedPath(href);
    if (href === '/account') {
      return pathname === localizedHref;
    }
    return pathname.startsWith(localizedHref);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-24">
              {/* User Info */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  {user.profilePicture ? (
                    <Image
                      src={user.profilePicture}
                      alt={user.firstName}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white text-xl font-bold">
                      {generateInitials(user.firstName, user.lastName)}
                    </div>
                  )}
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Balance */}
                <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('balance')}
                  </p>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {formatCurrency(user.balance?.[currency as keyof typeof user.balance] || 0, currency)}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-4">
                <ul className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={getLocalizedPath(item.href)}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                            active
                              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>
    </MainLayout>
  );
}

