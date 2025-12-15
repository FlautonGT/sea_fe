'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, ArrowRight } from 'lucide-react';
import { Input, Button, LoadingPage } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { verifyMFA } from '@/lib/api';

function VerifyMFAContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mfaToken = searchParams.get('token');

    const { login } = useAuth();
    const { getLocalizedPath, language } = useLocale();
    const { t } = useTranslation();

    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mfaToken) {
            setError(language === 'id' ? 'Token tidak valid' : 'Invalid token');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await verifyMFA(mfaToken, code);

            if (response.error) {
                setError(response.error.message);
                return;
            }

            if (response.data) {
                if (response.data.step === 'SUCCESS' && response.data.token && response.data.user) {
                    login(response.data.token, response.data.user);
                    router.push(getLocalizedPath('/'));
                } else {
                    setError(language === 'id' ? 'Verifikasi gagal' : 'Verification failed');
                }
            }
        } catch (err) {
            console.error('MFA verify error:', err);
            setError(language === 'id' ? 'Terjadi kesalahan sistem' : 'System error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (!mfaToken) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {language === 'id' ? 'Akses Ditolak' : 'Access Denied'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {language === 'id' ? 'Token verifikasi hilang atau tidak valid.' : 'Verification token is missing or invalid.'}
                </p>
                <Link href={getLocalizedPath('/login')}>
                    <Button variant="outline">{t('backToLogin')}</Button>
                </Link>
            </div>
        )
    }

    return (
        <div>
            <div className="h-8 lg:hidden" /> {/* Spacer */}

            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {language === 'id' ? 'Verifikasi 2 Langkah' : 'Two-Factor Authentication'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {language === 'id'
                        ? 'Masukkan 6 digit kode dari aplikasi authenticator Anda.'
                        : 'Enter the 6-digit code from your authenticator app.'}
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                    <div className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5">⚠️</div>
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label={language === 'id' ? 'Kode Authenticator' : 'Authenticator Code'}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="text-center text-2xl tracking-widest font-mono"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    required
                />

                <Button
                    type="submit"
                    fullWidth
                    isLoading={isLoading}
                    disabled={code.length < 6}
                    className="h-12 text-base font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                >
                    {language === 'id' ? 'Verifikasi' : 'Verify'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                <Link
                    href={getLocalizedPath('/login')}
                    className="font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                >
                    {language === 'id' ? 'Kembali ke Login' : 'Back to Login'}
                </Link>
            </p>
        </div>
    );
}

export default function VerifyMFAPage() {
    return (
        <Suspense fallback={<LoadingPage />}>
            <VerifyMFAContent />
        </Suspense>
    );
}
