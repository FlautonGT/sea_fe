'use client';

import React, { useState } from 'react';
import { X, ShieldOff } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { disableMFA } from '@/lib/api';

interface MFADisableModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function MFADisableModal({ isOpen, onClose, onSuccess }: MFADisableModalProps) {
    const { token } = useAuth();
    const { language } = useLocale();

    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDisable = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setLoading(true);
        setError('');

        try {
            const res = await disableMFA(code, password, token.accessToken);
            if (res.data && res.data.mfaStatus === 'INACTIVE') {
                onSuccess();
                onClose();
            } else if (res.error) {
                setError(res.error.message);
            }
        } catch (err) {
            console.error(err);
            setError(language === 'id' ? 'Gagal menonaktifkan 2FA' : 'Failed to disable 2FA');
        } finally {
            setLoading(false);
        }
    };

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
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldOff className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {language === 'id' ? 'Nonaktifkan 2FA' : 'Disable 2FA'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {language === 'id'
                            ? 'Masukkan kode authenticator dan kata sandi Anda.'
                            : 'Enter your authenticator code and password.'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleDisable} className="space-y-4">
                    <Input
                        label={language === 'id' ? 'Kode Authenticator' : 'Authenticator Code'}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                        maxLength={6}
                        placeholder="000000"
                        className="text-center text-lg tracking-widest font-mono"
                        required
                    />

                    <Input
                        label={language === 'id' ? 'Kata Sandi' : 'Password'}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="********"
                        required
                    />

                    <div className="mt-6">
                        <Button
                            type="submit"
                            fullWidth
                            variant="danger"
                            isLoading={loading}
                            disabled={code.length < 6 || !password}
                        >
                            {language === 'id' ? 'Nonaktifkan' : 'Disable'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
