'use client';

import React, { useEffect, useState } from 'react';
import { AdminModal } from '@/components/admin/ui';
import { AdminProduct, AdminCategory, AdminRegion } from '@/types/admin';
import { createProduct, updateProduct, getCategories, getRegions } from '@/lib/adminApi';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: AdminProduct | null;
  onSuccess?: () => void;
}

interface ProductFormState {
  code: string;
  slug: string;
  title: string;
  subtitle: string;
  publisher: string;
  categoryCode: string;
  description: string;
  inquirySlug: string;
  selectedRegions: string[];
  tagsInput: string;
  featuresInput: string;
  howToOrderInput: string;
  isActive: boolean;
  isPopular: boolean;
}

const defaultState: ProductFormState = {
  code: '',
  slug: '',
  title: '',
  subtitle: '',
  publisher: '',
  categoryCode: '',
  description: '',
  inquirySlug: '',
  selectedRegions: [],
  tagsInput: '',
  featuresInput: '',
  howToOrderInput: '',
  isActive: true,
  isPopular: false,
};

const parseCommaList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);

const parseLineList = (value: string) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

export default function ProductFormModal({
  open,
  onClose,
  initialData,
  onSuccess,
}: ProductFormModalProps) {
  const [form, setForm] = useState<ProductFormState>(defaultState);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [regions, setRegions] = useState<AdminRegion[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      // Fetch categories and regions
      const fetchData = async () => {
        try {
          setLoadingCategories(true);
          setLoadingRegions(true);
          const [cats, regs] = await Promise.all([
            getCategories({ isActive: true }),
            getRegions(),
          ]);
          // Ensure categories is always an array
          const categoriesArray = Array.isArray(cats) ? cats : [];
          setCategories(categoriesArray);
          // Ensure regions is always an array
          const regionsArray = Array.isArray(regs) ? regs : [];
          setRegions(regionsArray.filter(r => r && r.isActive));
        } catch (err) {
          console.error('Failed to fetch data:', err);
          setCategories([]);
          setRegions([]);
        } finally {
          setLoadingCategories(false);
          setLoadingRegions(false);
        }
      };
      fetchData();

      if (initialData) {
        setForm({
          code: initialData.code || '',
          slug: initialData.slug || '',
          title: initialData.title || '',
          subtitle: initialData.subtitle || '',
          publisher: initialData.publisher || '',
          categoryCode: initialData.category?.code || '',
          description: '',
          inquirySlug: initialData.inquirySlug || '',
          selectedRegions: initialData.regions || [],
          tagsInput: '',
          featuresInput: '',
          howToOrderInput: '',
          isActive: initialData.isActive,
          isPopular: initialData.isPopular,
        });
        // Set previews from existing data
        if (initialData.thumbnail) {
          setThumbnailPreview(initialData.thumbnail);
        }
        // Note: AdminProduct might not have banner field, check if it exists
        if ((initialData as any).banner) {
          setBannerPreview((initialData as any).banner);
        }
      } else {
        setForm(defaultState);
        setThumbnailPreview(null);
        setBannerPreview(null);
      }
      setThumbnailFile(null);
      setBannerFile(null);
      setError('');
    }
  }, [open, initialData]);

  const handleChange = (key: keyof ProductFormState, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: 'thumbnail' | 'banner') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (type === 'thumbnail') {
        setThumbnailFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setThumbnailPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setBannerFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setBannerPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const slugValue = form.slug || form.title.toLowerCase().replace(/\s+/g, '-');

      const regions = form.selectedRegions.map(r => r.toUpperCase());
      const tags = parseCommaList(form.tagsInput);
      const features = parseLineList(form.featuresInput);
      const howToOrder = parseLineList(form.howToOrderInput);

      // Build JSON payload object
      const payloadData = {
        code: form.code.trim(),
        slug: slugValue.trim(),
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        publisher: form.publisher.trim(),
        categoryCode: form.categoryCode.trim(),
        description: form.description.trim(),
        inquirySlug: form.inquirySlug.trim(),
        isActive: form.isActive,
        isPopular: form.isPopular,
        regions: regions,
        tags: tags,
        features: features,
        howToOrder: howToOrder,
      };

      // Create FormData and append JSON payload as string
      const formData = new FormData();
      formData.append('payload', JSON.stringify(payloadData));

      // Append files if present (new uploads)
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      } else if (initialData && thumbnailPreview && !thumbnailFile) {
        // If editing and no new file but preview exists, keep existing
        // Backend should handle this, but we can explicitly mark it
        formData.append('keepThumbnail', 'true');
      }

      if (bannerFile) {
        formData.append('banner', bannerFile);
      } else if (initialData && bannerPreview && !bannerFile) {
        // If editing and no new file but preview exists, keep existing
        formData.append('keepBanner', 'true');
      }

      if (initialData) {
        await updateProduct(initialData.id, formData);
      } else {
        await createProduct(formData);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan produk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminModal
      open={open}
      onClose={loading ? () => null : onClose}
      title={initialData ? 'Edit Produk' : 'Tambah Produk'}
      description="Lengkapi detail produk Seaply"
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
            form="product-form"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Kode Produk</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => handleChange('code', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
              placeholder="Contoh: MLBB"
              required
              disabled={!!initialData}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
              placeholder="mobile-legends"
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

          <div>
            <label className="text-sm font-medium text-gray-700">Sub Judul</label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
              placeholder="Publisher"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Publisher</label>
            <input
              type="text"
              value={form.publisher}
              onChange={(e) => handleChange('publisher', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Kategori</label>
            <select
              value={form.categoryCode}
              onChange={(e) => handleChange('categoryCode', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary bg-white"
              required
              disabled={loadingCategories}
            >
              <option value="">Pilih Kategori</option>
              {Array.isArray(categories) && categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category.code} value={category.code}>
                    {category.title} ({category.code})
                  </option>
                ))
              ) : (
                !loadingCategories && <option value="" disabled>Tidak ada kategori tersedia</option>
              )}
            </select>
            {loadingCategories && (
              <p className="text-xs text-gray-500 mt-1">Memuat kategori...</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Inquiry Slug</label>
            <input
              type="text"
              value={form.inquirySlug}
              onChange={(e) => handleChange('inquirySlug', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
              placeholder="mlbb"
            />
            <p className="text-xs text-gray-500 mt-1">
              Slug untuk API inquiry (contoh: mlbb, ff, pubg)
            </p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Deskripsi</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
            placeholder="Deskripsi singkat produk"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Regions</label>
            {loadingRegions ? (
              <p className="text-sm text-gray-500">Memuat regions...</p>
            ) : Array.isArray(regions) && regions.length > 0 ? (
              <div className="mt-1 border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {regions.map((region) => (
                    <label
                      key={region.code}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.selectedRegions.includes(region.code)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm((prev) => ({
                              ...prev,
                              selectedRegions: [...prev.selectedRegions, region.code],
                            }));
                          } else {
                            setForm((prev) => ({
                              ...prev,
                              selectedRegions: prev.selectedRegions.filter(
                                (r) => r !== region.code
                              ),
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">
                        {region.code} - {region.country}
                      </span>
                    </label>
                  ))}
                </div>
                {form.selectedRegions.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Pilih minimal satu region
                  </p>
                )}
                {form.selectedRegions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Region terpilih:</p>
                    <div className="flex flex-wrap gap-1">
                      {form.selectedRegions.map((code) => {
                        const region = regions.find((r) => r.code === code);
                        return (
                          <span
                            key={code}
                            className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded"
                          >
                            {code}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-1">Tidak ada region tersedia</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Tags (opsional)</label>
            <input
              type="text"
              value={form.tagsInput}
              onChange={(e) => handleChange('tagsInput', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
              placeholder="TopUp,Promo"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Fitur (1 baris = 1 item)</label>
            <textarea
              value={form.featuresInput}
              onChange={(e) => handleChange('featuresInput', e.target.value)}
              rows={3}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Cara Pemesanan (1 baris = 1 langkah)</label>
            <textarea
              value={form.howToOrderInput}
              onChange={(e) => handleChange('howToOrderInput', e.target.value)}
              rows={3}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Thumbnail Upload */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Thumbnail</label>
            {thumbnailPreview ? (
              <div className="relative">
                <div className="w-full h-48 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50">
                  <Image
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    width={400}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                {thumbnailFile && (
                  <p className="text-xs text-gray-500 mt-1">{thumbnailFile.name}</p>
                )}
              </div>
            ) : (
              <div
                onDrop={(e) => handleDrop(e, 'thumbnail')}
                onDragOver={handleDragOver}
                className="relative"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="text-primary font-medium">Klik untuk upload</span> atau drag & drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, WEBP (max. 5MB)</p>
                </label>
              </div>
            )}
          </div>

          {/* Banner Upload */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Banner</label>
            {bannerPreview ? (
              <div className="relative">
                <div className="w-full h-48 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50">
                  <Image
                    src={bannerPreview}
                    alt="Banner preview"
                    width={800}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeBanner}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                {bannerFile && (
                  <p className="text-xs text-gray-500 mt-1">{bannerFile.name}</p>
                )}
              </div>
            ) : (
              <div
                onDrop={(e) => handleDrop(e, 'banner')}
                onDragOver={handleDragOver}
                className="relative"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="hidden"
                  id="banner-upload"
                />
                <label
                  htmlFor="banner-upload"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="text-primary font-medium">Klik untuk upload</span> atau drag & drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, WEBP (max. 5MB)</p>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            Aktif
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isPopular}
              onChange={(e) => handleChange('isPopular', e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            Produk Populer
          </label>
        </div>
      </form>
    </AdminModal>
  );
}


