'use client';

import React, { useState, useEffect } from 'react';
import { StatusBadge, StatsCard, ConfirmDialog } from '@/components/admin/ui';
import { getPaymentChannels, deletePaymentChannel } from '@/lib/adminApi';
import { AdminPaymentChannel } from '@/types/admin';
import { Plus, Edit, RefreshCw, Receipt, CheckCircle, Star, Settings, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import PaymentChannelFormModal from '@/components/admin/forms/PaymentChannelFormModal';

export default function PaymentChannelsPage() {
  const [channels, setChannels] = useState<AdminPaymentChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<AdminPaymentChannel | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<AdminPaymentChannel | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const data = await getPaymentChannels();
      setChannels(data);
    } catch (err) {
      console.error('Failed to fetch payment channels:', err);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleCreate = () => {
    setSelectedChannel(null);
    setFormModalOpen(true);
  };

  const handleEdit = (channel: AdminPaymentChannel) => {
    setSelectedChannel(channel);
    setFormModalOpen(true);
  };

  const handleDeleteClick = (channel: AdminPaymentChannel) => {
    setChannelToDelete(channel);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!channelToDelete) return;

    try {
      setDeleting(true);
      await deletePaymentChannel(channelToDelete.id);
      await fetchChannels();
      setDeleteDialogOpen(false);
      setChannelToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete payment channel:', err);
      alert(err?.message || 'Gagal menghapus payment channel');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-2xl font-bold text-gray-900">Payment Channel</h1><p className="text-gray-500 mt-1">Kelola metode pembayaran</p></div>
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchChannels}
              className={cn('inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50')}
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              Refresh
            </button>
            <button 
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              Tambah Channel
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatsCard title="Total Channel" value={channels.length.toString()} icon={<Receipt className="w-5 h-5 text-primary" />} loading={loading} />
          <StatsCard title="Aktif" value={channels.filter(c => c.isActive).length.toString()} icon={<CheckCircle className="w-5 h-5 text-green-600" />} iconBgColor="bg-green-100" loading={loading} />
          <StatsCard title="Featured" value={channels.filter(c => c.isFeatured).length.toString()} icon={<Star className="w-5 h-5 text-yellow-600" />} iconBgColor="bg-yellow-100" loading={loading} />
          <StatsCard title="Support Deposit" value={channels.filter(c => c.supportedTypes.includes('deposit')).length.toString()} icon={<Settings className="w-5 h-5 text-purple-600" />} iconBgColor="bg-purple-100" loading={loading} />
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((channel) => (
              <div key={channel.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={channel.image} alt={channel.name} className="w-12 h-12 rounded-lg object-contain bg-gray-50" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{channel.name}</h3>
                        {channel.isFeatured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                      </div>
                      <p className="text-xs text-gray-500">{channel.code}</p>
                    </div>
                  </div>
                  <StatusBadge status={channel.isActive ? 'ACTIVE' : 'INACTIVE'} size="sm" />
                </div>
                <p className="text-sm text-gray-500 mb-4">{channel.description}</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Fee</p>
                    <p className="font-medium text-gray-900">
                      {channel.fee.feeType === 'PERCENTAGE' 
                        ? `${channel.fee.feePercentage}%` 
                        : `Rp ${channel.fee.feeAmount.toLocaleString('id-ID')}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Kategori</p>
                    <p className="font-medium text-gray-900">{channel.category?.title || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Tipe</p>
                    <div className="flex gap-1">
                      {channel.supportedTypes.map(t => (
                        <span key={t} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded capitalize">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => handleEdit(channel)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(channel)}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-300 text-red-600"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PaymentChannelFormModal
        open={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedChannel(null);
        }}
        initialData={selectedChannel}
        onSuccess={() => {
          fetchChannels();
          setFormModalOpen(false);
          setSelectedChannel(null);
        }}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setChannelToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Hapus Payment Channel"
        description={channelToDelete ? `Apakah Anda yakin ingin menghapus payment channel "${channelToDelete.name}"? Tindakan ini tidak dapat dibatalkan.` : ''}
        confirmText="Hapus"
        cancelText="Batal"
        confirmVariant="danger"
        loading={deleting}
      />
    </>
  );
}

