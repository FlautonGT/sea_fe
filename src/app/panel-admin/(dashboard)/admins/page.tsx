'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable, StatusBadge, StatsCard, ConfirmDialog } from '@/components/admin/ui';
import { AdminFormModal } from '@/components/admin/forms';
import { getAdmins, deleteAdmin } from '@/lib/adminApi';
import { Admin, Pagination } from '@/types/admin';
import { Search, Plus, Eye, Edit, Trash2, RefreshCw, Shield, UserCheck, UserX, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const roleColors: Record<string, string> = { SUPERADMIN: 'bg-red-100 text-red-700', ADMIN: 'bg-blue-100 text-blue-700', FINANCE: 'bg-green-100 text-green-700', CS_LEAD: 'bg-purple-100 text-purple-700', CS: 'bg-gray-100 text-gray-700' };

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdmins({ limit: 10, page, search: search || undefined });
      setAdmins(data.admins);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat admin');
      setAdmins([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const columns = [
    { key: 'admin', header: 'Admin', render: (item: Admin) => (<div className="flex items-center gap-3"><div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><span className="text-sm font-medium text-primary">{item.name.split(' ').map(n => n[0]).join('')}</span></div><div><p className="font-medium text-gray-900">{item.name}</p><p className="text-xs text-gray-500">{item.email}</p></div></div>) },
    { key: 'role', header: 'Role', render: (item: Admin) => (<span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', roleColors[item.role.code])}>{item.role.name}</span>) },
    { key: 'mfa', header: 'MFA', render: (item: Admin) => (item.mfaEnabled ? <span className="text-green-600 text-sm">✓ Aktif</span> : <span className="text-gray-400 text-sm">-</span>) },
    { key: 'status', header: 'Status', render: (item: Admin) => (<StatusBadge status={item.status} size="sm" />) },
    { key: 'lastLogin', header: 'Login Terakhir', render: (item: Admin) => (<p className="text-sm text-gray-500">{item.lastLoginAt ? format(new Date(item.lastLoginAt), 'dd MMM yyyy, HH:mm', { locale: id }) : '-'}</p>) },
    {
      key: 'actions',
      header: '',
      render: (item: Admin) => (
        <div className="flex items-center gap-1">
          <button
            className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Navigate to detail page
            }}
            title="Detail"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              setEditingAdmin(item);
              setShowForm(true);
            }}
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              setEditingAdmin(item);
              setShowDeleteDialog(true);
            }}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Admin</h1><p className="text-gray-500 mt-1">Kelola akun admin</p></div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAdmins} disabled={loading} className={cn('inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50')}><RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />Refresh</button>
          <button
            onClick={() => {
              setEditingAdmin(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Tambah Admin
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Total Admin" value={pagination?.totalRows?.toString() || '0'} icon={<Shield className="w-5 h-5 text-primary" />} loading={loading} />
        <StatsCard title="Superadmin" value="2" icon={<Crown className="w-5 h-5 text-red-600" />} iconBgColor="bg-red-100" loading={loading} />
        <StatsCard title="Admin Aktif" value="20" icon={<UserCheck className="w-5 h-5 text-green-600" />} iconBgColor="bg-green-100" loading={loading} />
        <StatsCard title="Ditangguhkan" value="2" icon={<UserX className="w-5 h-5 text-gray-600" />} iconBgColor="bg-gray-100" loading={loading} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau email..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" /></div>
      </div>
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-sm text-red-700">{error}</div>
      )}

      <DataTable columns={columns} data={admins} loading={loading} emptyMessage="Tidak ada admin ditemukan" pagination={pagination ? { page: pagination.page, totalPages: pagination.totalPages, totalRows: pagination.totalRows, limit: pagination.limit, onPageChange: setPage } : undefined} />

      <AdminFormModal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingAdmin(null);
        }}
        initialData={editingAdmin}
        onSuccess={() => {
          setShowForm(false);
          setEditingAdmin(null);
          fetchAdmins();
        }}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onCancel={() => {
          setShowDeleteDialog(false);
          setEditingAdmin(null);
        }}
        onConfirm={async () => {
          if (!editingAdmin) return;
          try {
            setDeleteLoading(true);
            await deleteAdmin(editingAdmin.id);
            setShowDeleteDialog(false);
            setEditingAdmin(null);
            fetchAdmins();
          } catch (err: any) {
            setError(err.message || 'Gagal menghapus admin');
          } finally {
            setDeleteLoading(false);
          }
        }}
        loading={deleteLoading}
        title="Hapus Admin"
        description={`Yakin ingin menghapus admin "${editingAdmin?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        confirmVariant="danger"
      />
    </div>
  );
}

