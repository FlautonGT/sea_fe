'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable, StatusBadge, StatsCard } from '@/components/admin/ui';
import { getDeposits } from '@/lib/adminApi';
import { AdminDeposit, Pagination } from '@/types/admin';
import {
  Search,
  Eye,
  RefreshCw,
  Wallet,
  CheckCircle,
  Clock,
  XCircle,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

function formatCurrency(value: number, currency: string = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(value);
}

export default function DepositsPage() {
  const [deposits, setDeposits] = useState<AdminDeposit[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const fetchDeposits = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getDeposits({
        limit: 10,
        page,
        search: search || undefined,
        status: status || undefined,
      });
      setDeposits(data.deposits);
      setOverview(data.overview);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data deposit');
      setDeposits([]);
      setOverview(null);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  const columns = [
    {
      key: 'invoice',
      header: 'Invoice',
      render: (item: AdminDeposit) => (
        <div>
          <p className="font-mono text-xs font-medium text-gray-900">{item.invoiceNumber}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {format(new Date(item.createdAt), 'dd MMM yyyy, HH:mm', { locale: id })}
          </p>
        </div>
      ),
    },
    {
      key: 'user',
      header: 'Pengguna',
      render: (item: AdminDeposit) => (
        <div>
          <p className="font-medium text-gray-900">{item.user.name}</p>
          <p className="text-xs text-gray-500">{item.user.email}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Jumlah',
      render: (item: AdminDeposit) => (
        <p className="font-medium text-gray-900">
          {formatCurrency(item.amount, item.currency)}
        </p>
      ),
    },
    {
      key: 'payment',
      header: 'Pembayaran',
      render: (item: AdminDeposit) => (
        <div>
          <p className="font-medium text-gray-900">{item.payment.name}</p>
          <p className="text-xs text-gray-500">{item.payment.gateway}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: AdminDeposit) => (
        <StatusBadge status={item.status} size="sm" />
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (item: AdminDeposit) => (
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
          <h1 className="text-2xl font-bold text-gray-900">Deposit</h1>
          <p className="text-gray-500 mt-1">Kelola semua deposit saldo pengguna</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDeposits}
            disabled={loading}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg',
              'text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors'
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

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard
          title="Total Deposit"
          value={overview?.totalDeposits?.toLocaleString('id-ID') || '0'}
          icon={<Wallet className="w-5 h-5 text-primary" />}
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
          title="Pending"
          value={overview?.pendingCount?.toLocaleString('id-ID') || '0'}
          icon={<Clock className="w-5 h-5 text-yellow-600" />}
          iconBgColor="bg-yellow-100"
          loading={loading}
        />
        <StatsCard
          title="Expired/Gagal"
          value={((overview?.expiredCount || 0) + (overview?.failedCount || 0)).toLocaleString('id-ID')}
          icon={<XCircle className="w-5 h-5 text-red-600" />}
          iconBgColor="bg-red-100"
          loading={loading}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari invoice, email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
          >
            <option value="">Semua Status</option>
            <option value="SUCCESS">Sukses</option>
            <option value="PENDING">Pending</option>
            <option value="EXPIRED">Expired</option>
            <option value="FAILED">Gagal</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={deposits}
        loading={loading}
        emptyMessage="Tidak ada deposit ditemukan"
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

