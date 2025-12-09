'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable, StatusBadge, StatsCard, ConfirmDialog } from '@/components/admin/ui';
import { SKUFormModal } from '@/components/admin/forms';
import { deleteSKU, getSKUs } from '@/lib/adminApi';
import { AdminSKU, Pagination } from '@/types/admin';
import { Search, Plus, Edit, Trash2, RefreshCw, Layers, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatCurrency(value: number, currency: string = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency, minimumFractionDigits: 0 }).format(value);
}

export default function SKUsPage() {
  const [skus, setSKUs] = useState<AdminSKU[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingSKU, setEditingSKU] = useState<AdminSKU | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchSKUs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getSKUs({ limit: 10, page, search: search || undefined });
      setSKUs(data.skus);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat SKU');
      setSKUs([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchSKUs(); }, [fetchSKUs]);

  const columns = [
    { key: 'code', header: 'SKU', render: (item: AdminSKU) => (<div><p className="font-mono text-sm font-medium text-gray-900">{item.code}</p><p className="text-xs text-gray-500">{item.providerSkuCode}</p></div>) },
    { key: 'name', header: 'Nama', render: (item: AdminSKU) => (<div><p className="font-medium text-gray-900">{item.name}</p><p className="text-xs text-gray-500">{item.product.title}</p></div>) },
    { key: 'provider', header: 'Provider', render: (item: AdminSKU) => (<span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">{item.provider.code}</span>) },
    { key: 'price', header: 'Harga Jual', render: (item: AdminSKU) => (<p className="font-medium text-gray-900">{formatCurrency(item.pricing.ID?.sellPrice || 0)}</p>) },
    { key: 'margin', header: 'Margin', render: (item: AdminSKU) => (<p className="text-green-600 font-medium">{item.pricing.ID?.margin || 0}%</p>) },
    { key: 'status', header: 'Status', render: (item: AdminSKU) => (<StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} size="sm" />) },
    { key: 'stock', header: 'Stok', render: (item: AdminSKU) => (<StatusBadge status={item.stock} size="sm" />) },
    {
      key: 'actions',
      header: '',
      render: (item: AdminSKU) => (
        <div className="flex items-center gap-1">
          <button
            className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              setEditingSKU(item);
              setShowForm(true);
            }}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              setEditingSKU(item);
              setShowDeleteDialog(true);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const totalActive = skus.filter((sku) => sku.isActive).length;
  const totalFeatured = skus.filter((sku) => sku.isFeatured).length;
  const totalInactive = skus.length - totalActive;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">SKU</h1><p className="text-gray-500 mt-1">Kelola semua SKU produk</p></div>
        <div className="flex items-center gap-2">
          <button onClick={fetchSKUs} disabled={loading} className={cn('inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50')}><RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />Refresh</button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
            onClick={() => {
              setEditingSKU(null);
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Tambah SKU
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Total SKU" value={pagination?.totalRows?.toLocaleString('id-ID') || '0'} icon={<Layers className="w-5 h-5 text-primary" />} loading={loading} />
        <StatsCard title="SKU Aktif" value={totalActive.toString()} icon={<CheckCircle className="w-5 h-5 text-green-600" />} iconBgColor="bg-green-100" loading={loading} />
        <StatsCard title="Featured" value={totalFeatured.toString()} icon={<TrendingUp className="w-5 h-5 text-blue-600" />} iconBgColor="bg-blue-100" loading={loading} />
        <StatsCard title="Nonaktif" value={totalInactive.toString()} icon={<XCircle className="w-5 h-5 text-red-600" />} iconBgColor="bg-red-100" loading={loading} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari SKU..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" /></div>
      </div>
      <DataTable columns={columns} data={skus} loading={loading} emptyMessage="Tidak ada SKU ditemukan" pagination={pagination ? { page: pagination.page, totalPages: pagination.totalPages, totalRows: pagination.totalRows, limit: pagination.limit, onPageChange: setPage } : undefined} />

      <SKUFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        initialData={editingSKU}
        onSuccess={fetchSKUs}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={async () => {
          if (!editingSKU) return;
          try {
            setDeleteLoading(true);
            await deleteSKU(editingSKU.id);
            setShowDeleteDialog(false);
            fetchSKUs();
          } catch (err: any) {
            setError(err.message || 'Gagal menghapus SKU');
          } finally {
            setDeleteLoading(false);
          }
        }}
        loading={deleteLoading}
        title="Hapus SKU"
        description={`Yakin ingin menghapus SKU ${editingSKU?.code}?`}
        confirmText="Hapus"
        confirmVariant="danger"
      />
    </div>
  );
}

