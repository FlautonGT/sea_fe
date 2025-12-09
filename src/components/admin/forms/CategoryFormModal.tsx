'use client';

import React, { useEffect, useState } from 'react';
import { AdminModal } from '@/components/admin/ui';
import { AdminCategory } from '@/types/admin';
import { createCategory, updateCategory, getRegions } from '@/lib/adminApi';
import { AdminRegion } from '@/types/admin';
import { Loader2 } from 'lucide-react';

interface CategoryFormState {
  code: string;
  title: string;
  description: string;
  icon: string;
  order: string;
  isActive: boolean;
  regionsInput: string;
}

const defaultCategoryState: CategoryFormState = {
  code: '',
  title: '',
  description: '',
  icon: '📦',
  order: '1',
  isActive: true,
  regionsInput: '',
};

const parseCommaValues = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: AdminCategory | null;
  onSuccess?: () => void;
}

const commonIcons = ['📦', '🎮', '🎟️', '💳', '📱', '🎁', '⚡', '🔥', '🏆', '⭐'];

export default function CategoryFormModal({
  open,
  onClose,
  initialData,
  onSuccess,
}: CategoryFormModalProps) {
  const [form, setForm] = useState<CategoryFormState>(defaultCategoryState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [regions, setRegions] = useState<AdminRegion[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          code: initialData.code || '',
          title: initialData.title || '',
          description: initialData.description || '',
          icon: initialData.icon || '📦',
          order: String(initialData.order || 1),
          isActive: initialData.isActive,
          regionsInput: initialData.regions?.join(', ') || '',
        });
      } else {
        setForm(defaultCategoryState);
      }
      setError('');

      // Load regions for selection
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

  const handleChange = (key: keyof CategoryFormState, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const regionsArray = parseCommaValues(form.regionsInput);

      const payload: any = {
        code: form.code.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        icon: form.icon.trim() || '📦',
        order: parseInt(form.order) || 1,
        isActive: form.isActive,
        regions: regionsArray,
      };

      if (initialData) {
        await updateCategory(initialData.id, payload);
      } else {
        await createCategory(payload);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan kategori');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminModal
      open={open}
      onClose={loading ? () => null : onClose}
      title={initialData ? 'Edit Kategori' : 'Tambah Kategori'}
      description="Sesuaikan data kategori produk"
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
            form="category-form"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-sm text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Kode Kategori <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => handleChange('code', e.target.value)}
              placeholder="top-up-game"
              required
              disabled={!!initialData}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Kode unik (huruf kecil, tanpa spasi)</p>
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
            Nama Kategori <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Top Up Game"
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
            placeholder="Deskripsi kategori..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Icon <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <input
              type="text"
              value={form.icon}
              onChange={(e) => handleChange('icon', e.target.value)}
              placeholder="🎮"
              maxLength={2}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center text-2xl"
            />
            <div className="flex flex-wrap gap-2">
              {commonIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleChange('icon', icon)}
                  className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xl transition-colors ${
                    form.icon === icon
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
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
            Kategori Aktif
          </label>
        </div>
      </form>
    </AdminModal>
  );
}

