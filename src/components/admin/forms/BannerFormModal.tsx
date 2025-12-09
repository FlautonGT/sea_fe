'use client';

import React, { useEffect, useState } from 'react';
import { AdminModal } from '@/components/admin/ui';
import { AdminBanner } from '@/types/admin';
import { createBanner, updateBanner, getRegions } from '@/lib/adminApi';
import { AdminRegion } from '@/types/admin';
import { Loader2, Image as ImageIcon, X } from 'lucide-react';

interface BannerFormState {
  title: string;
  description: string;
  href: string;
  regionsInput: string;
  order: string;
  isActive: boolean;
  startAt: string;
  expiredAt: string;
}

const defaultBannerState: BannerFormState = {
  title: '',
  description: '',
  href: '',
  regionsInput: '',
  order: '1',
  isActive: true,
  startAt: '',
  expiredAt: '',
};

const parseCommaValues = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const formatDateForInput = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
};

interface BannerFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: AdminBanner | null;
  onSuccess?: () => void;
}

export default function BannerFormModal({
  open,
  onClose,
  initialData,
  onSuccess,
}: BannerFormModalProps) {
  const [form, setForm] = useState<BannerFormState>(defaultBannerState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [regions, setRegions] = useState<AdminRegion[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          title: initialData.title || '',
          description: initialData.description || '',
          href: initialData.href || '',
          regionsInput: initialData.regions?.join(', ') || '',
          order: String(initialData.order || 1),
          isActive: initialData.isActive,
          startAt: formatDateForInput(initialData.startAt),
          expiredAt: formatDateForInput(initialData.expiredAt),
        });
        setImagePreview(initialData.image || null);
      } else {
        setForm(defaultBannerState);
        setImagePreview(null);
      }
      setImageFile(null);
      setError('');

      // Load regions
      loadRegions();
    }
  }, [open, initialData]);

  const loadRegions = async () => {
    try {
      setLoadingRegions(true);
      const data = await getRegions();
      // Ensure data is always an array
      setRegions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load regions', err);
      setRegions([]); // Set empty array on error
    } finally {
      setLoadingRegions(false);
    }
  };

  const handleChange = (key: keyof BannerFormState, value: string | boolean) => {
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const regionsArray = parseCommaValues(form.regionsInput);

      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('description', form.description.trim());
      formData.append('href', form.href.trim());
      formData.append('order', form.order);
      formData.append('isActive', String(form.isActive));
      
      regionsArray.forEach((region) => {
        formData.append('regions[]', region);
      });

      if (form.startAt) {
        formData.append('startAt', new Date(form.startAt).toISOString());
      }
      if (form.expiredAt) {
        formData.append('expiredAt', new Date(form.expiredAt).toISOString());
      }

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (initialData && imagePreview && !imageFile) {
        // Keep existing image if no new file uploaded
        formData.append('image', initialData.image);
      }

      if (initialData) {
        await updateBanner(initialData.id, formData);
      } else {
        if (!imageFile) {
          throw new Error('Gambar banner wajib diisi');
        }
        await createBanner(formData);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan banner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminModal
      open={open}
      onClose={loading ? () => null : onClose}
      title={initialData ? 'Edit Banner' : 'Tambah Banner'}
      description="Kelola banner yang ditampilkan di halaman utama"
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
            form="banner-form"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      }
    >
      <form id="banner-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-sm text-red-700">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Judul Banner <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Promo Spesial"
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Deskripsi
          </label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Deskripsi banner..."
            rows={2}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
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
          <p className="text-xs text-gray-500 mt-1">URL tujuan saat banner diklik</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Gambar Banner {!initialData && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-2">
            {imagePreview && (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Urutan <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => handleChange('order', e.target.value)}
              placeholder="1"
              required
              min="1"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tanggal Mulai
            </label>
            <input
              type="datetime-local"
              value={form.startAt}
              onChange={(e) => handleChange('startAt', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Tanggal Berakhir
          </label>
          <input
            type="datetime-local"
            value={form.expiredAt}
            onChange={(e) => handleChange('expiredAt', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Regions
          </label>
          <input
            type="text"
            value={form.regionsInput}
            onChange={(e) => handleChange('regionsInput', e.target.value)}
            placeholder="ID, MY, PH, SG, TH"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Pisahkan dengan koma (contoh: ID, MY, PH). Kosongkan untuk semua region.
          </p>
          {loadingRegions ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Memuat regions...
            </div>
          ) : Array.isArray(regions) && regions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {regions.map((region) => (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => {
                    const currentRegions = parseCommaValues(form.regionsInput);
                    if (currentRegions.includes(region.code)) {
                      handleChange(
                        'regionsInput',
                        currentRegions.filter((r) => r !== region.code).join(', ')
                      );
                    } else {
                      handleChange('regionsInput', [...currentRegions, region.code].join(', '));
                    }
                  }}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    parseCommaValues(form.regionsInput).includes(region.code)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {region.code}
                </button>
              ))}
            </div>
          )}
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
            Banner Aktif
          </label>
        </div>
      </form>
    </AdminModal>
  );
}

