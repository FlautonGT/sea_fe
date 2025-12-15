'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Copy, Check, Shield } from 'lucide-react';
import { Button, Input, LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { enableMFA, verifyMFASetup } from '@/lib/api';

interface MFASetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function MFASetupModal({ isOpen, onClose, onSuccess }: MFASetupModalProps) {
    const { token, updateUser } = useAuth();
    const { language } = useLocale();

    const [step, setStep] = useState<'INIT' | 'VERIFY'>('INIT');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [mfaData, setMfaData] = useState<{
        qrCodeImage: string;
        secret: string;
        backupCodes: string[];
    } | null>(null);

    const [code, setCode] = useState('');
    const [copied, setCopied] = useState(false);

    // Initialize: Get QR Code
    React.useEffect(() => {
        if (isOpen && step === 'INIT' && !mfaData) {
            const initMFA = async () => {
                if (!token) return;
                setLoading(true);
                setError('');
                try {
                    const res = await enableMFA(token.accessToken);
                    if (res.data) {
                        const qrData = res.data.qrCode || '';
                        setMfaData({
                            // Use public QR Server API to generate QR code image from the otpauth URL
                            qrCodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`,
                            secret: res.data.secret,
                            backupCodes: res.data.backupCodes
                        });
                    } else if (res.error) {
                        setError(res.error.message);
                    }
                } catch (err) {
                    console.error(err);
                    setError(language === 'id' ? 'Gagal memuat QR Code' : 'Failed to load QR Code');
                } finally {
                    setLoading(false);
                }
            };

            initMFA();
        }
    }, [isOpen, step, token, mfaData, language]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setLoading(true);
        setError('');

        try {
            const res = await verifyMFASetup(code, token.accessToken);
            if (res.data && res.data.mfaStatus === 'ACTIVE') {
                // Success! Update local user state if needed (or parent will reload)
                onSuccess();
                onClose();
            } else if (res.error) {
                setError(res.error.message);
            }
        } catch (err) {
            console.error(err);
            setError(language === 'id' ? 'Kode salah' : 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    const copySecret = () => {
        if (mfaData?.secret) {
            navigator.clipboard.writeText(mfaData.secret);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {language === 'id' ? 'Aktifkan 2FA' : 'Enable 2FA'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {language === 'id'
                            ? 'Amankan akun Anda dengan autentikasi dua faktor.'
                            : 'Secure your account with two-factor authentication.'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                {loading && !mfaData ? (
                    <div className="flex justify-center py-8">
                        <LoadingSpinner />
                    </div>
                ) : mfaData ? (
                    <div className="space-y-6">
                        {/* QR Code Section */}
                        <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                            {/* Assuming QR Code image is a data URL or valid URL */}
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={mfaData.qrCodeImage}
                                    alt="MFA QR Code"
                                    className="w-48 h-48 object-contain"
                                />
                            </div>
                        </div>

                        {/* Secret Key Manual Entry */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                                {language === 'id' ? 'Atau masukkan kode manual:' : 'Or enter code manually:'}
                            </label>
                            <div className="flex gap-2">
                                <code className="flex-1 p-2 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm font-mono text-center text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                    {mfaData.secret}
                                </code>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={copySecret}
                                    className="shrink-0"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>

                        {/* Verification Form */}
                        <form onSubmit={handleVerify}>
                            <Input
                                label={language === 'id' ? 'Kode Verifikasi (6 Digit)' : 'Verification Code (6 Digits)'}
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                                maxLength={6}
                                placeholder="000000"
                                className="text-center text-lg tracking-widest font-mono"
                            />

                            <div className="mt-6">
                                <Button
                                    type="submit"
                                    fullWidth
                                    isLoading={loading}
                                    disabled={code.length < 6}
                                >
                                    {language === 'id' ? 'Verifikasi & Aktifkan' : 'Verify & Enable'}
                                </Button>
                            </div>
                        </form>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
