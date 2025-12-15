'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable, StatusBadge, StatsCard, ConfirmDialog } from '@/components/admin/ui';
import { ProductFormModal } from '@/components/admin/forms';
import { deleteProduct, getProducts } from '@/lib/adminApi';
import { AdminProduct, Pagination } from '@/types/admin';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Package,
  PackageCheck,
  PackageX,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getProducts({ limit: 10, page, search: search || undefined });
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat produk');
      setProducts([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const columns = [
    {
      key: 'product',
      header: 'Produk',
      render: (item: AdminProduct) => (
        <div className="flex items-center gap-3">
          <img
            src={item.thumbnail || '/placeholder-product.png'}
            alt={item.title}
            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
          />
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">{item.title}</p>
              {item.isPopular && (
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              )}
            </div>
            <p className="text-xs text-gray-500">{item.code} • {item.publisher}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      render: (item: AdminProduct) => (
        <p className="text-gray-700">{item.category.title}</p>
      ),
    },
    {
      key: 'skuCount',
      header: 'SKU',
      render: (item: AdminProduct) => (
        <p className="font-medium text-gray-900">{item.skuCount} SKU</p>
      ),
    },
    {
      key: 'regions',
      header: 'Region',
      render: (item: AdminProduct) => (
        <div className="flex items-center gap-1 flex-wrap">
          {item.regions.slice(0, 3).map((region) => (
            <span
              key={region}
              className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
            >
              {region}
            </span>
          ))}
          {item.regions.length > 3 && (
            <span className="text-xs text-gray-500">+{item.regions.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: AdminProduct) => (
        <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} size="sm" />
      ),
    },
    {
      key: 'stats',
      header: 'Hari Ini',
      render: (item: AdminProduct) => (
        <div>
          <p className="font-medium text-gray-900">{item.stats?.todayTransactions || 0} trx</p>
          <p className="text-xs text-gray-500">
            Rp {((item.stats?.todayRevenue || 0) / 1000000).toFixed(1)}Jt
          </p>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (item: AdminProduct) => (
        <div className="flex items-center gap-1">
          <button
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setEditingProduct(item);
              setShowForm(true);
            }}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setEditingProduct(item);
              setShowDeleteDialog(true);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const totalActive = products.filter((p) => p.isActive).length;
  const totalPopular = products.filter((p) => p.isPopular).length;
  const totalInactive = products.length - totalActive;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produk</h1>
          <p className="text-gray-500 mt-1">Kelola semua produk Seaply</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
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
              setEditingProduct(null);
              setShowForm(true);
            }}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg',
              'text-sm font-medium hover:bg-primary-700 transition-colors'
            )}
          >
            <Plus className="w-4 h-4" />
            Tambah Produk
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
          title="Total Produk"
          value={pagination?.totalRows?.toString() || '0'}
          icon={<Package className="w-5 h-5 text-primary-600" />}
          loading={loading}
        />
        <StatsCard
          title="Produk Aktif"
          value={totalActive.toString()}
          icon={<PackageCheck className="w-5 h-5 text-green-600" />}
          iconBgColor="bg-green-100"
          loading={loading}
        />
        <StatsCard
          title="Produk Populer"
          value={totalPopular.toString()}
          icon={<Star className="w-5 h-5 text-yellow-600" />}
          iconBgColor="bg-yellow-100"
          loading={loading}
        />
        <StatsCard
          title="Nonaktif"
          value={totalInactive.toString()}
          icon={<PackageX className="w-5 h-5 text-red-600" />}
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
              placeholder="Cari produk..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        emptyMessage="Tidak ada produk ditemukan"
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

      <ProductFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        initialData={editingProduct}
        onSuccess={fetchProducts}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={async () => {
          if (!editingProduct) return;
          try {
            setDeleteLoading(true);
            await deleteProduct(editingProduct.id);
            setShowDeleteDialog(false);
            fetchProducts();
          } catch (err: any) {
            setError(err.message || 'Gagal menghapus produk');
          } finally {
            setDeleteLoading(false);
          }
        }}
        loading={deleteLoading}
        title="Hapus Produk"
        description={`Anda yakin ingin menghapus produk ${editingProduct?.title}?`}
        confirmText="Hapus"
        confirmVariant="danger"
      />
    </div>
  );
}

