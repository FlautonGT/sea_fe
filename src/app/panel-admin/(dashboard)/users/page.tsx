'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable, StatusBadge, StatsCard } from '@/components/admin/ui';
import { getUsers } from '@/lib/adminApi';
import { AdminUser, Pagination } from '@/types/admin';
import {
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  Crown,
  MoreVertical,
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

const membershipColors: Record<string, string> = {
  CLASSIC: 'bg-gray-100 text-gray-700',
  PRESTIGE: 'bg-blue-100 text-blue-700',
  ROYAL: 'bg-yellow-100 text-yellow-700',
};

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [membership, setMembership] = useState('');
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getUsers({
        limit: 10,
        page,
        search: search || undefined,
        status: status || undefined,
        membership: membership || undefined,
      });

      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data pengguna');
      setUsers([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, membership]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns = [
    {
      key: 'user',
      header: 'Pengguna',
      render: (item: AdminUser) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-600">
              {item.firstName[0]}{item.lastName[0]}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{item.firstName} {item.lastName}</p>
            <p className="text-xs text-gray-500">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'No. Telepon',
      render: (item: AdminUser) => (
        <p className="text-gray-700">{item.phoneNumber}</p>
      ),
    },
    {
      key: 'membership',
      header: 'Membership',
      render: (item: AdminUser) => (
        <span className={cn(
          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
          membershipColors[item.membership.level] || 'bg-gray-100 text-gray-700'
        )}>
          {item.membership.level === 'ROYAL' && <Crown className="w-3 h-3" />}
          {item.membership.name}
        </span>
      ),
    },
    {
      key: 'balance',
      header: 'Saldo',
      render: (item: AdminUser) => (
        <p className="font-medium text-gray-900">
          {formatCurrency(item.balance.IDR, 'IDR')}
        </p>
      ),
    },
    {
      key: 'stats',
      header: 'Transaksi',
      render: (item: AdminUser) => (
        <div>
          <p className="font-medium text-gray-900">{item.stats.totalTransactions} trx</p>
          <p className="text-xs text-gray-500">
            {formatCurrency(item.stats.totalSpent, 'IDR')}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: AdminUser) => (
        <StatusBadge status={item.status} size="sm" />
      ),
    },
    {
      key: 'lastLogin',
      header: 'Login Terakhir',
      render: (item: AdminUser) => (
        <p className="text-sm text-gray-500">
          {item.lastLoginAt
            ? format(new Date(item.lastLoginAt), 'dd MMM yyyy, HH:mm', { locale: id })
            : '-'
          }
        </p>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (item: AdminUser) => (
        <div className="flex items-center gap-1">
          <button className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengguna</h1>
          <p className="text-gray-500 mt-1">Kelola semua pengguna Seaply</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
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
          title="Total Pengguna"
          value={pagination?.totalRows?.toLocaleString('id-ID') || '0'}
          icon={<Users className="w-5 h-5 text-primary-600" />}
          loading={loading}
        />
        <StatsCard
          title="Pengguna Aktif"
          value="8,500"
          icon={<UserCheck className="w-5 h-5 text-green-600" />}
          iconBgColor="bg-green-100"
          loading={loading}
        />
        <StatsCard
          title="Member Royal"
          value="250"
          icon={<Crown className="w-5 h-5 text-yellow-600" />}
          iconBgColor="bg-yellow-100"
          loading={loading}
        />
        <StatsCard
          title="Ditangguhkan"
          value="45"
          icon={<UserX className="w-5 h-5 text-red-600" />}
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
              placeholder="Cari nama, email, atau nomor HP..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white"
          >
            <option value="">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Tidak Aktif</option>
            <option value="SUSPENDED">Ditangguhkan</option>
          </select>

          {/* Membership Filter */}
          <select
            value={membership}
            onChange={(e) => setMembership(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white"
          >
            <option value="">Semua Membership</option>
            <option value="CLASSIC">Classic</option>
            <option value="PRESTIGE">Prestige</option>
            <option value="ROYAL">Royal</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="Tidak ada pengguna ditemukan"
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

