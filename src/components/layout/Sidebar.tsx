'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Home, Receipt, User, Moon, Sun, LogOut, Settings, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { generateInitials, cn } from '@/lib/utils';
import Logo from '@/components/ui/Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCurrencyModal: () => void;
}

export default function Sidebar({ isOpen, onClose, onOpenCurrencyModal }: SidebarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { regionCode, currency, flagUrl, getLocalizedPath } = useLocale();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const menuItems = [
    { icon: Home, label: t('home'), href: '/' },
    { icon: Receipt, label: t('checkTransaction'), href: '/check-transaction' },
  ];

  const accountItems = isAuthenticated
    ? [
        { icon: User, label: t('myAccount'), href: '/account' },
        { icon: Receipt, label: t('transactions'), href: '/account/transactions' },
      ]
    : [];

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-50 transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <Link href={getLocalizedPath('/')} onClick={onClose}>
            <Logo className="h-8 w-auto" />
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Section */}
        {isAuthenticated && user ? (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {user.profilePicture ? (
                <Image
                  src={user.profilePicture}
                  alt={user.firstName}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                  {generateInitials(user.firstName, user.lastName)}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-3">
              <Link
                href={getLocalizedPath('/login')}
                onClick={onClose}
                className="flex-1 py-2.5 text-center text-sm font-medium text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                {t('login')}
              </Link>
              <Link
                href={getLocalizedPath('/register')}
                onClick={onClose}
                className="flex-1 py-2.5 text-center text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                {t('register')}
              </Link>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={getLocalizedPath(item.href)}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {accountItems.length > 0 && (
            <>
              <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
              <div className="space-y-1">
                {accountItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={getLocalizedPath(item.href)}
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          <div className="my-4 border-t border-gray-200 dark:border-gray-700" />

          {/* Settings */}
          <div className="space-y-1">
            {/* Currency/Language */}
            <button
              onClick={() => {
                onClose();
                onOpenCurrencyModal();
              }}
              className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="flex items-center gap-3">
                <Settings className="w-5 h-5" />
                <span className="font-medium">{regionCode}/{currency}</span>
              </span>
              <div className="flex items-center gap-2">
                <Image
                  src={flagUrl}
                  alt={regionCode}
                  width={20}
                  height={15}
                  className="rounded-sm"
                />
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="flex items-center gap-3">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="font-medium">{t('enableDarkMode')}</span>
              </span>
              <div className={cn(
                "w-10 h-5 rounded-full transition-colors relative",
                theme === 'dark' ? "bg-primary-500" : "bg-gray-300"
              )}>
                <div className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                  theme === 'dark' ? "translate-x-5" : "translate-x-0.5"
                )} />
              </div>
            </button>
          </div>

          {/* Logout */}
          {isAuthenticated && (
            <>
              <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">{t('logout')}</span>
              </button>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
