'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { StatsCard, StatusBadge } from '@/components/admin/ui';
import { getDashboardOverview } from '@/lib/adminApi';
import { DashboardOverview } from '@/types/admin';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Users,
  UserPlus,
  Activity,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1)}Jt`;
  }
  if (value >= 1_000) {
    return `Rp ${(value / 1_000).toFixed(0)}Rb`;
  }
  return `Rp ${value.toLocaleString('id-ID')}`;
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString('id-ID');
}

export default function AdminDashboardPage() {
  const { admin } = useAdminAuth();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getDashboardOverview();
      setOverview(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data dashboard');
      setOverview(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {admin?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Berikut ringkasan aktivitas Seaply hari ini
          </p>
        </div>
        <button
          onClick={fetchDashboard}
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
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Total Pendapatan"
          value={formatCurrency(overview?.summary?.totalRevenue || 0)}
          icon={<DollarSign className="w-5 h-5 text-primary-600" />}
          loading={loading}
        />
        <StatsCard
          title="Total Profit"
          value={formatCurrency(overview?.summary?.totalProfit || 0)}
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          iconBgColor="bg-green-100"
          loading={loading}
        />
        <StatsCard
          title="Total Transaksi"
          value={formatNumber(overview?.summary?.totalTransactions || 0)}
          icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
          iconBgColor="bg-blue-100"
          loading={loading}
        />
        <StatsCard
          title="Total Pengguna"
          value={formatNumber(overview?.summary?.totalUsers || 0)}
          icon={<Users className="w-5 h-5 text-purple-600" />}
          iconBgColor="bg-purple-100"
          loading={loading}
        />
        <StatsCard
          title="Pengguna Baru"
          value={formatNumber(overview?.summary?.newUsers || 0)}
          icon={<UserPlus className="w-5 h-5 text-orange-600" />}
          iconBgColor="bg-orange-100"
          loading={loading}
        />
        <StatsCard
          title="Pengguna Aktif"
          value={formatNumber(overview?.summary?.activeUsers || 0)}
          icon={<Activity className="w-5 h-5 text-teal-600" />}
          iconBgColor="bg-teal-100"
          loading={loading}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Produk Terlaris</h2>
            <Link
              href="/panel-admin/products"
              className="text-sm text-primary-600 hover:underline inline-flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {overview?.topProducts?.map((product, index) => (
                <div
                  key={product.code}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-sm font-bold text-primary-600">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">{formatNumber(product.transactions)} transaksi</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Payment Methods */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Metode Pembayaran Populer</h2>
            <Link
              href="/panel-admin/payment-channels"
              className="text-sm text-primary-600 hover:underline inline-flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {overview?.topPayments?.map((payment, index) => (
                <div
                  key={payment.code}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{payment.name}</p>
                    <p className="text-sm text-gray-500">{formatNumber(payment.transactions)} transaksi</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(payment.revenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Provider Health */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Status Provider</h2>
          <Link
            href="/panel-admin/providers"
            className="text-sm text-primary-600 hover:underline inline-flex items-center gap-1"
          >
            Lihat Detail <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-24 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {overview?.providerHealth?.map((provider) => (
              <div
                key={provider.code}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{provider.code}</h3>
                  <StatusBadge status={provider.status as any} size="sm" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        provider.successRate >= 98 ? 'bg-green-500' :
                          provider.successRate >= 95 ? 'bg-yellow-500' : 'bg-red-500'
                      )}
                      style={{ width: `${provider.successRate}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {provider.successRate}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Success Rate</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/panel-admin/transactions"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Transaksi</span>
          </Link>
          <Link
            href="/panel-admin/users"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <Users className="w-6 h-6 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Pengguna</span>
          </Link>
          <Link
            href="/panel-admin/promos"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <TrendingUp className="w-6 h-6 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Promo</span>
          </Link>
          <Link
            href="/panel-admin/reports"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <Activity className="w-6 h-6 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Laporan</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

