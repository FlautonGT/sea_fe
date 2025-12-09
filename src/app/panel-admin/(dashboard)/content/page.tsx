'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StatusBadge, StatsCard, ConfirmDialog } from '@/components/admin/ui';
import { BannerFormModal, PopupFormModal } from '@/components/admin/forms';
import { getBanners, deleteBanner, getPopups, updatePopup } from '@/lib/adminApi';
import { AdminBanner, AdminPopup } from '@/types/admin';
import { Plus, Edit, Trash2, RefreshCw, Image as ImageIcon, CheckCircle, XCircle, Eye, Loader2, Power } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function ContentPage() {
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [popups, setPopups] = useState<AdminPopup[]>([]);
  const [loading, setLoading] = useState(true);
  const [popupLoading, setPopupLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'banners' | 'popups'>('banners');
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdminBanner | null>(null);
  const [editingPopup, setEditingPopup] = useState<AdminPopup | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getBanners();
      setBanners(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat banner');
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPopups = useCallback(async () => {
    try {
      setPopupLoading(true);
      setError('');
      const data = await getPopups();
      setPopups(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat popup');
      setPopups([]);
    } finally {
      setPopupLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
    fetchPopups();
  }, [fetchBanners, fetchPopups]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Konten</h1><p className="text-gray-500 mt-1">Kelola banner dan popup</p></div>
        {activeTab === 'banners' && (
          <div className="flex items-center gap-2">
            <button
              onClick={fetchBanners}
              disabled={loading}
              className={cn('inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50')}
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              Refresh
            </button>
            <button
              onClick={() => {
                setEditingBanner(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              Tambah Banner
            </button>
          </div>
        )}
        {activeTab === 'popups' && (
          <div className="flex items-center gap-2">
            <button
              onClick={fetchPopups}
              disabled={popupLoading}
              className={cn('inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50')}
            >
              <RefreshCw className={cn('w-4 h-4', popupLoading && 'animate-spin')} />
              Refresh
            </button>
            <button
              onClick={() => {
                setEditingPopup(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              Tambah Popup
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-sm text-red-700">{error}</div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Total Banner" value={((Array.isArray(banners) ? banners : []).length).toString()} icon={<ImageIcon className="w-5 h-5 text-primary" />} loading={loading} />
        <StatsCard title="Banner Aktif" value={((Array.isArray(banners) ? banners : []).filter(b => b?.isActive).length).toString()} icon={<CheckCircle className="w-5 h-5 text-green-600" />} iconBgColor="bg-green-100" loading={loading} />
        <StatsCard title="Total Popup" value={((Array.isArray(popups) ? popups : []).length).toString()} icon={<Eye className="w-5 h-5 text-purple-600" />} iconBgColor="bg-purple-100" loading={popupLoading} />
        <StatsCard title="Popup Aktif" value={((Array.isArray(popups) ? popups : []).filter(p => p?.isActive).length).toString()} icon={<CheckCircle className="w-5 h-5 text-green-600" />} iconBgColor="bg-green-100" loading={popupLoading} />
      </div>
      <div className="flex gap-4 border-b border-gray-200">
        <button onClick={() => setActiveTab('banners')} className={cn('px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors', activeTab === 'banners' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700')}>Banner</button>
        <button onClick={() => setActiveTab('popups')} className={cn('px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors', activeTab === 'popups' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700')}>Popup</button>
      </div>
      {activeTab === 'banners' && (
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => (<div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"><div className="h-40 bg-gray-200"></div><div className="p-4"><div className="h-5 bg-gray-200 rounded w-32 mb-2"></div><div className="h-4 bg-gray-200 rounded w-full"></div></div></div>))}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Array.isArray(banners) ? banners : []).map((banner) => (
              <div key={banner.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-[16/9] bg-gray-100"><img src={banner.image} alt={banner.title} className="w-full h-full object-cover" /><div className="absolute top-2 right-2"><StatusBadge status={banner.isActive ? 'ACTIVE' : 'INACTIVE'} size="sm" /></div></div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{banner.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{banner.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Order: {banner.order}</span>
                    {banner.expiredAt && <span>Exp: {format(new Date(banner.expiredAt), 'dd MMM yyyy', { locale: id })}</span>}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">{(Array.isArray(banner.regions) ? banner.regions : []).map(r => (<span key={r} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">{r}</span>))}</div>
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setEditingBanner(banner);
                        setShowForm(true);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setEditingBanner(banner);
                        setShowDeleteDialog(true);
                      }}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
      {activeTab === 'popups' && (
        popupLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : !Array.isArray(popups) || popups.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Popup</h3>
            <p className="text-gray-500 mb-4">Tambahkan popup untuk ditampilkan kepada pengguna</p>
            <button
              onClick={() => {
                setEditingPopup(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              Tambah Popup
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Array.isArray(popups) ? popups : []).map((popup) => (
              <div key={popup.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-[16/9] bg-gray-100">
                  {popup.image ? (
                    <img src={popup.image} alt={popup.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={popup.isActive ? 'ACTIVE' : 'INACTIVE'} size="sm" />
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium">
                      {popup.region}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{popup.title || 'Tidak ada judul'}</h3>
                  {popup.content && (
                    <p
                      className="text-sm text-gray-500 mb-3 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: popup.content }}
                    />
                  )}
                  {popup.href && (
                    <p className="text-xs text-gray-400 mb-3 truncate">Link: {popup.href}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Created: {format(new Date(popup.createdAt), 'dd MMM yyyy', { locale: id })}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setEditingPopup(popup);
                        setShowForm(true);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const formData = new FormData();
                          formData.append('title', popup.title);
                          formData.append('content', popup.content);
                          formData.append('isActive', String(!popup.isActive));
                          if (popup.image) {
                            formData.append('image', popup.image);
                          }
                          await updatePopup(popup.region, formData);
                          fetchPopups();
                        } catch (err: any) {
                          setError(err.message || 'Gagal mengubah status popup');
                        }
                      }}
                      className={cn(
                        'p-2 rounded-lg border transition-colors',
                        popup.isActive
                          ? 'border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                          : 'border-gray-200 hover:bg-green-50 hover:border-green-200 hover:text-green-600'
                      )}
                      title={popup.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      <BannerFormModal
        open={showForm && activeTab === 'banners'}
        onClose={() => {
          setShowForm(false);
          setEditingBanner(null);
        }}
        initialData={editingBanner}
        onSuccess={() => {
          setShowForm(false);
          setEditingBanner(null);
          fetchBanners();
        }}
      />

      <PopupFormModal
        open={showForm && activeTab === 'popups'}
        onClose={() => {
          setShowForm(false);
          setEditingPopup(null);
        }}
        initialData={editingPopup}
        onSuccess={() => {
          setShowForm(false);
          setEditingPopup(null);
          fetchPopups();
        }}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onCancel={() => {
          setShowDeleteDialog(false);
          setEditingBanner(null);
        }}
        onConfirm={async () => {
          if (!editingBanner) return;
          try {
            setDeleteLoading(true);
            await deleteBanner(editingBanner.id);
            setShowDeleteDialog(false);
            setEditingBanner(null);
            fetchBanners();
          } catch (err: any) {
            setError(err.message || 'Gagal menghapus banner');
          } finally {
            setDeleteLoading(false);
          }
        }}
        loading={deleteLoading}
        title="Hapus Banner"
        description={`Yakin ingin menghapus banner "${editingBanner?.title}"?`}
        confirmText="Hapus"
        confirmVariant="danger"
      />
    </div>
  );
}

