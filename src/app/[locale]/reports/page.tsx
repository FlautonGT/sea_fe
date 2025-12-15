'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Download, TrendingUp } from 'lucide-react';
import { Button, LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { getReports } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Report, ReportOverview } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ReportsPage() {
    const { token } = useAuth();
    const { regionCode, currency, language } = useLocale();
    const { t } = useTranslation();

    const [reports, setReports] = useState<Report[]>([]);
    const [overview, setOverview] = useState<ReportOverview | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Date State with Defaults (Today)
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    // Pagination State
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalRows, setTotalRows] = useState(0);

    useEffect(() => {
        async function fetchReports() {
            if (!token) return;
            setIsLoading(true);

            try {
                const response = await getReports(token.accessToken, {
                    region: regionCode,
                    startDate,
                    endDate,
                    page,
                    limit
                });

                if (response.data) {
                    setOverview(response.data.overview);
                    setReports(response.data.reports || []);
                    if (response.data.pagination) {
                        setTotalRows(response.data.pagination.totalRows);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch reports:', error);
            } finally {
                setIsLoading(false);
            }
        }

        const timeoutId = setTimeout(() => {
            fetchReports();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [token, regionCode, startDate, endDate, page, limit]);

    // Helpers
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateString.split('-');
            return `${day}-${month}-${year}`;
        }
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    return (
        <DashboardLayout>
            <div className="font-sans">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {t('reports')}
                        </h1>
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

                    {/* Filters */}
                    <div className="mb-10">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-6">
                            Filter Laporan
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">Periode</label>
                                <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl h-[48px] px-4 w-full shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">

                                    {/* Start Date */}
                                    <div className="relative w-full h-full flex items-center">
                                        <input
                                            type="text"
                                            readOnly
                                            value={formatDate(startDate)}
                                            className="w-full bg-transparent text-sm font-medium text-gray-600 focus:outline-none placeholder-gray-400 cursor-pointer text-center"
                                            placeholder="dd-mm-yyyy"
                                        />
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full"
                                        />
                                    </div>

                                    <span className="text-gray-400 mx-2">-</span>

                                    {/* End Date */}
                                    <div className="relative w-full h-full flex items-center">
                                        <input
                                            type="text"
                                            readOnly
                                            value={formatDate(endDate)}
                                            className="w-full bg-transparent text-sm font-medium text-gray-600 focus:outline-none placeholder-gray-400 cursor-pointer text-center"
                                            placeholder="dd-mm-yyyy"
                                        />
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* stats */}
                        {overview && (
                            <div className="space-y-6 mb-10">
                                {/* Top Row: Large Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-[#eff6ff] dark:bg-gray-800 px-5 py-4 rounded-2xl border border-blue-100 dark:border-gray-700 h-full flex flex-col justify-center min-h-[110px]">
                                        <p className="text-gray-500 dark:text-gray-400 font-medium text-xs mb-1 uppercase tracking-wide">Total Pengeluaran</p>
                                        <h3 className="text-2xl md:text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
                                            {formatCurrency(overview.totalAmount, currency)}
                                        </h3>
                                    </div>
                                    <div className="bg-[#eff6ff] dark:bg-gray-800 px-5 py-4 rounded-2xl border border-blue-100 dark:border-gray-700 h-full flex flex-col justify-center min-h-[110px]">
                                        <p className="text-gray-500 dark:text-gray-400 font-medium text-xs mb-1 uppercase tracking-wide">Total Transaksi</p>
                                        <h3 className="text-2xl md:text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
                                            {overview.totalTransactions}
                                        </h3>
                                    </div>
                                </div>

                                {/* Second Row: Detail Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {/* Average */}
                                    <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl border-[1.5px] border-gray-100 hover:border-blue-200 shadow-sm transition-all h-[90px] md:h-[110px] flex flex-col justify-center">
                                        <p className="text-gray-500 font-medium text-[10px] mb-0.5 uppercase tracking-wide">Rata-rata / Hari</p>
                                        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(overview.averagePerDay, currency)}
                                        </h3>
                                    </div>

                                    {/* Highest Day */}
                                    <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl border-[1.5px] border-gray-100 hover:border-green-200 shadow-sm transition-all h-[90px] md:h-[110px] flex flex-col justify-center">
                                        <p className="text-gray-500 font-medium text-[10px] mb-0.5 uppercase tracking-wide">Hari Tertinggi</p>
                                        <h3 className="text-lg md:text-xl font-bold text-green-600">
                                            {overview.highestDay?.date ? formatDate(overview.highestDay.date) : '-'}
                                        </h3>
                                        <p className="text-[10px] text-gray-400 font-medium">
                                            {formatCurrency(overview.highestDay?.amount || 0, currency)}
                                        </p>
                                    </div>

                                    {/* Lowest Day */}
                                    <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl border-[1.5px] border-gray-100 hover:border-red-200 shadow-sm transition-all h-[90px] md:h-[110px] flex flex-col justify-center">
                                        <p className="text-gray-500 font-medium text-[10px] mb-0.5 uppercase tracking-wide">Hari Terendah</p>
                                        <h3 className="text-lg md:text-xl font-bold text-red-500">
                                            {overview.lowestDay?.date ? formatDate(overview.lowestDay.date) : '-'}
                                        </h3>
                                        <p className="text-[10px] text-gray-400 font-medium">
                                            {formatCurrency(overview.lowestDay?.amount || 0, currency)}
                                        </p>
                                    </div>

                                    {/* Total Days */}
                                    <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl border-[1.5px] border-gray-100 hover:border-purple-200 shadow-sm transition-all h-[90px] md:h-[110px] flex flex-col justify-center">
                                        <p className="text-gray-500 font-medium text-[10px] mb-0.5 uppercase tracking-wide">Total Hari</p>
                                        <h3 className="text-lg md:text-xl font-bold text-purple-600">
                                            {overview.totalDays} Hari
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 dark:bg-gray-700/80 border-b border-gray-200 dark:border-gray-700">
                                            <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Periode</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-center">Jumlah Transaksi</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-right">Total Nominal</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-20">
                                                    <div className="flex justify-center items-center w-full">
                                                        <LoadingSpinner size="lg" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : reports.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-20 text-center text-gray-500 dark:text-gray-400">
                                                    <div className="flex flex-col items-center">
                                                        <FileText className="w-12 h-12 text-gray-300 mb-4" />
                                                        <p className="text-lg font-medium text-gray-900 dark:text-white">{t('noReports')}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            reports.map((report, index) => (
                                                <tr key={index} className="group hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-all">
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white align-middle">
                                                        {formatDate(report.date)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-center text-gray-700 dark:text-gray-300 align-middle">
                                                        {report.totalTransactions}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-right font-bold text-gray-900 dark:text-white align-middle">
                                                        {formatCurrency(report.totalAmount, currency)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right align-middle">
                                                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1 transition-colors">
                                                            <Download className="w-4 h-4" />
                                                            Unduh
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
