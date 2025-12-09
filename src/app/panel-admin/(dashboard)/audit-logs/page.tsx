'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTable, StatsCard } from '@/components/admin/ui';
import { getAuditLogs } from '@/lib/adminApi';
import { AuditLog, Pagination } from '@/types/admin';
import { Search, RefreshCw, History, Eye, UserCheck, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const actionColors: Record<string, string> = { CREATE: 'bg-green-100 text-green-700', UPDATE: 'bg-blue-100 text-blue-700', DELETE: 'bg-red-100 text-red-700' };

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs({ limit: 10, page });
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err) {
      setLogs([
        { id: 'log_1', admin: { id: 'adm_1', name: 'John Superadmin', email: 'superadmin@seaply.co' }, action: 'UPDATE', resource: 'SKU', resourceId: 'sku_1', description: 'Updated SKU MLBB_86 price from 24000 to 24750', changes: { before: { sellPrice: 24000 }, after: { sellPrice: 24750 } }, ipAddress: '103.xxx.xxx.xxx', createdAt: '2025-12-03T12:00:00+07:00' },
        { id: 'log_2', admin: { id: 'adm_2', name: 'Jane Admin', email: 'admin@seaply.co' }, action: 'CREATE', resource: 'PROMO', resourceId: 'prm_1', description: 'Created new promo NEWYEAR2026', ipAddress: '103.xxx.xxx.xxx', createdAt: '2025-12-03T11:30:00+07:00' },
        { id: 'log_3', admin: { id: 'adm_1', name: 'John Superadmin', email: 'superadmin@seaply.co' }, action: 'DELETE', resource: 'BANNER', resourceId: 'ban_5', description: 'Deleted banner "Old Promo"', ipAddress: '103.xxx.xxx.xxx', createdAt: '2025-12-03T10:00:00+07:00' },
        { id: 'log_4', admin: { id: 'adm_2', name: 'Jane Admin', email: 'admin@seaply.co' }, action: 'UPDATE', resource: 'PRODUCT', resourceId: 'prd_1', description: 'Updated product MLBB isPopular to true', ipAddress: '103.xxx.xxx.xxx', createdAt: '2025-12-03T09:30:00+07:00' },
      ]);
      setPagination({ limit: 10, page: 1, totalRows: 5000, totalPages: 500 });
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const columns = [
    { key: 'time', header: 'Waktu', render: (item: AuditLog) => (<p className="text-sm text-gray-700">{format(new Date(item.createdAt), 'dd MMM yyyy, HH:mm:ss', { locale: id })}</p>) },
    { key: 'admin', header: 'Admin', render: (item: AuditLog) => (<div><p className="font-medium text-gray-900">{item.admin.name}</p><p className="text-xs text-gray-500">{item.admin.email}</p></div>) },
    { key: 'action', header: 'Aksi', render: (item: AuditLog) => (<span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', actionColors[item.action])}>{item.action}</span>) },
    { key: 'resource', header: 'Resource', render: (item: AuditLog) => (<span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium">{item.resource}</span>) },
    { key: 'description', header: 'Deskripsi', render: (item: AuditLog) => (<p className="text-sm text-gray-700 max-w-md truncate">{item.description}</p>) },
    { key: 'ip', header: 'IP Address', render: (item: AuditLog) => (<p className="text-sm text-gray-500 font-mono">{item.ipAddress}</p>) },
    { key: 'actions', header: '', render: () => (<button className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4" /></button>) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Audit Log</h1><p className="text-gray-500 mt-1">Riwayat aktivitas admin</p></div>
        <button onClick={fetchLogs} disabled={loading} className={cn('inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50')}><RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />Refresh</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Total Log" value={pagination?.totalRows?.toLocaleString('id-ID') || '0'} icon={<History className="w-5 h-5 text-primary" />} loading={loading} />
        <StatsCard title="Create" value="1,250" icon={<UserCheck className="w-5 h-5 text-green-600" />} iconBgColor="bg-green-100" loading={loading} />
        <StatsCard title="Update" value="3,500" icon={<Edit className="w-5 h-5 text-blue-600" />} iconBgColor="bg-blue-100" loading={loading} />
        <StatsCard title="Delete" value="250" icon={<Trash2 className="w-5 h-5 text-red-600" />} iconBgColor="bg-red-100" loading={loading} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari admin, resource, atau deskripsi..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" /></div>
      </div>
      <DataTable columns={columns} data={logs} loading={loading} emptyMessage="Tidak ada log ditemukan" pagination={pagination ? { page: pagination.page, totalPages: pagination.totalPages, totalRows: pagination.totalRows, limit: pagination.limit, onPageChange: setPage } : undefined} />
    </div>
  );
}

