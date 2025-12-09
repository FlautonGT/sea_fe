'use client';

import React, { useEffect, useState } from 'react';
import { AdminModal } from '@/components/admin/ui';
import { AdminPromo, AdminProduct, AdminPaymentChannel, AdminRegion } from '@/types/admin';
import { createPromo, updatePromo, getProducts, getPaymentChannels, getRegions } from '@/lib/adminApi';

type DiscountType = 'percentage' | 'flat';

interface PromoFormState {
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  maxPromoAmount: string;
  minAmount: string;
  maxUsage: string;
  maxUsagePerId: string;
  maxUsagePerDevice: string;
  maxUsagePerIp: string;
  maxDailyUsage: string;
  startAt: string;
  expiredAt: string;
  selectedProducts: string[];
  selectedPaymentChannels: string[];
  selectedRegions: string[];
  selectedDays: string[];
  note: string;
  isActive: boolean;
}

const defaultPromoState: PromoFormState = {
  code: '',
  title: '',
  description: '',
  discountType: 'percentage',
  discountValue: '0',
  maxPromoAmount: '0',
  minAmount: '0',
  maxUsage: '0',
  maxUsagePerId: '1',
  maxUsagePerDevice: '1',
  maxUsagePerIp: '1',
  maxDailyUsage: '0',
  startAt: '',
  expiredAt: '',
  selectedProducts: [],
  selectedPaymentChannels: [],
  selectedRegions: [],
  selectedDays: [],
  note: '',
  isActive: true,
};

const DAYS_OF_WEEK = [
  { value: 'MON', label: 'Senin' },
  { value: 'TUE', label: 'Selasa' },
  { value: 'WED', label: 'Rabu' },
  { value: 'THU', label: 'Kamis' },
  { value: 'FRI', label: 'Jumat' },
  { value: 'SAT', label: 'Sabtu' },
  { value: 'SUN', label: 'Minggu' },
];

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

interface PromoFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: AdminPromo | null;
  onSuccess?: () => void;
}

