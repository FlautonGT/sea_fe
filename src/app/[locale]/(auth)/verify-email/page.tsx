'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { verifyEmail, resendVerification } from '@/lib/api';
import Logo from '@/components/ui/Logo';

// Helper component to wrap useSearchParams in Suspense
// Required by Next.js for client-side search params usage
function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { regionCode, getLocalizedPath } = useLocale();
    const { t, language } = useTranslation();

    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');

    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
    const [message, setMessage] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage(language === 'id' ? 'Token verifikasi tidak ditemukan' : 'Verification token not found');
            return;
        }

        // Verify email
        verifyEmail(token).then((response) => {
            if (response.error) {
                if (response.error.code === 'INVALID_TOKEN' || response.error.code === 'TOKEN_EXPIRED') {
                    setStatus('expired');
                    setMessage(
                        language === 'id'
                            ? 'Token verifikasi tidak valid atau sudah kadaluarsa'
                            : 'Verification token is invalid or expired'
                    );
                } else if (response.error.code === 'ALREADY_VERIFIED') {
                    setStatus('success');
                    setMessage(
                        language === 'id'
                            ? 'Email sudah diverifikasi. Silakan login.'
                            : 'Email already verified. Please login.'
                    );
                } else {
                    setStatus('error');
                    setMessage(response.error.message || (language === 'id' ? 'Terjadi kesalahan' : 'An error occurred'));
                }
            } else if (response.data) {
                setStatus('success');
                setMessage(
                    response.data.message ||
                    (language === 'id'
                        ? 'Email berhasil diverifikasi. Silakan login untuk melanjutkan.'
                        : 'Email verified successfully. Please login to continue.')
                );
            }
        }).catch((error) => {
            console.error('Verify email error:', error);
            setStatus('error');
            setMessage(language === 'id' ? 'Terjadi kesalahan' : 'An error occurred');
        });
    }, [token, language]);

    const handleResendVerification = async () => {
        if (!emailParam) {
            setMessage(language === 'id' ? 'Email tidak ditemukan. Silakan hubungi support.' : 'Email not found. Please contact support.');
            return;
        }

        setIsResending(true);
        setResendSuccess(false);

        try {
            const response = await resendVerification(emailParam);
            if (response.error) {
                setMessage(response.error.message || (language === 'id' ? 'Gagal mengirim ulang email' : 'Failed to resend email'));
            } else {
                setResendSuccess(true);
                setMessage(
                    response.data?.message ||
                    (language === 'id'
                        ? 'Link verifikasi telah dikirim ke email Anda.'
                        : 'Verification link has been sent to your email.')
                );
            }
        } catch (error) {
            console.error('Resend verification error:', error);
            setMessage(language === 'id' ? 'Terjadi kesalahan' : 'An error occurred');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div>
            {/* Logo for desktop */}
            <div className="hidden lg:flex justify-center mb-8">
                <Link href={getLocalizedPath('/')}>
                    <Logo className="h-10 w-auto" />
                </Link>
            </div>

            {status === 'loading' && (
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {language === 'id' ? 'Memverifikasi Email...' : 'Verifying Email...'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {language === 'id' ? 'Mohon tunggu sebentar' : 'Please wait a moment'}
                    </p>
                </div>
            )}

            {status === 'success' && (
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {language === 'id' ? 'Email Berhasil Diverifikasi!' : 'Email Verified Successfully!'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        {message}
                    </p>
                    <Link href={getLocalizedPath('/login')}>
                        <Button fullWidth>
                            {language === 'id' ? 'Masuk ke Akun' : 'Go to Login'}
                        </Button>
                    </Link>
                </div>
            )}

            {status === 'expired' && (
                <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {language === 'id' ? 'Token Telah Kadaluarsa' : 'Token Expired'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {message}
                    </p>

                    {emailParam && (
                        <>
                            {resendSuccess && (
                                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                                    <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
                                </div>
                            )}

                            <Button
                                fullWidth
                                onClick={handleResendVerification}
                                isLoading={isResending}
                                disabled={isResending}
                            >
                                {isResending
                                    ? (language === 'id' ? 'Mengirim...' : 'Sending...')
                                    : language === 'id'
                                        ? 'Kirim Ulang Link Verifikasi'
                                        : 'Resend Verification Link'}
                            </Button>

                            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                                {language === 'id'
                                    ? `Link verifikasi akan dikirim ke ${emailParam}`
                                    : `Verification link will be sent to ${emailParam}`}
                            </p>
                        </>
                    )}

                    {!emailParam && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            {language === 'id'
                                ? 'Silakan request link verifikasi baru dari halaman login atau hubungi support.'
                                : 'Please request a new verification link from the login page or contact support.'}
                        </p>
                    )}

                    <Link
                        href={getLocalizedPath('/login')}
                        className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium mt-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {language === 'id' ? 'Kembali ke Login' : 'Back to Login'}
                    </Link>
                </div>
            )}

            {status === 'error' && (
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {language === 'id' ? 'Verifikasi Gagal' : 'Verification Failed'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        {message}
                    </p>
                    <Link
                        href={getLocalizedPath('/login')}
                        className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {language === 'id' ? 'Kembali ke Login' : 'Back to Login'}
                    </Link>
                </div>
            )}
        </div>
    );
}

// Main Page Component
export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
