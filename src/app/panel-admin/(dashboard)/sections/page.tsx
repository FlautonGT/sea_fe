'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable, StatusBadge, StatsCard, ConfirmDialog } from '@/components/admin/ui';
import { getSections, deleteSection, updateSectionProducts } from '@/lib/adminApi';
import { AdminSection, Pagination } from '@/types/admin';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Layers,
  CheckCircle,
  XCircle,
  Package,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionFormModal } from '@/components/admin/forms';

export default function SectionsPage() {
  const [sections, setSections] = useState<AdminSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState<AdminSection | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assigningSection, setAssigningSection] = useState<AdminSection | null>(null);

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getSections({ productCode: productFilter || undefined });
      // Ensure data is always an array
      setSections(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat sections');
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, [productFilter]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleDelete = async (section: AdminSection) => {
    setEditingSection(section);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!editingSection) return;
    try {
      setDeleteLoading(true);
      await deleteSection(editingSection.id);
      setShowDeleteDialog(false);
      setEditingSection(null);
      fetchSections();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus section');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredSections = (Array.isArray(sections) ? sections : []).filter((section) => {
    if (search) {
      return (
        section.code.toLowerCase().includes(search.toLowerCase()) ||
        section.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  const columns = [
    {
      key: 'code',
      header: 'Kode',
      render: (item: AdminSection) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-xl">
            {item.icon}
          </div>
          <div>
            <p className="font-mono font-semibold text-gray-900">{item.code}</p>
            <p className="text-sm text-gray-500">{item.title}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'products',
      header: 'Produk',
      render: (item: AdminSection) => (
        <div className="flex items-center gap-1 flex-wrap">
          {item.products.length === 0 ? (
            <span className="text-xs text-gray-400">Tidak ada produk</span>
          ) : (
            <>
              {item.products.slice(0, 3).map((product) => (
                <span
                  key={product}
                  className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                >
                  {product}
                </span>
              ))}
              {item.products.length > 3 && (
                <span className="text-xs text-gray-500">+{item.products.length - 3}</span>
              )}
            </>
          )}
        </div>
      ),
    },
    {
      key: 'skuCount',
      header: 'SKU',
      render: (item: AdminSection) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900">{item.skuCount}</span>
        </div>
      ),
    },
    {
      key: 'order',
      header: 'Order',
      render: (item: AdminSection) => (
        <span className="font-medium text-gray-900">{item.order}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: AdminSection) => (
        <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} size="sm" />
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (item: AdminSection) => (
        <div className="flex items-center gap-1">
          <button
            className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              setEditingSection(item);
              setShowForm(true);
            }}
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              setAssigningSection(item);
              setShowAssignDialog(true);
            }}
            title="Assign Products"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item);
            }}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const totalActive = (Array.isArray(sections) ? sections : []).filter((s) => s.isActive).length;
  const totalSKUs = (Array.isArray(sections) ? sections : []).reduce((sum, s) => sum + s.skuCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sections</h1>
          <p className="text-gray-500 mt-1">Kelola section untuk mengelompokkan SKU dalam produk</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSections}
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
              setEditingSection(null);
              setShowForm(true);
            }}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg',
              'text-sm font-medium hover:bg-primary/90 transition-colors'
            )}
          >
            <Plus className="w-4 h-4" />
            Tambah Section
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-sm text-red-700">{error}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard
          title="Total Sections"
          value={sections.length.toString()}
          icon={<Layers className="w-5 h-5 text-primary" />}
          loading={loading}
        />
        <StatsCard
          title="Sections Aktif"
          value={totalActive.toString()}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          iconBgColor="bg-green-100"
          loading={loading}
        />
        <StatsCard
          title="Total SKU"
          value={totalSKUs.toString()}
          icon={<Package className="w-5 h-5 text-blue-600" />}
          iconBgColor="bg-blue-100"
          loading={loading}
        />
        <StatsCard
          title="Sections Nonaktif"
          value={(sections.length - totalActive).toString()}
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
              placeholder="Cari kode atau nama section..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="w-full sm:w-64">
            <input
              type="text"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              placeholder="Filter by Product Code..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredSections}
          loading={loading}
          emptyMessage="Tidak ada section ditemukan"
        />
      )}

      {/* Form Modal */}
      <SectionFormModal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingSection(null);
        }}
        initialData={editingSection}
        onSuccess={() => {
          setShowForm(false);
          setEditingSection(null);
          fetchSections();
        }}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onCancel={() => {
          setShowDeleteDialog(false);
          setEditingSection(null);
        }}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Hapus Section"
        description={`Yakin ingin menghapus section "${editingSection?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        confirmVariant="danger"
      />

      {/* Assign Products Dialog - Placeholder for now */}
      {showAssignDialog && assigningSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAssignDialog(false)} />
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Assign Products</h3>
              <p className="text-sm text-gray-500 mt-1">Assign products to section: {assigningSection.title}</p>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-500">Feature coming soon...</p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAssignDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

