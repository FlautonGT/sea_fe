'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable, StatusBadge, StatsCard } from '@/components/admin/ui';
import { getTransactions } from '@/lib/adminApi';
import { AdminTransaction, Pagination } from '@/types/admin';
import {
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  ShoppingCart,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

function formatCurrency(value: number, currency: string = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [overview, setOverview] = useState<{
    totalTransactions: number;
    totalRevenue: number;
    totalProfit: number;
    successCount: number;
    processingCount: number;
    pendingCount: number;
    failedCount: number;
  } | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await getTransactions({
        limit: 10,
        page,
        search: search || undefined,
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
      });
      
      setTransactions(data.transactions);
      setOverview(data.overview);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data transaksi');
      setTransactions([]);
      setOverview(null);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, paymentStatus]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const columns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice',
      render: (item: AdminTransaction) => (
        <div>
          <p className="font-mono text-xs font-medium text-gray-900">{item.invoiceNumber}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {format(new Date(item.createdAt), 'dd MMM yyyy, HH:mm', { locale: id })}
          </p>
        </div>
      ),
    },
    {
      key: 'product',
      header: 'Produk',
      render: (item: AdminTransaction) => (
        <div>
          <p className="font-medium text-gray-900">{item.product.name}</p>
          <p className="text-xs text-gray-500">{item.sku.name}</p>
        </div>
      ),
    },
    {
      key: 'account',
      header: 'Akun',
      render: (item: AdminTransaction) => (
        <div>
          {item.account.nickname && (
            <p className="font-medium text-gray-900">{item.account.nickname}</p>
          )}
          <p className="text-xs text-gray-500">{item.account.inputs}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: AdminTransaction) => (
        <div className="space-y-1">
          <StatusBadge status={item.status} size="sm" />
          <StatusBadge status={item.paymentStatus} size="sm" />
        </div>
      ),
    },
    {
      key: 'payment',
      header: 'Pembayaran',
      render: (item: AdminTransaction) => (
        <div>
          <p className="font-medium text-gray-900">{item.payment.name}</p>
          <p className="text-xs text-gray-500">{item.payment.gateway}</p>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (item: AdminTransaction) => (
        <div className="text-right">
          <p className="font-medium text-gray-900">
            {formatCurrency(item.pricing.total, item.pricing.currency)}
          </p>
          <p className="text-xs text-green-600">
            +{formatCurrency(item.pricing.profit, item.pricing.currency)}
          </p>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (item: AdminTransaction) => (
        <button className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors">
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaksi</h1>
          <p className="text-gray-500 mt-1">Kelola semua transaksi pembelian</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTransactions}
            disabled={loading}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg',
              'text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Refresh
          </button>
          <button
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg',
              'text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors'
            )}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard
          title="Total Transaksi"
          value={overview?.totalTransactions?.toLocaleString('id-ID') || '0'}
          icon={<ShoppingCart className="w-5 h-5 text-primary" />}
          loading={loading}
        />
        <StatsCard
          title="Sukses"
          value={overview?.successCount?.toLocaleString('id-ID') || '0'}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          iconBgColor="bg-green-100"
          loading={loading}
        />
        <StatsCard
          title="Pending/Proses"
          value={((overview?.pendingCount || 0) + (overview?.processingCount || 0)).toLocaleString('id-ID')}
          icon={<Clock className="w-5 h-5 text-yellow-600" />}
          iconBgColor="bg-yellow-100"
          loading={loading}
        />
        <StatsCard
          title="Gagal"
          value={overview?.failedCount?.toLocaleString('id-ID') || '0'}
          icon={<XCircle className="w-5 h-5 text-red-600" />}
          iconBgColor="bg-red-100"
          loading={loading}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari invoice, email, nomor HP..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
          >
            <option value="">Semua Status</option>
            <option value="SUCCESS">Sukses</option>
            <option value="PROCESSING">Diproses</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Gagal</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
          >
            <option value="">Semua Pembayaran</option>
            <option value="PAID">Dibayar</option>
            <option value="UNPAID">Belum Dibayar</option>
            <option value="EXPIRED">Kadaluarsa</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg',
              'text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors',
              showFilters && 'bg-gray-100'
            )}
          >
            <Filter className="w-4 h-4" />
            Filter Lanjutan
          </button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={transactions}
        loading={loading}
        emptyMessage="Tidak ada transaksi ditemukan"
        pagination={
          pagination
            ? {
                page: pagination.page,
                totalPages: pagination.totalPages,
                totalRows: pagination.totalRows,
                limit: pagination.limit,
                onPageChange: setPage,
              }
            : undefined
        }
      />
    </div>
  );
}

