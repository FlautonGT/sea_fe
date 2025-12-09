'use client';

import React, { useEffect, useState } from 'react';
import { AdminModal } from '@/components/admin/ui';
import { AdminPaymentChannel, AdminPaymentChannelCategory, AdminRegion } from '@/types/admin';
import { createPaymentChannel, updatePaymentChannel, getPaymentChannelCategories, getRegions } from '@/lib/adminApi';

interface PaymentChannelFormState {
  code: string;
  name: string;
  description: string;
  image: string;
  imageFile: File | null;
  imagePreview: string | null;
  categoryCode: string;
  feeType: 'FIXED' | 'PERCENTAGE' | 'MIXED';
  feeAmount: string;
  feePercentage: string;
  minAmount: string;
  maxAmount: string;
  regions: string[];
  supportedTypes: ('purchase' | 'deposit')[];
  isActive: boolean;
  isFeatured: boolean;
  order: string;
  instruction: string;
}

const defaultFormState: PaymentChannelFormState = {
  code: '',
  name: '',
  description: '',
  image: '',
  imageFile: null,
  imagePreview: null,
  categoryCode: '',
  feeType: 'PERCENTAGE',
  feeAmount: '0',
  feePercentage: '0',
  minAmount: '0',
  maxAmount: '0',
  regions: [],
  supportedTypes: ['purchase'],
  isActive: true,
  isFeatured: false,
  order: '0',
  instruction: '',
};

interface PaymentChannelFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: AdminPaymentChannel | null;
  onSuccess?: () => void;
}

