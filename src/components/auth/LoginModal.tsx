'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input, Button, Checkbox, OTPInput } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { login as loginAPI, loginWithGoogle, verifyMFA } from '@/lib/api';
import { validateEmail, cn } from '@/lib/utils';
import { X, AlertCircle } from 'lucide-react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const router = useRouter();
    const { login } = useAuth();
    const { regionCode, getLocalizedPath } = useLocale();
    const { t, language } = useTranslation();

    const [step, setStep] = useState<'LOGIN' | 'MFA'>('LOGIN');
    const [mfaToken, setMfaToken] = useState('');

    const [mfaCode, setMfaCode] = useState('');
    const [mfaError, setMfaError] = useState(false);
    const [mfaSuccess, setMfaSuccess] = useState(false);

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

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({ email: '', password: '', rememberMe: false });
            setErrors({});
            setApiError('');
            setStep('LOGIN');
            setMfaToken('');

            setMfaCode('');
            setMfaError(false);
            setMfaSuccess(false);
        }
    }, [isOpen]);

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
                    onClose();
                } else if (response.data.step === 'MFA_VERIFICATION') {
                    // Switch to MFA step
                    setMfaToken(response.data.mfaToken || '');
                    setStep('MFA');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setApiError(language === 'id' ? 'Terjadi kesalahan' : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMFAVerify = useCallback(async (code: string) => {
        setIsLoading(true);
        setApiError('');
        setMfaError(false);
        setMfaSuccess(false);

        try {
            const response = await verifyMFA(mfaToken, code);

            if (response.error) {
                setApiError(response.error.message);
                setMfaError(true);
                return;
            }

            if (response.data) {
                const { token, user } = response.data;
                if (response.data.step === 'SUCCESS' && token && user) {
                    setMfaSuccess(true);
                    // Add small delay to show success state
                    setTimeout(() => {
                        login(token, user);
                        onClose();
                    }, 500);
                } else {
                    setMfaError(true);
                    // setApiError(language === 'id' ? 'Verifikasi gagal' : 'Verification failed');
                }
            }
        } catch (error) {
            console.error('MFA error:', error);
            setApiError(language === 'id' ? 'Terjadi kesalahan' : 'An error occurred');
            setMfaError(true);
        } finally {
            setIsLoading(false);
        }
    }, [mfaToken, login, onClose, language]);

    useEffect(() => {
        if (mfaCode.length === 6) {
            handleMFAVerify(mfaCode);
        }
    }, [mfaCode, handleMFAVerify]);

    const handleGoogleLogin = useCallback(async (credential: string) => {
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
                    login(response.data.token, response.data.user);
                    onClose();
                } else if (response.data.step === 'MFA_VERIFICATION') {
                    setMfaToken(response.data.mfaToken || '');
                    setStep('MFA');
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
    }, [regionCode, login, language, onClose]);

    // Load Google Identity Services - ensure we only load if visible
    useEffect(() => {
        if (!isOpen || step !== 'LOGIN') return;

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
            const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (existingScript) existingScript.remove();
        };
    }, [isOpen, step, language, regionCode, handleGoogleLogin]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 lg:p-1.5 text-white hover:text-white transition-colors bg-red-500 rounded-full hover:bg-red-600 shadow-sm"
                >
                    <X className="w-5 h-5 lg:w-4 lg:h-4" />
                </button>

                <div className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                        {step === 'LOGIN' ? t('loginTitle') : (language === 'id' ? 'Verifikasi 2 Langkah' : 'Two-Factor Authentication')}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-8">
                        {step === 'LOGIN'
                            ? (language === 'id' ? 'Masuk untuk melanjutkan pembayaran' : 'Login to continue payment')
                            : (language === 'id' ? 'Masukkan kode authenticator Anda' : 'Enter your authenticator code')
                        }
                    </p>

                    {apiError && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{apiError}</p>
                        </div>
                    )}

                    {step === 'LOGIN' ? (
                        <>
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
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-center py-4">
                                <OTPInput
                                    value={mfaCode}
                                    onChange={(val) => {
                                        setMfaCode(val);
                                        setMfaError(false);
                                        setMfaSuccess(false);
                                        setApiError('');
                                    }}
                                    length={6}
                                    error={mfaError}
                                    success={mfaSuccess}
                                    disabled={isLoading || mfaSuccess}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setStep('LOGIN');
                                    setApiError('');
                                    setMfaCode('');
                                    setMfaError(false);
                                    setMfaSuccess(false);
                                }}
                                className="w-full text-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mt-4"
                            >
                                {language === 'id' ? 'Kembali ke Login' : 'Back to Login'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
