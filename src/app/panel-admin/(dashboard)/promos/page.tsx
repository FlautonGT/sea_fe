'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable, StatusBadge, StatsCard, ConfirmDialog } from '@/components/admin/ui';
import { PromoFormModal } from '@/components/admin/forms';
import { deletePromo, getPromos } from '@/lib/adminApi';
import { AdminPromo, Pagination } from '@/types/admin';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Tags,
  Percent,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function PromosPage() {
  const [promos, setPromos] = useState<AdminPromo[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState<AdminPromo | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchPromos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getPromos({ limit: 10, page, search: search || undefined });
      setPromos(data.promos);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat promo');
      setPromos([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const columns = [
    {
      key: 'code',
      header: 'Kode Promo',
      render: (item: AdminPromo) => (
        <div>
          <p className="font-mono font-bold text-primary">{item.code}</p>
          <p className="text-xs text-gray-500">{item.title}</p>
        </div>
      ),
    },
    {
      key: 'discount',
      header: 'Diskon',
      render: (item: AdminPromo) => (
        <div className="flex items-center gap-2">
          <Percent className="w-4 h-4 text-green-600" />
          <span className="font-medium text-gray-900">
            {item.promoPercentage > 0 
              ? `${item.promoPercentage}%`
              : `Rp ${item.promoFlat.toLocaleString('id-ID')}`
            }
          </span>
        </div>
      ),
    },
    {
      key: 'usage',
      header: 'Penggunaan',
      render: (item: AdminPromo) => (
        <div>
          <p className="font-medium text-gray-900">
            {item.currentUsage?.toLocaleString('id-ID')} / {item.maxUsage.toLocaleString('id-ID')}
          </p>
          <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1">
            <div 
              className="h-full bg-primary rounded-full"
              style={{ width: `${Math.min(((item.currentUsage || 0) / item.maxUsage) * 100, 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'period',
      header: 'Periode',
      render: (item: AdminPromo) => (
        <div className="text-sm">
          <p className="text-gray-700">
            {format(new Date(item.startAt), 'dd MMM yyyy', { locale: id })}
          </p>
          <p className="text-gray-500">
            s/d {format(new Date(item.expiredAt), 'dd MMM yyyy', { locale: id })}
          </p>
        </div>
      ),
    },
    {
      key: 'products',
      header: 'Produk',
      render: (item: AdminPromo) => {
        const products = item.products || [];
        return (
          <div className="flex items-center gap-1 flex-wrap">
            {products.length === 0 ? (
              <span className="text-xs text-gray-500">Semua Produk</span>
            ) : (
              <>
                {products.slice(0, 2).map((p) => (
                  <span key={p} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                    {p}
                  </span>
                ))}
                {products.length > 2 && (
                  <span className="text-xs text-gray-500">+{products.length - 2}</span>
                )}
              </>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: AdminPromo) => (
        <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} size="sm" />
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (item: AdminPromo) => (
        <div className="flex items-center gap-1">
          <button
            className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              setEditingPromo(item);
              setShowForm(true);
            }}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              setEditingPromo(item);
              setShowDeleteDialog(true);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const totalActive = promos.filter((promo) => promo.isActive).length;
  const totalUsage = promos.reduce((sum, promo) => sum + (promo.currentUsage || 0), 0);
  const totalDiscount = promos.reduce((sum, promo) => {
    const discountValue =
      promo.promoPercentage > 0
        ? promo.promoPercentage / 100
        : (promo.promoFlat || 0);
    return sum + discountValue;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promo</h1>
          <p className="text-gray-500 mt-1">Kelola kode promo dan diskon</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPromos}
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
            onClick={() => {
              setEditingPromo(null);
              setShowForm(true);
            }}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg',
              'text-sm font-medium hover:bg-primary/90 transition-colors'
            )}
          >
            <Plus className="w-4 h-4" />
            Tambah Promo
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
          title="Total Promo"
          value={pagination?.totalRows?.toString() || '0'}
          icon={<Tags className="w-5 h-5 text-primary" />}
          loading={loading}
        />
        <StatsCard
          title="Promo Aktif"
          value={totalActive.toString()}
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          iconBgColor="bg-green-100"
          loading={loading}
        />
        <StatsCard
          title="Penggunaan Hari Ini"
          value={totalUsage.toLocaleString('id-ID')}
          icon={<Percent className="w-5 h-5 text-blue-600" />}
          iconBgColor="bg-blue-100"
          loading={loading}
        />
        <StatsCard
          title="Total Diskon"
          value={`Rp ${totalDiscount.toLocaleString('id-ID')}`}
          icon={<Calendar className="w-5 h-5 text-purple-600" />}
          iconBgColor="bg-purple-100"
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
              placeholder="Cari kode promo..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={promos}
        loading={loading}
        emptyMessage="Tidak ada promo ditemukan"
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

      <PromoFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        initialData={editingPromo}
        onSuccess={fetchPromos}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={async () => {
          if (!editingPromo) return;
          try {
            setDeleteLoading(true);
            await deletePromo(editingPromo.id);
            setShowDeleteDialog(false);
            fetchPromos();
          } catch (err: any) {
            setError(err.message || 'Gagal menghapus promo');
          } finally {
            setDeleteLoading(false);
          }
        }}
        loading={deleteLoading}
        title="Hapus Promo"
        description={`Yakin ingin menghapus promo ${editingPromo?.code}?`}
        confirmText="Hapus"
        confirmVariant="danger"
      />
    </div>
  );
}

