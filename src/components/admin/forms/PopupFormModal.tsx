'use client';

import React, { useEffect, useState } from 'react';
import { AdminModal } from '@/components/admin/ui';
import { AdminPopup } from '@/types/admin';
import { createPopup, updatePopup, getRegions, getPopups } from '@/lib/adminApi';
import { AdminRegion } from '@/types/admin';
import { Loader2, Image as ImageIcon, X } from 'lucide-react';

interface PopupFormState {
  region: string;
  title: string;
  content: string;
  href: string;
  isActive: boolean;
}

const defaultPopupState: PopupFormState = {
  region: '',
  title: '',
  content: '',
  href: '',
  isActive: true,
};

interface PopupFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: AdminPopup | null;
  onSuccess?: () => void;
}

export default function PopupFormModal({
  open,
  onClose,
  initialData,
  onSuccess,
}: PopupFormModalProps) {
  const [form, setForm] = useState<PopupFormState>(defaultPopupState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [regions, setRegions] = useState<AdminRegion[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [existingPopups, setExistingPopups] = useState<AdminPopup[]>([]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          region: initialData.region || '',
          title: initialData.title || '',
          content: initialData.content || '',
          href: initialData.href || '',
          isActive: initialData.isActive,
        });
        setImagePreview(initialData.image || null);
      } else {
        setForm(defaultPopupState);
        setImagePreview(null);
      }
      setImageFile(null);
      setError('');

      // Load regions and existing popups
      loadRegions();
      loadExistingPopups();
    }
  }, [open, initialData]);

  const loadRegions = async () => {
    try {
      setLoadingRegions(true);
      const data = await getRegions();
      setRegions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load regions', err);
      setRegions([]);
    } finally {
      setLoadingRegions(false);
    }
  };

  const loadExistingPopups = async () => {
    try {
      const data = await getPopups();
      setExistingPopups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load existing popups', err);
      setExistingPopups([]);
    }
  };

  const handleChange = (key: keyof PopupFormState, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Get available regions (filter out regions that already have popups when creating new)
  const getAvailableRegions = () => {
    if (initialData) {
      // When editing, show all regions but disable region selection
      return regions;
    }
    // When creating, filter out regions that already have popups
    const existingRegionCodes = new Set(existingPopups.map(p => p.region));
    return regions.filter(r => !existingRegionCodes.has(r.code));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!form.region) {
        throw new Error('Region wajib dipilih');
      }
      if (!form.title.trim()) {
        throw new Error('Judul popup wajib diisi');
      }

      const formData = new FormData();
      formData.append('region', form.region);
      formData.append('title', form.title.trim());
      formData.append('content', form.content.trim());
      formData.append('href', form.href.trim());
      formData.append('isActive', String(form.isActive));

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (initialData && imagePreview && !imageFile) {
        // Keep existing image if no new file uploaded
        formData.append('image', initialData.image);
      }

      if (initialData) {
        await updatePopup(initialData.region, formData);
      } else {
        if (!imageFile) {
          throw new Error('Gambar popup wajib diisi');
        }
        await createPopup(formData);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan popup');
    } finally {
      setLoading(false);
    }
  };

  const availableRegions = getAvailableRegions();

  return (
    <AdminModal
      open={open}
      onClose={loading ? () => null : onClose}
      title={initialData ? 'Edit Popup' : 'Tambah Popup'}
      description="Kelola popup yang ditampilkan saat pengguna pertama kali mengunjungi website"
      maxWidthClass="max-w-2xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Batal
          </button>
          <button
            type="submit"
            form="popup-form"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      }
    >
      <form id="popup-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-sm text-red-700">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Region <span className="text-red-500">*</span>
          </label>
          {loadingRegions ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Memuat regions...
            </div>
          ) : (
            <>
              <select
                value={form.region}
                onChange={(e) => handleChange('region', e.target.value)}
                required
                disabled={!!initialData}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Pilih Region</option>
                {Array.isArray(availableRegions) && availableRegions.map((region) => (
                  <option key={region.id} value={region.code}>
                    {region.country} ({region.code})
                  </option>
                ))}
              </select>
              {!initialData && availableRegions.length === 0 && (
                <p className="text-xs text-yellow-600 mt-1">
                  Semua region sudah memiliki popup. Silakan edit popup yang sudah ada.
                </p>
              )}
              {initialData && (
                <p className="text-xs text-gray-500 mt-1">
                  Region tidak dapat diubah setelah popup dibuat
                </p>
              )}
            </>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Judul Popup <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="🔥 PROMO SPESIAL! 🔥"
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Konten Popup
          </label>
          <textarea
            value={form.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="<p>Diskon hingga 50%!</p>"
            rows={4}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            HTML content untuk popup body
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Gambar Popup {!initialData && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-2">
            {imagePreview && (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => setImagePreview(null)}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Link URL
          </label>
          <input
            type="text"
            value={form.href}
            onChange={(e) => handleChange('href', e.target.value)}
            placeholder="/id-id/promo"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            URL tujuan saat popup diklik (opsional)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={form.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Popup Aktif
          </label>
        </div>
      </form>
    </AdminModal>
  );
}
