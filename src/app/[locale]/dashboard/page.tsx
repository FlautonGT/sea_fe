'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    History,
    CreditCard,
    TrendingUp,
    ShoppingCart,
    CheckCircle,
    Clock,
    XCircle,
    LayoutDashboard
} from 'lucide-react';
import { Button, LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { formatCurrency, cn } from '@/lib/utils';
import { getTransactions } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { TransactionOverview } from '@/types';

export default function DashboardPage() {
    const { user, token, refreshUser } = useAuth();
    const { regionCode, currency, getLocalizedPath, language } = useLocale();
    const { t } = useTranslation();

    const [overview, setOverview] = useState<TransactionOverview | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    useEffect(() => {
        async function fetchOverview() {
            if (!token) return;
            try {
                // Fetch transactions with limit 1 just to get the overview
                const response = await getTransactions(token.accessToken, {
                    page: 1,
                    limit: 1,
                    region: regionCode
                });

                if (response.data && response.data.overview) {
                    setOverview(response.data.overview);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard overview:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchOverview();
    }, [token, regionCode]);

    if (!user) return null;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Dashboard
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {language === 'id' ? `Selamat datang kembali, ${user.firstName}!` : `Welcome back, ${user.firstName}!`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                        <Clock className="w-4 h-4" />
                        {new Date().toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {/* Balance Section (Moved from Profile) */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-primary-500" />
                        Balance
                    </h2>

                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                {language === 'id' ? 'Total Saldo' : 'Total Balance'}
                            </p>
                            <div className="flex items-center gap-3">

                                <span className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                    {formatCurrency(user.balance?.[currency as keyof typeof user.balance] || 0, currency).replace(currency, '').trim()}
                                </span>
                                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 uppercase tracking-wide">
                                    SeaPay
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Link href={getLocalizedPath('/deposit')} className="flex-1 md:flex-none">
                                <Button variant="outline" className="gap-2 w-full md:w-auto">
                                    <History className="w-4 h-4" />
                                    {language === 'id' ? 'Riwayat' : 'History'}
                                </Button>
                            </Link>
                            <Link href={getLocalizedPath('/deposit/recharge')} className="flex-1 md:flex-none">
                                <Button className="gap-2 w-full md:w-auto shadow-lg shadow-primary-500/20">
                                    <CreditCard className="w-4 h-4" />
                                    Top Up
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Transaction Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Spending Card */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group hover:border-primary-500/50 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ShoppingCart className="w-24 h-24 rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-1 uppercase tracking-wider">
                                {language === 'id' ? 'Total Pembelian' : 'Total Purchase'}
                            </p>
                            {isLoading ? (
                                <div className="h-10 w-32 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                            ) : (
                                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                    {formatCurrency(overview?.totalPurchase || 0, currency)}
                                </h3>
                            )}
                            <div className="mt-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 py-1 px-2 rounded-lg w-fit">
                                <TrendingUp className="w-4 h-4" />
                                <span>Lifetime Spending</span>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Count Card */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-blue-500">
                            <History className="w-24 h-24 rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-1 uppercase tracking-wider">
                                {language === 'id' ? 'Total Transaksi' : 'Total Transactions'}
                            </p>
                            {isLoading ? (
                                <div className="h-10 w-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                            ) : (
                                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                    {overview?.totalTransaction || 0}
                                </h3>
                            )}
                            <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 py-1 px-2 rounded-lg w-fit">
                                <LayoutDashboard className="w-4 h-4" />
                                <span>All Time</span>
                            </div>
                        </div>
                    </div>

                    {/* Success Rate / Count Card */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group hover:border-green-500/50 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-green-500">
                            <CheckCircle className="w-24 h-24 rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-1 uppercase tracking-wider">
                                {language === 'id' ? 'Transaksi Sukses' : 'Success Transactions'}
                            </p>
                            {isLoading ? (
                                <div className="h-10 w-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                            ) : (
                                <h3 className="text-3xl font-extrabold text-green-600 dark:text-green-400 tracking-tight">
                                    {overview?.success || 0}
                                </h3>
                            )}
                            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <span>{overview?.pending || 0} Pending</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                <span>{overview?.failed || 0} Failed</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions or Recent Activity could go here later */}
                {/* For now, just keeping it clean as requested */}
            </div>
        </DashboardLayout>
    );
}
