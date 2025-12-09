'use client';

import React, { useEffect, useState } from 'react';
import { AdminModal } from '@/components/admin/ui';
import { AdminLanguage } from '@/types/admin';
import { createLanguage, updateLanguage } from '@/lib/adminApi';
import { Image as ImageIcon, X } from 'lucide-react';

interface LanguageFormState {
  code: string;
  name: string;
  country: string;
  order: string;
  isDefault: boolean;
  isActive: boolean;
}

const defaultLanguageState: LanguageFormState = {
  code: '',
  name: '',
  country: '',
  order: '1',
  isDefault: false,
  isActive: true,
};

interface LanguageFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: AdminLanguage | null;
  onSuccess?: () => void;
}

export default function LanguageFormModal({
  open,
  onClose,
  initialData,
  onSuccess,
}: LanguageFormModalProps) {
  const [form, setForm] = useState<LanguageFormState>(defaultLanguageState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          code: initialData.code || '',
          name: initialData.name || '',
          country: initialData.country || '',
          order: String(initialData.sortOrder || initialData.order || 1),
          isDefault: initialData.isDefault || false,
          isActive: initialData.isActive,
        });
        setImagePreview(initialData.image || null);
      } else {
        setForm(defaultLanguageState);
        setImagePreview(null);
      }
      setImageFile(null);
      setError('');
    }
  }, [open, initialData]);

  const handleChange = (key: keyof LanguageFormState, value: string | boolean) => {
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
        throw new Error('Gambar flag bahasa wajib diisi');
      }

      const formData = new FormData();
      formData.append('code', form.code.trim().toLowerCase());
      formData.append('name', form.name.trim());
      formData.append('country', form.country.trim());
      formData.append('order', form.order);
      formData.append('isDefault', String(form.isDefault));
      formData.append('isActive', String(form.isActive));

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (initialData && imagePreview && !imageFile) {
        // Keep existing image
        formData.append('image', initialData.image || '');
      }

      if (initialData) {
        await updateLanguage(initialData.id, formData);
      } else {
        await createLanguage(formData);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan bahasa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminModal
      open={open}
      onClose={loading ? () => null : onClose}
      title={initialData ? 'Edit Bahasa' : 'Tambah Bahasa'}
      description="Kelola bahasa yang tersedia"
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
            form="language-form"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      }
    >
      <form id="language-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-sm text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Kode Bahasa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => handleChange('code', e.target.value.toLowerCase())}
              placeholder="id"
              required
              maxLength={2}
              disabled={!!initialData}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Kode 2 huruf (contoh: id, en, ms)</p>
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
            Nama Bahasa <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Bahasa Indonesia"
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Negara <span className="text-red-500">*</span>
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
              Set sebagai Bahasa Default
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
            Bahasa Aktif
          </label>
        </div>
      </form>
    </AdminModal>
  );
}
