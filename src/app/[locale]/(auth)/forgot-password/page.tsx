'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { forgotPassword as forgotPasswordAPI } from '@/lib/api';
import { validateEmail } from '@/lib/utils';
import Logo from '@/components/ui/Logo';

export default function ForgotPasswordPage() {
  const { regionCode, getLocalizedPath } = useLocale();
  const { t, language } = useTranslation();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError(language === 'id' ? 'Email wajib diisi' : 'Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError(language === 'id' ? 'Format email tidak valid' : 'Invalid email format');
      return;
    }

    setIsLoading(true);

    try {
      const response = await forgotPasswordAPI(email, regionCode);

      if (response.error) {
        setError(response.error.message);
        return;
      }

      setIsSuccess(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(language === 'id' ? 'Terjadi kesalahan' : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t('emailSent')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {t('emailSentDesc')}
        </p>
        <Link
          href={getLocalizedPath('/login')}
          className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Logo for desktop */}
      <div className="hidden lg:flex justify-center mb-8">
        <Link href={getLocalizedPath('/')}>
          <Logo className="h-10 w-auto" />
        </Link>
      </div>

      <Link
        href={getLocalizedPath('/login')}
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('backToLogin')}
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {t('forgotPasswordTitle')}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {t('forgotPasswordDesc')}
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label={t('email')}
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          placeholder={t('emailPlaceholder')}
          error={error ? '' : undefined}
          autoComplete="email"
        />

        <Button type="submit" fullWidth isLoading={isLoading}>
          {t('sendResetLink')}
        </Button>
      </form>
    </div>
  );
}

