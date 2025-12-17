'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, Mail, ArrowLeft } from 'lucide-react';
import { Input, Button, Checkbox, PhoneInput } from '@/components/ui';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { useAuth } from '@/contexts/AuthContext';
import { register as registerAPI, registerWithGoogle } from '@/lib/api';
import { validateEmail } from '@/lib/utils';
import Logo from '@/components/ui/Logo';

// Extend Window interface for Google Identity Services
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
                    renderButton: (element: HTMLElement, config: {
                        theme?: string;
                        size?: string;
                        width?: string;
                        text?: string;
                        locale?: string;
                    }) => void;
                };
            };
        };
    }
}

export default function RegisterPage() {
    const router = useRouter();
    const { regionCode, getLocalizedPath } = useLocale();
    const { t, language } = useTranslation();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
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

    const handlePhoneNumberChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            phoneNumber: value,
        }));
        // Clear error when user types
        if (errors.phoneNumber) {
            setErrors((prev) => ({ ...prev, phoneNumber: '' }));
        }
        setApiError('');
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = language === 'id' ? 'Nama depan wajib diisi' : 'First name is required';
        }

        // lastName is optional, no validation needed

        if (!formData.email) {
            newErrors.email = language === 'id' ? 'Email wajib diisi' : 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = language === 'id' ? 'Format email tidak valid' : 'Invalid email format';
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = language === 'id' ? 'Nomor HP wajib diisi' : 'Phone number is required';
        }

        if (!formData.password) {
            newErrors.password = language === 'id' ? 'Kata sandi wajib diisi' : 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = language === 'id' ? 'Kata sandi minimal 8 karakter' : 'Password must be at least 8 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = language === 'id' ? 'Konfirmasi kata sandi wajib diisi' : 'Confirm password is required';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = language === 'id' ? 'Kata sandi tidak cocok' : 'Passwords do not match';
        }

        if (!formData.agreeTerms) {
            newErrors.agreeTerms = language === 'id' ? 'Anda harus menyetujui syarat & ketentuan' : 'You must agree to the terms & conditions';
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
            const response = await registerAPI(
                {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                },
                regionCode
            );

            if (response.error) {
                setApiError(response.error.message);
                return;
            }

            if (response.data) {
                // Registration successful - email verification link has been sent
                // Show success message (user should check their email)
                setIsSuccess(true);
            }
        } catch (error) {
            console.error('Register error:', error);
            setApiError(language === 'id' ? 'Terjadi kesalahan' : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleRegister = useCallback(async (credential: string) => {
        setIsGoogleLoading(true);
        setApiError('');

        try {
            const response = await registerWithGoogle(credential, regionCode);

            if (response.error) {
                setApiError(response.error.message);
                return;
            }

            if (response.data) {
                if (response.data.step === 'SUCCESS' && response.data.token && response.data.user) {
                    // Google registration successful, login user
                    login(response.data.token, response.data.user);
                    router.push(getLocalizedPath('/'));
                } else {
                    // Should not happen for Google registration, but handle just in case
                    setApiError(language === 'id' ? 'Terjadi kesalahan' : 'An error occurred');
                }
            }
        } catch (error) {
            console.error('Google register error:', error);
            setApiError(language === 'id' ? 'Terjadi kesalahan' : 'An error occurred');
        } finally {
            setIsGoogleLoading(false);
        }
    }, [regionCode, login, router, getLocalizedPath, language]);

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
                        handleGoogleRegister(response.credential);
                    },
                });

                window.google.accounts.id.renderButton(googleButtonRef.current, {
                    theme: 'outline',
                    size: 'large',
                    width: '100%',
                    text: 'signup_with',
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
    }, [language, regionCode, handleGoogleRegister]);

    if (isSuccess) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {language === 'id' ? 'Cek Email Anda' : 'Check Your Email'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {language === 'id'
                        ? 'Link verifikasi telah dikirim ke email Anda. Silakan klik link tersebut untuk memverifikasi akun Anda.'
                        : 'A verification link has been sent to your email. Please click the link to verify your account.'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                    {language === 'id'
                        ? `Email dikirim ke: ${formData.email}`
                        : `Email sent to: ${formData.email}`}
                </p>
                <Link
                    href={getLocalizedPath('/login')}
                    className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {language === 'id' ? 'Kembali ke Login' : 'Back to Login'}
                </Link>
            </div>
        );
    }

    return (
        <div>
            {/* Logo for desktop */}
            {/* Logo handled by Layout */}
            <div className="h-8 lg:hidden" /> {/* Spacer for mobile header */}

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">
                {t('registerTitle')}
            </h1>

            {apiError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                    <div className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5">⚠️</div>
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">{apiError}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-5">
                    <Input
                        label={t('firstName')}
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder={t('firstNamePlaceholder')}
                        error={errors.firstName}
                        autoComplete="given-name"
                        required
                    />

                    <Input
                        label={t('lastName')}
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder={t('lastNamePlaceholder')}
                        error={errors.lastName}
                        autoComplete="family-name"
                    />
                </div>

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

                    <PhoneInput
                        label={language === 'id' ? 'Nomor HP' : 'Phone Number'}
                        value={formData.phoneNumber}
                        onChange={handlePhoneNumberChange}
                        error={errors.phoneNumber}
                        defaultCountryCode="+62"
                        required
                    />
                </div>

                <div className="space-y-4">
                    <Input
                        label={t('password')}
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={t('passwordPlaceholder')}
                        error={errors.password}
                        autoComplete="new-password"
                        required
                    />

                    <Input
                        label={t('confirmPassword')}
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder={t('confirmPasswordPlaceholder')}
                        error={errors.confirmPassword}
                        autoComplete="new-password"
                        required
                    />
                </div>

                <div>
                    <Checkbox
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        label={
                            <span className="text-gray-600 dark:text-gray-400">
                                {language === 'id' ? 'Saya setuju dengan ' : 'I agree to the '}
                                <Link
                                    href={getLocalizedPath('/terms')}
                                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline transition-colors"
                                    target="_blank"
                                >
                                    {language === 'id' ? 'Syarat & Ketentuan' : 'Terms & Conditions'}
                                </Link>
                                {language === 'id' ? ' dan ' : ' and '}
                                <Link
                                    href={getLocalizedPath('/privacy-policy')}
                                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline transition-colors"
                                    target="_blank"
                                >
                                    {language === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}
                                </Link>
                            </span>
                        }
                    />
                    {errors.agreeTerms && (
                        <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400 ml-7">
                            {errors.agreeTerms}
                        </p>
                    )}
                </div>

                <Button type="submit" fullWidth isLoading={isLoading} className="h-12 text-base font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
                    {t('register')}
                </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                    <span className="px-4 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 font-medium">
                        {language === 'id' ? 'atau daftar dengan' : 'or sign up with'}
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
                {t('hasAccount')}{' '}
                <Link
                    href={getLocalizedPath('/login')}
                    className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                    {t('login')}
                </Link>
            </p>
        </div>
    );
}
