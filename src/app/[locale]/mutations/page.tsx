'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Download,
    Calendar as CalendarIcon,
    ArrowUpRight,
    ArrowDownLeft
} from 'lucide-react';
import { Button, Input, LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { Mutation, MutationOverview } from '@/types';
import { getMutations } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { translations } from '@/lib/translations';

export default function MutationsPage() {
    const { token } = useAuth();
    const { regionCode, currency, getLocalizedPath, language } = useLocale();
    const { t } = useTranslation();

    // Data State
    const [mutations, setMutations] = useState<Mutation[]>([]);
    const [overview, setOverview] = useState<MutationOverview | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination State
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    // Initialize dates to today
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    // Fetch Data
    useEffect(() => {
        async function fetchMutations() {
            if (!token) return;
            setIsLoading(true);

            try {
                const response = await getMutations(token.accessToken, {
                    region: regionCode,
                    page,
                    limit,
                    search: searchQuery || undefined,
                    type: typeFilter !== 'ALL' ? typeFilter : undefined,
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                });

                if (response.data) {
                    setOverview(response.data.overview);
                    setMutations(response.data.mutations);
                    setTotalRows(response.data.pagination.totalRows);
                    setTotalPages(response.data.pagination.totalPages);
                }
            } catch (error) {
                console.error('Failed to fetch mutations:', error);
            } finally {
                setIsLoading(false);
            }
        }

        const timeoutId = setTimeout(() => {
            fetchMutations();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [token, regionCode, page, limit, searchQuery, typeFilter, startDate, endDate]);

    // Styling Helpers
    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'CREDIT': return 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            case 'DEBIT': return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
        }
    };

    // Date Formatter
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        // Handle YYYY-MM-DD manually to avoid timezone issues for simple dates
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateString.split('-');
            return `${day}-${month}-${year}`;
        }
        // Full ISO string with time
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (e) {
            return dateString;
        }
    };

    // Helper for date inputs (YYYY-MM-DD)
    const formatDateInput = (dateString: string) => {
        if (!dateString) return '';
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateString.split('-');
            return `${day}-${month}-${year}`;
        }
        return dateString;
    };

    return (
        <DashboardLayout>
            <div className="font-sans">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {language === 'id' ? 'Mutasi Saldo' : 'Balance Mutations'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                {language === 'id' ? 'Riwayat pergerakan saldo akun' : 'Account balance movement history'}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="gap-2 h-10 px-4 rounded-lg border-blue-600 text-blue-600 hover:bg-blue-50 font-medium text-sm">
                                <Download className="w-4 h-4" />
                                Unduh CSV
                            </Button>
                            <Button variant="outline" className="gap-2 h-10 px-4 rounded-lg border-blue-600 text-blue-600 hover:bg-blue-50 font-medium text-sm">
                                <Download className="w-4 h-4" />
                                Unduh XLSX
                            </Button>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="mb-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">Cari Invoice</label>
                                <Input
                                    placeholder="No. Invoice / Deskripsi"
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                                    className="h-[48px] rounded-xl"
                                    leftIcon={<Search className="w-4 h-4 text-gray-400" />}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">Tipe Mutasi</label>
                                <div className="relative">
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                                        className="w-full h-[48px] pl-4 pr-10 appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer shadow-sm"
                                    >
                                        <option value="ALL">Semua</option>
                                        <option value="CREDIT">Credit (Masuk)</option>
                                        <option value="DEBIT">Debit (Keluar)</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                        <ChevronLeft className="w-4 h-4 -rotate-90" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">Periode</label>
                                <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl h-[48px] px-4 w-full shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
                                    {/* Start Date */}
                                    <div className="relative w-full h-full flex items-center">
                                        <input
                                            type="text"
                                            readOnly
                                            value={formatDateInput(startDate)}
                                            className="w-full bg-transparent text-sm font-medium text-gray-600 focus:outline-none placeholder-gray-400 cursor-pointer text-center"
                                            placeholder="dd-mm-yyyy"
                                        />
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none"
                                        />
                                    </div>
                                    <span className="text-gray-400 mx-2">-</span>
                                    {/* End Date */}
                                    <div className="relative w-full h-full flex items-center">
                                        <input
                                            type="text"
                                            readOnly
                                            value={formatDateInput(endDate)}
                                            className="w-full bg-transparent text-sm font-medium text-gray-600 focus:outline-none placeholder-gray-400 cursor-pointer text-center"
                                            placeholder="dd-mm-yyyy"
                                        />
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Overview Stats */}
                        {overview && (
                            <div className="space-y-6 mb-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Net Balance */}
                                    <div className="bg-[#eff6ff] dark:bg-gray-800 px-5 py-4 rounded-2xl border border-blue-100 dark:border-gray-700 flex flex-col justify-center min-h-[110px]">
                                        <p className="text-gray-500 dark:text-gray-400 font-medium text-xs mb-1 uppercase tracking-wide">Net Balance</p>
                                        <h3 className={cn(
                                            "text-2xl font-extrabold tracking-tight",
                                            overview.netBalance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600"
                                        )}>
                                            {formatCurrency(overview.netBalance, currency)}
                                        </h3>
                                    </div>

                                    {/* Total Credit */}
                                    <div className="bg-green-50 dark:bg-gray-800 px-5 py-4 rounded-2xl border border-green-100 dark:border-gray-700 flex flex-col justify-center min-h-[110px]">
                                        <p className="text-gray-500 dark:text-gray-400 font-medium text-xs mb-1 uppercase tracking-wide">Total Credit</p>
                                        <h3 className="text-2xl font-extrabold text-green-600 dark:text-green-400 tracking-tight">
                                            +{formatCurrency(overview.totalCredit, currency)}
                                        </h3>
                                    </div>

                                    {/* Total Debit */}
                                    <div className="bg-red-50 dark:bg-gray-800 px-5 py-4 rounded-2xl border border-red-100 dark:border-gray-700 flex flex-col justify-center min-h-[110px]">
                                        <p className="text-gray-500 dark:text-gray-400 font-medium text-xs mb-1 uppercase tracking-wide">Total Debit</p>
                                        <h3 className="text-2xl font-extrabold text-red-600 dark:text-red-400 tracking-tight">
                                            -{formatCurrency(overview.totalDebit, currency)}
                                        </h3>
                                    </div>

                                    {/* Transaction Count */}
                                    <div className="bg-white dark:bg-gray-800 px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col justify-center min-h-[110px]">
                                        <p className="text-gray-500 dark:text-gray-400 font-medium text-xs mb-1 uppercase tracking-wide">Total Mutasi</p>
                                        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                            {overview.transactionCount}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mutations Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 dark:bg-gray-700/80 border-b border-gray-200 dark:border-gray-700">
                                            <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">No. Invoice</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Deskripsi</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Tipe</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-right">Jumlah</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">Saldo Awal</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">Saldo Akhir</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">Tanggal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-20">
                                                    <div className="flex justify-center items-center w-full">
                                                        <LoadingSpinner size="lg" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : mutations.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-20 text-center text-gray-500 dark:text-gray-400">
                                                    <div className="flex flex-col items-center">
                                                        <Search className="w-12 h-12 text-gray-300 mb-4" />
                                                        <p className="text-lg font-medium text-gray-900 dark:text-white">{t('noTransactions')}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            mutations.map((item) => (
                                                <tr key={item.invoiceNumber + item.createdAt} className="group hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-all">
                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 align-middle font-medium">
                                                        {item.invoiceNumber}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white align-middle max-w-[200px] truncate" title={item.description}>
                                                        {item.description}
                                                    </td>
                                                    <td className="px-6 py-4 align-middle">
                                                        <span className={cn(
                                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                                            getTypeStyles(item.type)
                                                        )}>
                                                            {item.type === 'CREDIT' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                                            {translations[language]?.[`type_${item.type.toLowerCase()}`] || item.type}
                                                        </span>
                                                    </td>
                                                    <td className={cn(
                                                        "px-6 py-4 text-sm font-bold align-middle text-right",
                                                        item.type === 'CREDIT' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                    )}>
                                                        {item.type === 'CREDIT' ? '+' : '-'}{formatCurrency(item.amount, item.currency)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 align-middle text-right font-medium">
                                                        {formatCurrency(item.balanceBefore, item.currency)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white align-middle text-right font-bold">
                                                        {formatCurrency(item.balanceAfter, item.currency)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 align-middle text-right whitespace-nowrap">
                                                        {formatDate(item.createdAt)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            {!isLoading && mutations.length > 0 && (
                                <div className="px-6 py-6 border-t border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                        Menampilkan {((page - 1) * limit) + 1} sampai {Math.min(page * limit, totalRows)} dari {totalRows} data
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            className="text-gray-500 hover:text-gray-700 h-9 px-3 hover:bg-gray-100 text-sm font-medium"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                        >
                                            <ChevronLeft className="w-4 h-4 mr-1" />
                                            Sebelumnya
                                        </Button>

                                        <div className="flex items-center gap-1 mx-2">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                const p = i + 1;
                                                return (
                                                    <button
                                                        key={p}
                                                        onClick={() => setPage(p)}
                                                        className={cn(
                                                            "w-9 h-9 rounded-lg text-sm font-medium transition-all flex items-center justify-center",
                                                            page === p
                                                                ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                                                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                                                        )}
                                                    >
                                                        {p}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <Button
                                            variant="ghost"
                                            className="text-primary-600 hover:text-primary-700 h-9 px-3 hover:bg-primary-50 text-sm font-medium"
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                        >
                                            Selanjutnya
                                            <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
