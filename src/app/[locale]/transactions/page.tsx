'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Button, Input, LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { Transaction, TransactionOverview } from '@/types';
import { getTransactions } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getTransactionStatusColor, getPaymentStatusColor, getStatusTranslationKey } from '@/lib/status';
import { translations } from '@/lib/translations';

export default function TransactionsPage() {
  const { token } = useAuth();
  const { regionCode, currency, getLocalizedPath, language } = useLocale();
  const { t } = useTranslation();

  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [overview, setOverview] = useState<TransactionOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  // Initialize dates to today
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Focus states for date inputs
  const [isStartDateFocused, setIsStartDateFocused] = useState(false);
  const [isEndDateFocused, setIsEndDateFocused] = useState(false);

  // Fetch Data
  useEffect(() => {
    async function fetchTransactions() {
      if (!token) return;
      setIsLoading(true);

      try {
        const response = await getTransactions(token.accessToken, {
          region: regionCode,
          page,
          limit,
          search: searchQuery || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          paymentStatus: paymentStatusFilter !== 'ALL' ? paymentStatusFilter : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });

        if (response.data) {
          setOverview(response.data.overview);
          setTransactions(response.data.transactions);
          setTotalRows(response.data.pagination.totalRows);
          setTotalPages(response.data.pagination.totalPages);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setIsLoading(false);
      }
    }

    const timeoutId = setTimeout(() => {
      fetchTransactions();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [token, regionCode, page, limit, searchQuery, statusFilter, paymentStatusFilter, startDate, endDate]);

  // Date Formatter
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    // Handle YYYY-MM-DD manually to avoid timezone issues
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
              {t('transactions')}
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

          {/* Filters Section */}
          <div className="mb-10">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-6">
              Riwayat Semua Transaksi
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">Status</label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="w-full h-[48px] pl-4 pr-10 appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer shadow-sm"
                  >
                    <option value="ALL">Semua</option>
                    <option value="SUCCESS">Success</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="FAILED">Failed</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                    <ChevronLeft className="w-4 h-4 -rotate-90" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">Status Pembayaran</label>
                <div className="relative">
                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => { setPaymentStatusFilter(e.target.value); setPage(1); }}
                    className="w-full h-[48px] pl-4 pr-10 appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer shadow-sm"
                  >
                    <option value="ALL">Semua</option>
                    <option value="PAID">Paid</option>
                    <option value="UNPAID">Unpaid</option>
                    <option value="EXPIRED">Expired</option>
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
                    {/* Visual Display (Text) */}
                    <input
                      type="text"
                      readOnly
                      value={formatDate(startDate)}
                      className="w-full bg-transparent text-sm font-medium text-gray-600 focus:outline-none placeholder-gray-400 cursor-pointer text-center"
                      placeholder="dd-mm-yyyy"
                    />
                    {/* Actual Input (Hidden Layer) */}
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
                    {/* Visual Display (Text) */}
                    <input
                      type="text"
                      readOnly
                      value={formatDate(endDate)}
                      className="w-full bg-transparent text-sm font-medium text-gray-600 focus:outline-none placeholder-gray-400 cursor-pointer text-center"
                      placeholder="dd-mm-yyyy"
                    />
                    {/* Actual Input (Hidden Layer) */}
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

            {/* Overview Stats */}
            {overview && (
              <div className="space-y-6 mb-10">
                {/* Top Row: Total Transaction & Total Sales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#eff6ff] dark:bg-gray-800 px-5 py-4 rounded-2xl border border-blue-100 dark:border-gray-700 h-full flex flex-col justify-center min-h-[110px]">
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-xs mb-1 uppercase tracking-wide">Total Transaksi</p>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
                      {formatCurrency(overview.totalPurchase, currency)}
                    </h3>
                  </div>
                  <div className="bg-[#eff6ff] dark:bg-gray-800 px-5 py-4 rounded-2xl border border-blue-100 dark:border-gray-700 h-full flex flex-col justify-center min-h-[110px]">
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-xs mb-1 uppercase tracking-wide">Total Penjualan</p>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
                      {overview.totalTransaction}
                    </h3>
                  </div>
                </div>

                {/* Second Row: Status Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Success */}
                  <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl border-[1.5px] border-green-100 shadow-sm hover:shadow-md hover:border-green-300 transition-all h-[90px] md:h-[110px] flex flex-col justify-center">
                    <p className="text-gray-500 font-medium text-[10px] group-hover:text-green-600 transition-colors mb-0.5 uppercase tracking-wide">Sukses</p>
                    <h3 className="text-xl md:text-2xl font-bold text-green-500">{overview.success}</h3>
                  </div>
                  {/* Processing */}
                  <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl border-[1.5px] border-blue-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all h-[90px] md:h-[110px] flex flex-col justify-center">
                    <p className="text-gray-500 font-medium text-[10px] group-hover:text-blue-600 transition-colors mb-0.5 uppercase tracking-wide">Dalam Proses</p>
                    <h3 className="text-xl md:text-2xl font-bold text-blue-500">{overview.processing}</h3>
                  </div>
                  {/* Pending */}
                  <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl border-[1.5px] border-yellow-100 shadow-sm hover:shadow-md hover:border-yellow-300 transition-all h-[90px] md:h-[110px] flex flex-col justify-center">
                    <p className="text-gray-500 font-medium text-[10px] group-hover:text-yellow-600 transition-colors mb-0.5 uppercase tracking-wide">Menunggu</p>
                    <h3 className="text-xl md:text-2xl font-bold text-yellow-500">{overview.pending}</h3>
                  </div>
                  {/* Failed */}
                  <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl border-[1.5px] border-red-100 shadow-sm hover:shadow-md hover:border-red-300 transition-all h-[90px] md:h-[110px] flex flex-col justify-center">
                    <p className="text-gray-500 font-medium text-[10px] group-hover:text-red-600 transition-colors mb-0.5 uppercase tracking-wide">Gagal</p>
                    <h3 className="text-xl md:text-2xl font-bold text-red-500">{overview.failed}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700/80 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">No. Invoice</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">User Input</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Harga</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">Pembayaran</th>
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
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-20 text-center text-gray-500 dark:text-gray-400">
                          <div className="flex flex-col items-center">
                            <Search className="w-12 h-12 text-gray-300 mb-4" />
                            <p className="text-lg font-medium text-gray-900 dark:text-white">{t('noTransactions')}</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      transactions.map((trx) => (
                        <tr key={trx.invoiceNumber} className="group hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-all">
                          <td className="px-6 py-6 text-sm text-gray-600 dark:text-gray-300 align-middle">
                            <Link href={getLocalizedPath(`/invoice/${trx.invoiceNumber}`)} className="hover:text-primary-600 transition-colors font-semibold">
                              {trx.invoiceNumber}
                            </Link>
                          </td>
                          <td className="px-6 py-6 align-middle">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900 dark:text-white">
                                {trx.product.name}
                              </span>
                              <span className="text-xs text-gray-500 mt-1 font-medium">
                                {trx.sku.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-sm text-gray-500 dark:text-gray-400 align-middle font-medium">
                            {trx.account?.inputs || trx.account?.nickname || '-'}
                          </td>
                          <td className="px-6 py-6 text-sm font-bold text-gray-900 dark:text-white align-middle">
                            {formatCurrency(trx.pricing?.total || 0, currency)}
                          </td>
                          <td className="px-6 py-6 text-sm text-gray-500 dark:text-gray-400 align-middle font-medium">
                            {formatDate(trx.createdAt)}
                          </td>
                          <td className="px-6 py-6 text-right align-middle">
                            <span className={cn(
                              "font-bold text-xs uppercase tracking-wide px-2 py-1 rounded-full border",
                              getTransactionStatusColor(trx.status.transaction)
                            )}>
                              {translations[language]?.[getStatusTranslationKey(trx.status.transaction, 'transaction')] || trx.status.transaction}
                            </span>
                          </td>
                          <td className="px-6 py-6 text-right align-middle">
                            <span className={cn(
                              "font-bold text-xs uppercase tracking-wide px-2 py-1 rounded-full border",
                              getPaymentStatusColor(trx.status.payment)
                            )}>
                              {translations[language]?.[getStatusTranslationKey(trx.status.payment, 'payment')] || trx.status.payment}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              {!isLoading && transactions.length > 0 && (
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
