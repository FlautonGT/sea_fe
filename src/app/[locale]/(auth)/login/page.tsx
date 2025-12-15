'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input, Button, Checkbox } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { login as loginAPI, loginWithGoogle } from '@/lib/api';
import { validateEmail } from '@/lib/utils';
import Logo from '@/components/ui/Logo';

// Extend Window interface for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, config: { theme?: string; size?: string; width?: string; text?: string; locale?: string; }) => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { regionCode, getLocalizedPath } = useLocale();
  const { t, language } = useTranslation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = language === 'id' ? 'Email wajib diisi' : 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = language === 'id' ? 'Format email tidak valid' : 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = language === 'id' ? 'Kata sandi wajib diisi' : 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    setApiError('');

    try {
      const response = await loginAPI(formData.email, formData.password, regionCode);

      if (response.error) {
        setApiError(response.error.message);
        return;
      }

      if (response.data) {
        if (response.data.step === 'SUCCESS' && response.data.token && response.data.user) {
          login(response.data.token, response.data.user);
          router.push(getLocalizedPath('/'));
        } else if (response.data.step === 'MFA_VERIFICATION') {
          // Redirect to MFA verification page
          router.push(getLocalizedPath(`/verify-mfa?token=${response.data.mfaToken}`));
        }
        // EMAIL_NOT_VERIFIED error is handled by error message (link already sent via email)
      }
    } catch (error) {
      console.error('Login error:', error);
      setApiError(language === 'id' ? 'Terjadi kesalahan' : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credential: string) => {
    setIsGoogleLoading(true);
    setApiError('');

    try {
      const response = await loginWithGoogle(credential, regionCode);

      if (response.error) {
        setApiError(response.error.message);
        return;
      }

      if (response.data) {
        if (response.data.step === 'SUCCESS' && response.data.token && response.data.user) {
          // Google login successful
          login(response.data.token, response.data.user);
          router.push(getLocalizedPath('/'));
        } else if (response.data.step === 'MFA_VERIFICATION') {
          // Redirect to MFA verification page
          router.push(getLocalizedPath(`/verify-mfa?token=${response.data.mfaToken}`));
        } else {
          setApiError(language === 'id' ? 'Terjadi kesalahan' : 'An error occurred');
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      setApiError(language === 'id' ? 'Terjadi kesalahan' : 'An error occurred');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Load Google Identity Services
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          callback: (response: { credential: string }) => {
            handleGoogleLogin(response.credential);
          },
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          locale: language === 'id' ? 'id' : 'en',
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [language, regionCode]);

  return (
    <div>
      {/* Logo for desktop */}
      {/* Logo handled by Layout */}
      <div className="h-8 lg:hidden" /> {/* Spacer for mobile header */}

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">
        {t('loginTitle')}
      </h1>

      {apiError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
          <div className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5">⚠️</div>
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            label={t('email')}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t('emailPlaceholder')}
            error={errors.email}
            autoComplete="email"
            required
          />

          <div className="space-y-1">
            <Input
              label={t('password')}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('passwordPlaceholder')}
              error={errors.password}
              autoComplete="current-password"
              required
            />
            <div className="flex justify-end pt-1">
              <Link
                href={getLocalizedPath('/forgot-password')}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                {t('forgotPassword')}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <Checkbox
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            label={t('rememberMe')}
          />
        </div>

        <Button type="submit" fullWidth isLoading={isLoading} className="h-12 text-base font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
          {t('login')}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wider">
          <span className="px-4 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 font-medium">
            {language === 'id' ? 'atau lanjutkan dengan' : 'or continue with'}
          </span>
        </div>
      </div>

      {/* Google OAuth Button */}
      <div ref={googleButtonRef} className="w-full"></div>
      {isGoogleLoading && (
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          {language === 'id' ? 'Memproses...' : 'Processing...'}
        </div>
      )}

      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        {t('noAccount')}{' '}
        <Link
          href={getLocalizedPath('/register')}
          className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
        >
          {t('register')}
        </Link>
      </p>
    </div>
  );
}