export default function PromoFormModal({
  open,
  onClose,
  initialData,
  onSuccess,
}: PromoFormModalProps) {
  const [form, setForm] = useState<PromoFormState>(defaultPromoState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dropdown data
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [paymentChannels, setPaymentChannels] = useState<AdminPaymentChannel[]>([]);
  const [regions, setRegions] = useState<AdminRegion[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Fetch dropdown data
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          const [productsRes, paymentChannelsRes, regionsRes] = await Promise.all([
            getProducts({ isActive: true, limit: 1000 }).catch(err => {
              console.error('Failed to fetch products:', err);
              return { products: [], pagination: { limit: 0, page: 1, totalPages: 0, totalRows: 0 } };
            }),
            getPaymentChannels({ isActive: true }).catch(err => {
              console.error('Failed to fetch payment channels:', err);
              return [];
            }),
            getRegions().catch(err => {
              console.error('Failed to fetch regions:', err);
              return [];
            }),
          ]);
          
          // Handle products response
          let productsArray: AdminProduct[] = [];
          if (productsRes && typeof productsRes === 'object' && 'products' in productsRes) {
            productsArray = Array.isArray(productsRes.products) ? productsRes.products : [];
          } else if (Array.isArray(productsRes)) {
            productsArray = productsRes;
          }
          console.log('Products loaded:', productsArray.length);
          setProducts(productsArray);
          
          // Handle payment channels response
          const channelsArray = Array.isArray(paymentChannelsRes) ? paymentChannelsRes : [];
          console.log('Payment channels loaded:', channelsArray.length);
          setPaymentChannels(channelsArray);
          
          // Handle regions response
          const regionsArray = Array.isArray(regionsRes) 
            ? regionsRes.filter(r => r && r.isActive) 
            : [];
          console.log('Regions loaded:', regionsArray.length);
          setRegions(regionsArray);
        } catch (err) {
          console.error('Failed to fetch dropdown data:', err);
          setProducts([]);
          setPaymentChannels([]);
          setRegions([]);
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          code: initialData.code || '',
          title: initialData.title || '',
          description: initialData.description || '',
          discountType: initialData.promoPercentage > 0 ? 'percentage' : 'flat',
          discountValue:
            initialData.promoPercentage > 0
              ? String(initialData.promoPercentage)
              : String(initialData.promoFlat || 0),
          maxPromoAmount: String(initialData.maxPromoAmount || 0),
          minAmount: String(initialData.minAmount || 0),
          maxUsage: String(initialData.maxUsage || 0),
          maxUsagePerId: String(initialData.maxUsagePerId || 1),
          maxUsagePerDevice: String(initialData.maxUsagePerDevice || 1),
          maxUsagePerIp: String(initialData.maxUsagePerIp || 1),
          maxDailyUsage: String(initialData.maxDailyUsage || 0),
          startAt: formatDateForInput(initialData.startAt),
          expiredAt: formatDateForInput(initialData.expiredAt),
          selectedProducts: initialData.products || [],
          selectedPaymentChannels: initialData.paymentChannels || [],
          selectedRegions: initialData.regions || [],
          selectedDays: initialData.daysAvailable || [],
          note: initialData.note || '',
          isActive: initialData.isActive,
        });
      } else {
        setForm(defaultPromoState);
      }
      setError('');
    }
  }, [open, initialData]);

  const handleChange = (key: keyof PromoFormState, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleProduct = (productCode: string) => {
    setForm((prev) => {
      const isSelected = prev.selectedProducts.includes(productCode);
      return {
        ...prev,
        selectedProducts: isSelected
          ? prev.selectedProducts.filter((p) => p !== productCode)
          : [...prev.selectedProducts, productCode],
      };
    });
  };

  const togglePaymentChannel = (channelCode: string) => {
    setForm((prev) => {
      const isSelected = prev.selectedPaymentChannels.includes(channelCode);
      return {
        ...prev,
        selectedPaymentChannels: isSelected
          ? prev.selectedPaymentChannels.filter((c) => c !== channelCode)
          : [...prev.selectedPaymentChannels, channelCode],
      };
    });
  };

  const toggleRegion = (regionCode: string) => {
    setForm((prev) => {
      const isSelected = prev.selectedRegions.includes(regionCode);
      return {
        ...prev,
        selectedRegions: isSelected
          ? prev.selectedRegions.filter((r) => r !== regionCode)
          : [...prev.selectedRegions, regionCode],
      };
    });
  };

  const toggleDay = (day: string) => {
    setForm((prev) => {
      const isSelected = prev.selectedDays.includes(day);
      return {
        ...prev,
        selectedDays: isSelected
          ? prev.selectedDays.filter((d) => d !== day)
          : [...prev.selectedDays, day],
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload: Partial<AdminPromo> = {
        code: form.code.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        products: form.selectedProducts,
        paymentChannels: form.selectedPaymentChannels,
        regions: form.selectedRegions,
        daysAvailable: form.selectedDays.map((day) => day.toUpperCase()),
        maxDailyUsage: Number(form.maxDailyUsage) || 0,
        maxUsage: Number(form.maxUsage) || 0,
        maxUsagePerId: Number(form.maxUsagePerId) || 1,
        maxUsagePerDevice: Number(form.maxUsagePerDevice) || 1,
        maxUsagePerIp: Number(form.maxUsagePerIp) || 1,
        startAt: form.startAt ? new Date(form.startAt).toISOString() : undefined,
        expiredAt: form.expiredAt
          ? new Date(form.expiredAt).toISOString()
          : undefined,
        minAmount: Number(form.minAmount) || 0,
        maxPromoAmount: Number(form.maxPromoAmount) || 0,
        promoFlat:
          form.discountType === 'flat' ? Number(form.discountValue) || 0 : 0,
        promoPercentage:
          form.discountType === 'percentage' ? Number(form.discountValue) || 0 : 0,
        note: form.note.trim(),
        isActive: form.isActive,
      };

      if (initialData) {
        await updatePromo(initialData.id, payload);
      } else {
        await createPromo(payload);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan promo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminModal
      open={open}
      onClose={loading ? () => null : onClose}
      title={initialData ? 'Edit Promo' : 'Tambah Promo'}
      description="Kelola kode promo Gate"
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
            form="promo-form"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      }
    >
      <form id="promo-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Kode Promo</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => handleChange('code', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
              placeholder="WELCOME10"
              required
              disabled={!!initialData}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Judul</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Deskripsi</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Tipe Diskon</label>
            <select
              value={form.discountType}
              onChange={(e) =>
                handleChange('discountType', e.target.value as DiscountType)
              }
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
            >
              <option value="percentage">Persentase (%)</option>
              <option value="flat">Potongan (Rp)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Nilai Diskon</label>
            <input
              type="number"
              min="0"
              value={form.discountValue}
              onChange={(e) => handleChange('discountValue', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Maksimal Potongan
            </label>
            <input
              type="number"
              min="0"
              value={form.maxPromoAmount}
              onChange={(e) => handleChange('maxPromoAmount', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Minimum Transaksi</label>
            <input
              type="number"
              min="0"
              value={form.minAmount}
              onChange={(e) => handleChange('minAmount', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Max Usage</label>
            <input
              type="number"
              min="1"
              value={form.maxUsage}
              onChange={(e) => handleChange('maxUsage', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Max Usage Harian</label>
            <input
              type="number"
              min="0"
              value={form.maxDailyUsage}
              onChange={(e) => handleChange('maxDailyUsage', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Per User</label>
            <input
              type="number"
              min="1"
              value={form.maxUsagePerId}
              onChange={(e) => handleChange('maxUsagePerId', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Per Device</label>
            <input
              type="number"
              min="1"
              value={form.maxUsagePerDevice}
              onChange={(e) => handleChange('maxUsagePerDevice', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Per IP</label>
            <input
              type="number"
              min="1"
              value={form.maxUsagePerIp}
              onChange={(e) => handleChange('maxUsagePerIp', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Mulai</label>
            <input
              type="datetime-local"
              value={form.startAt}
              onChange={(e) => handleChange('startAt', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Selesai</label>
            <input
              type="datetime-local"
              value={form.expiredAt}
              onChange={(e) => handleChange('expiredAt', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Produk</label>
          <p className="text-xs text-gray-500 mb-2">
            {form.selectedProducts.length === 0
              ? 'Semua produk akan berlaku (kosongkan untuk semua produk)'
              : `${form.selectedProducts.length} produk dipilih`}
          </p>
          <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
            {loadingData ? (
              <p className="text-sm text-gray-500">Memuat produk...</p>
            ) : products.length === 0 ? (
              <p className="text-sm text-gray-500">Tidak ada produk tersedia</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {products.map((product) => (
                  <label
                    key={product.code}
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.selectedProducts.includes(product.code)}
                      onChange={() => toggleProduct(product.code)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">{product.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Channel Pembayaran
          </label>
          <p className="text-xs text-gray-500 mb-2">
            {form.selectedPaymentChannels.length === 0
              ? 'Semua channel akan berlaku (kosongkan untuk semua channel)'
              : `${form.selectedPaymentChannels.length} channel dipilih`}
          </p>
          <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
            {loadingData ? (
              <p className="text-sm text-gray-500">Memuat channel...</p>
            ) : paymentChannels.length === 0 ? (
              <p className="text-sm text-gray-500">Tidak ada channel tersedia</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {paymentChannels.map((channel) => (
                  <label
                    key={channel.code}
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.selectedPaymentChannels.includes(channel.code)}
                      onChange={() => togglePaymentChannel(channel.code)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">{channel.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Regions</label>
          <p className="text-xs text-gray-500 mb-2">
            {form.selectedRegions.length === 0
              ? 'Semua region akan berlaku (kosongkan untuk semua region)'
              : `${form.selectedRegions.length} region dipilih`}
          </p>
          <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
            {loadingData ? (
              <p className="text-sm text-gray-500">Memuat regions...</p>
            ) : regions.length === 0 ? (
              <p className="text-sm text-gray-500">Tidak ada region tersedia</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {regions.map((region) => (
                  <label
                    key={region.code}
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.selectedRegions.includes(region.code)}
                      onChange={() => toggleRegion(region.code)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">
                      {region.code} - {region.country}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Hari Aktif</label>
          <p className="text-xs text-gray-500 mb-2">
            {form.selectedDays.length === 0
              ? 'Semua hari akan berlaku (kosongkan untuk semua hari)'
              : `${form.selectedDays.length} hari dipilih`}
          </p>
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <label
                  key={day.value}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.selectedDays.includes(day.value)}
                    onChange={() => toggleDay(day.value)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">{day.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Catatan</label>
          <textarea
            value={form.note}
            onChange={(e) => handleChange('note', e.target.value)}
            rows={2}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          Promo Aktif
        </label>
      </form>
    </AdminModal>
  );
}


