'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StatusBadge, StatsCard, ConfirmDialog } from '@/components/admin/ui';
import { CategoryFormModal } from '@/components/admin/forms';
import { getCategories, deleteCategory } from '@/lib/adminApi';
import { AdminCategory } from '@/types/admin';
import { Search, Plus, Edit, Trash2, RefreshCw, FolderTree, CheckCircle, XCircle, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat kategori');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Kategori</h1><p className="text-gray-500 mt-1">Kelola kategori produk</p></div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCategories}
            disabled={loading}
            className={cn('inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50')}
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Refresh
          </button>
          <button
            onClick={() => {
              setEditingCategory(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Tambah Kategori
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-sm text-red-700">{error}</div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Total Kategori" value={categories.length.toString()} icon={<FolderTree className="w-5 h-5 text-primary" />} loading={loading} />
        <StatsCard title="Aktif" value={categories.filter(c => c.isActive).length.toString()} icon={<CheckCircle className="w-5 h-5 text-green-600" />} iconBgColor="bg-green-100" loading={loading} />
        <StatsCard title="Total Produk" value={categories.reduce((sum, c) => sum + c.productCount, 0).toString()} icon={<Package className="w-5 h-5 text-blue-600" />} iconBgColor="bg-blue-100" loading={loading} />
        <StatsCard title="Nonaktif" value={categories.filter(c => !c.isActive).length.toString()} icon={<XCircle className="w-5 h-5 text-red-600" />} iconBgColor="bg-red-100" loading={loading} />
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => (<div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"><div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div><div className="h-6 bg-gray-200 rounded w-32 mb-2"></div><div className="h-4 bg-gray-200 rounded w-full"></div></div>))}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl">{category.icon}</div>
                  <div><h3 className="font-semibold text-gray-900">{category.title}</h3><p className="text-xs text-gray-500">{category.code}</p></div>
                </div>
                <StatusBadge status={category.isActive ? 'ACTIVE' : 'INACTIVE'} size="sm" />
              </div>
              <p className="text-sm text-gray-500 mb-4">{category.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm"><span className="text-gray-500">Produk: </span><span className="font-medium text-gray-900">{category.productCount}</span></div>
                <div className="flex flex-wrap gap-1">{category.regions.slice(0, 3).map(r => (<span key={r} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">{r}</span>))}{category.regions.length > 3 && <span className="text-xs text-gray-500">+{category.regions.length - 3}</span>}</div>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setEditingCategory(category);
                    setShowForm(true);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setEditingCategory(category);
                    setShowDeleteDialog(true);
                  }}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryFormModal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingCategory(null);
        }}
        initialData={editingCategory}
        onSuccess={() => {
          setShowForm(false);
          setEditingCategory(null);
          fetchCategories();
        }}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onCancel={() => {
          setShowDeleteDialog(false);
          setEditingCategory(null);
        }}
        onConfirm={async () => {
          if (!editingCategory) return;
          try {
            setDeleteLoading(true);
            await deleteCategory(editingCategory.id);
            setShowDeleteDialog(false);
            setEditingCategory(null);
            fetchCategories();
          } catch (err: any) {
            setError(err.message || 'Gagal menghapus kategori');
          } finally {
            setDeleteLoading(false);
          }
        }}
        loading={deleteLoading}
        title="Hapus Kategori"
        description={`Yakin ingin menghapus kategori "${editingCategory?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        confirmVariant="danger"
      />
    </div>
  );
}

