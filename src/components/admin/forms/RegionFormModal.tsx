'use client';

import React, { useEffect, useState } from 'react';
import { AdminModal } from '@/components/admin/ui';
import { AdminRegion } from '@/types/admin';
import { createRegion, updateRegion } from '@/lib/adminApi';
import { Image as ImageIcon, X } from 'lucide-react';

interface RegionFormState {
  code: string;
  country: string;
  currency: string;
  currencySymbol: string;
  order: string;
  isDefault: boolean;
  isActive: boolean;
}

const defaultRegionState: RegionFormState = {
  code: '',
  country: '',
  currency: '',
  currencySymbol: '',
  order: '1',
  isDefault: false,
  isActive: true,
};

interface RegionFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: AdminRegion | null;
  onSuccess?: () => void;
}

export default function RegionFormModal({
  open,
  onClose,
  initialData,
  onSuccess,
}: RegionFormModalProps) {
  const [form, setForm] = useState<RegionFormState>(defaultRegionState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          code: initialData.code || '',
          country: initialData.country || '',
          currency: initialData.currency || '',
          currencySymbol: initialData.currencySymbol || '',
          order: String(initialData.sortOrder || 1),
          isDefault: initialData.isDefault || false,
          isActive: initialData.isActive,
        });
        setImagePreview(initialData.image || null);
      } else {
        setForm(defaultRegionState);
        setImagePreview(null);
      }
      setImageFile(null);
      setError('');
    }
  }, [open, initialData]);

  const handleChange = (key: keyof RegionFormState, value: string | boolean) => {
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
      if (!initialData && !imageFile) {
        throw new Error('Gambar flag region wajib diisi');
      }

      const formData = new FormData();
      formData.append('code', form.code.trim().toUpperCase());
      formData.append('country', form.country.trim());
      formData.append('currency', form.currency.trim().toUpperCase());
      formData.append('currencySymbol', form.currencySymbol.trim());
      formData.append('order', form.order);
      formData.append('isDefault', String(form.isDefault));
      formData.append('isActive', String(form.isActive));

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (initialData && imagePreview && !imageFile && initialData.image) {
        // Keep existing image
        formData.append('image', initialData.image);
      }

      if (initialData) {
        await updateRegion(initialData.id, formData);
      } else {
        await createRegion(formData);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan region');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminModal
      open={open}
      onClose={loading ? () => null : onClose}
      title={initialData ? 'Edit Region' : 'Tambah Region'}
      description="Kelola region dan mata uang"
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
            form="region-form"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      }
    >
      <form id="region-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-sm text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Kode Region <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
              placeholder="ID"
              required
              maxLength={2}
              disabled={!!initialData}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Kode 2 huruf (contoh: ID, MY, SG)</p>
          </div>

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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nama Negara <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.country}
            onChange={(e) => handleChange('country', e.target.value)}
            placeholder="Indonesia"
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Kode Mata Uang <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.currency}
              onChange={(e) => handleChange('currency', e.target.value.toUpperCase())}
              placeholder="IDR"
              required
              maxLength={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Simbol Mata Uang <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.currencySymbol}
              onChange={(e) => handleChange('currencySymbol', e.target.value)}
              placeholder="Rp"
              required
              maxLength={5}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Gambar Flag {!initialData && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-2">
            {imagePreview && (
              <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={imagePreview}
                  alt="Flag Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded hover:bg-black/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-2 pb-3">
                <ImageIcon className="w-6 h-6 mb-1 text-gray-400" />
                <p className="mb-1 text-xs text-gray-500">
                  <span className="font-semibold">Klik untuk upload</span>
                </p>
                <p className="text-xs text-gray-500">SVG, PNG, JPG</p>
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

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={form.isDefault}
              onChange={(e) => handleChange('isDefault', e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
              Set sebagai Region Default
            </label>
          </div>
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
            Region Aktif
          </label>
        </div>
      </form>
    </AdminModal>
  );
}

