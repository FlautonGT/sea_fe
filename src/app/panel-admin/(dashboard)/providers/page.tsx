'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StatusBadge, StatsCard } from '@/components/admin/ui';
import { getProviders, testProvider, syncProviderSKUs } from '@/lib/adminApi';
import { Provider } from '@/types/admin';
import {
  RefreshCw,
  Server,
  Activity,
  Zap,
  AlertTriangle,
  Play,
  RotateCcw,
  Settings,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getProviders();
      setProviders(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data provider');
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleTestProvider = async (providerId: string) => {
    setTestingProvider(providerId);
    try {
      await testProvider(providerId);
      // Show success toast
    } catch (err) {
      // Show error toast
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSyncProvider = async (providerId: string) => {
    setSyncingProvider(providerId);
    try {
      await syncProviderSKUs(providerId);
      // Show success toast
    } catch (err) {
      // Show error toast
    } finally {
      setSyncingProvider(null);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'text-green-600';
      case 'DEGRADED':
        return 'text-yellow-600';
      case 'DOWN':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getHealthBg = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'bg-green-100';
      case 'DEGRADED':
        return 'bg-yellow-100';
      case 'DOWN':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Provider</h1>
          <p className="text-gray-500 mt-1">Kelola provider produk dan SKU</p>
        </div>
        <button
          onClick={fetchProviders}
          disabled={loading}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg',
            'text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors'
          )}
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard
          title="Total Provider"
          value={providers.length.toString()}
          icon={<Server className="w-5 h-5 text-primary" />}
          loading={loading}
        />
        <StatsCard
          title="Provider Aktif"
          value={providers.filter(p => p.isActive).length.toString()}
          icon={<Activity className="w-5 h-5 text-green-600" />}
          iconBgColor="bg-green-100"
          loading={loading}
        />
        <StatsCard
          title="Total SKU"
          value={providers.reduce((sum, p) => sum + p.stats.totalSkus, 0).toLocaleString('id-ID')}
          icon={<Zap className="w-5 h-5 text-blue-600" />}
          iconBgColor="bg-blue-100"
          loading={loading}
        />
        <StatsCard
          title="Rata-rata Success Rate"
          value={`${(providers.reduce((sum, p) => sum + p.stats.successRate, 0) / providers.length || 0).toFixed(1)}%`}
          icon={<CheckCircle className="w-5 h-5 text-purple-600" />}
          iconBgColor="bg-purple-100"
          loading={loading}
        />
      </div>

      {/* Provider Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', getHealthBg(provider.healthStatus))}>
                    <Server className={cn('w-5 h-5', getHealthColor(provider.healthStatus))} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                    <p className="text-xs text-gray-500">{provider.code}</p>
                  </div>
                </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-sm text-red-700">
          {error}
        </div>
      )}
                <StatusBadge status={provider.healthStatus} size="sm" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">SKU Aktif</p>
                  <p className="font-semibold text-gray-900">
                    {provider.stats.activeSkus.toLocaleString('id-ID')} / {provider.stats.totalSkus.toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Success Rate</p>
                  <p className="font-semibold text-gray-900">{provider.stats.successRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Transaksi Hari Ini</p>
                  <p className="font-semibold text-gray-900">
                    {provider.stats.todayTransactions?.toLocaleString('id-ID') || '0'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avg Response</p>
                  <p className="font-semibold text-gray-900">{provider.stats.avgResponseTime}ms</p>
                </div>
              </div>

              {/* Supported Types */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Tipe Didukung</p>
                <div className="flex flex-wrap gap-1">
                  {provider.supportedTypes.slice(0, 4).map((type) => (
                    <span key={type} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                      {type}
                    </span>
                  ))}
                  {provider.supportedTypes.length > 4 && (
                    <span className="text-xs text-gray-500">+{provider.supportedTypes.length - 4}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleTestProvider(provider.id)}
                  disabled={testingProvider === provider.id}
                  className={cn(
                    'flex-1 inline-flex items-center justify-center gap-2 px-3 py-2',
                    'text-sm font-medium rounded-lg border border-gray-200',
                    'hover:bg-gray-50 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {testingProvider === provider.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Test
                </button>
                <button
                  onClick={() => handleSyncProvider(provider.id)}
                  disabled={syncingProvider === provider.id}
                  className={cn(
                    'flex-1 inline-flex items-center justify-center gap-2 px-3 py-2',
                    'text-sm font-medium rounded-lg border border-gray-200',
                    'hover:bg-gray-50 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {syncingProvider === provider.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                  Sync
                </button>
                <button
                  className={cn(
                    'p-2 rounded-lg border border-gray-200',
                    'hover:bg-gray-50 transition-colors'
                  )}
                >
                  <Settings className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