export default function PaymentChannelFormModal({
  open,
  onClose,
  initialData,
  onSuccess,
}: PaymentChannelFormModalProps) {
  const [form, setForm] = useState<PaymentChannelFormState>(defaultFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dropdown data
  const [categories, setCategories] = useState<AdminPaymentChannelCategory[]>([]);
  const [regions, setRegions] = useState<AdminRegion[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Fetch dropdown data
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          const [categoriesRes, regionsRes] = await Promise.all([
            getPaymentChannelCategories().catch(err => {
              console.error('Failed to fetch categories:', err);
              return [];
            }),
            getRegions().catch(err => {
              console.error('Failed to fetch regions:', err);
              return [];
            }),
          ]);
          
          setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
          setRegions(Array.isArray(regionsRes) ? regionsRes.filter(r => r && r.isActive) : []);
        } catch (err) {
          console.error('Failed to fetch dropdown data:', err);
          setCategories([]);
          setRegions([]);
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [open]);

  // Initialize form with initial data
  useEffect(() => {
    if (open) {
      if (initialData) {
        const feeType = initialData.fee?.feeType || 'PERCENTAGE';
        setForm({
          code: initialData.code || '',
          name: initialData.name || '',
          description: initialData.description || '',
          image: initialData.image || '',
          imageFile: null,
          imagePreview: initialData.image || null,
          categoryCode: initialData.category?.code || '',
          feeType: (feeType === 'FIXED' || feeType === 'PERCENTAGE' || feeType === 'MIXED') ? feeType : 'PERCENTAGE',
          feeAmount: String(initialData.fee?.feeAmount || 0),
          feePercentage: String(initialData.fee?.feePercentage || 0),
          minAmount: String(initialData.limits?.minAmount || 0),
          maxAmount: String(initialData.limits?.maxAmount || 0),
          regions: Array.isArray(initialData.regions) ? initialData.regions : [],
          supportedTypes: Array.isArray(initialData.supportedTypes) && initialData.supportedTypes.length > 0 
            ? initialData.supportedTypes 
            : ['purchase'],
          isActive: initialData.isActive ?? true,
          isFeatured: initialData.isFeatured ?? false,
          order: String(initialData.order || 0),
          instruction: initialData.instruction || '',
        });
      } else {
        setForm(defaultFormState);
      }
      setError('');
    }
  }, [open, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const removeImage = () => {
    setForm(prev => ({
      ...prev,
      imageFile: null,
      imagePreview: null,
      image: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('feeType', form.feeType);
      formData.append('feeAmount', form.feeAmount);
      formData.append('feePercentage', form.feePercentage);
      formData.append('minAmount', form.minAmount);
      formData.append('maxAmount', form.maxAmount);
      formData.append('regions', JSON.stringify(form.regions));
      formData.append('supportedTypes', JSON.stringify(form.supportedTypes));
      formData.append('isActive', String(form.isActive));
      formData.append('isFeatured', String(form.isFeatured));
      formData.append('order', form.order);
      formData.append('instruction', form.instruction);

      // Always include categoryCode (empty string means no category)
      formData.append('categoryCode', form.categoryCode || '');

      // Handle image
      if (form.imageFile) {
        formData.append('image', form.imageFile);
      } else if (form.image) {
        formData.append('image', form.image);
      }

      if (!initialData) {
        // Create
        formData.append('code', form.code);
        await createPaymentChannel(formData);
      } else {
        // Update
        await updatePaymentChannel(initialData.id, formData);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error saving payment channel:', err);
      setError(err?.message || 'Gagal menyimpan payment channel');
    } finally {
      setLoading(false);
    }
  };

  const toggleRegion = (regionCode: string) => {
    setForm(prev => ({
      ...prev,
      regions: prev.regions.includes(regionCode)
        ? prev.regions.filter(r => r !== regionCode)
        : [...prev.regions, regionCode],
    }));
  };

  const toggleSupportedType = (type: 'purchase' | 'deposit') => {
    setForm(prev => ({
      ...prev,
      supportedTypes: prev.supportedTypes.includes(type)
        ? prev.supportedTypes.filter(t => t !== type)
        : [...prev.supportedTypes, type],
    }));
  };

  return (
    <AdminModal open={open} onClose={onClose} title={initialData ? 'Edit Payment Channel' : 'Tambah Payment Channel'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {!initialData && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.code}
              onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="QRIS"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="QRIS"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deskripsi
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Bayar menggunakan QRIS"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Logo Payment Channel
          </label>
          {form.imagePreview ? (
            <div className="mb-3">
              <div className="relative inline-block">
                <img
                  src={form.imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-contain border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          ) : null}
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
            {!form.imageFile && (
              <input
                type="url"
                value={form.image}
                onChange={(e) => setForm(prev => ({ ...prev, image: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="atau masukkan URL gambar"
              />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">Upload gambar atau masukkan URL gambar</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategori
          </label>
          <select
            value={form.categoryCode}
            onChange={(e) => setForm(prev => ({ ...prev, categoryCode: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loadingData}
          >
            <option value="">Tidak ada kategori</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.code}>{cat.title}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Kosongkan jika payment channel tidak memerlukan kategori (misal: QRIS, BALANCE)</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipe Fee <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.feeType}
              onChange={(e) => setForm(prev => ({ ...prev, feeType: e.target.value as 'FIXED' | 'PERCENTAGE' | 'MIXED' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="PERCENTAGE">Persentase</option>
              <option value="FIXED">Tetap</option>
              <option value="MIXED">Campuran</option>
            </select>
          </div>

          {form.feeType === 'PERCENTAGE' || form.feeType === 'MIXED' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee Persentase (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={form.feePercentage}
                onChange={(e) => setForm(prev => ({ ...prev, feePercentage: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0.7"
              />
            </div>
          ) : null}

          {form.feeType === 'FIXED' || form.feeType === 'MIXED' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee Tetap (Rp)
              </label>
              <input
                type="number"
                min="0"
                value={form.feeAmount}
                onChange={(e) => setForm(prev => ({ ...prev, feeAmount: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="4000"
              />
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Amount (Rp)
            </label>
            <input
              type="number"
              min="0"
              value={form.minAmount}
              onChange={(e) => setForm(prev => ({ ...prev, minAmount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Amount (Rp)
            </label>
            <input
              type="number"
              min="0"
              value={form.maxAmount}
              onChange={(e) => setForm(prev => ({ ...prev, maxAmount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="10000000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Regions <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2 p-3 border border-gray-300 rounded-lg max-h-32 overflow-y-auto">
            {regions.map(region => (
              <label key={region.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.regions.includes(region.code)}
                  onChange={() => toggleRegion(region.code)}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{region.country}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supported Types <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.supportedTypes.includes('purchase')}
                onChange={() => toggleSupportedType('purchase')}
                className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Purchase</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.supportedTypes.includes('deposit')}
                onChange={() => toggleSupportedType('deposit')}
                className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Deposit</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instruksi (HTML)
          </label>
          <textarea
            value={form.instruction}
            onChange={(e) => setForm(prev => ({ ...prev, instruction: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="<p>Gunakan E-wallet atau aplikasi mobile banking...</p>"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urutan
            </label>
            <input
              type="number"
              min="0"
              value={form.order}
              onChange={(e) => setForm(prev => ({ ...prev, order: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">Aktif</label>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
              className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">Featured</label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : initialData ? 'Update' : 'Simpan'}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}

