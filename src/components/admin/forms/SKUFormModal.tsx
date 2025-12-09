'use client';

import React, { useEffect, useState } from 'react';
import { AdminModal } from '@/components/admin/ui';
import { AdminSKU, AdminProduct, AdminSection, AdminRegion } from '@/types/admin';
import { createSKU, updateSKU, getProducts, getProviders, getSections, getSKUImages, getRegions } from '@/lib/adminApi';

type StockStatus = 'AVAILABLE' | 'OUT_OF_STOCK' | 'LIMITED';

interface PricingRow {
  region: string;
  currency: string;
  buyPrice: string;
  sellPrice: string;
  originalPrice: string;
}

interface SKUFormState {
  code: string;
  providerSkuCode: string;
  name: string;
  description: string;
  productCode: string;
  providerCode: string;
  sectionCode: string;
  image: string;
  processTime: string;
  stock: StockStatus;
  isActive: boolean;
  isFeatured: boolean;
  info: string;
  badgeText: string;
  badgeColor: string;
}

const defaultSkuState: SKUFormState = {
  code: '',
  providerSkuCode: '',
  name: '',
  description: '',
  productCode: '',
  providerCode: '',
  sectionCode: '',
  image: '',
  processTime: '0',
  stock: 'AVAILABLE',
  isActive: true,
  isFeatured: false,
  info: '',
  badgeText: '',
  badgeColor: '#4F46E5',
};

const emptyPricingRow: PricingRow = {
  region: '',
  currency: 'IDR',
  buyPrice: '',
  sellPrice: '',
  originalPrice: '',
};

interface SKUFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: AdminSKU | null;
  onSuccess?: () => void;
}

export default function SKUFormModal({
  open,
  onClose,
  initialData,
  onSuccess,
}: SKUFormModalProps) {
  const [form, setForm] = useState<SKUFormState>(defaultSkuState);
  const [pricingRows, setPricingRows] = useState<PricingRow[]>([emptyPricingRow]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dropdown data
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [sections, setSections] = useState<AdminSection[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [regions, setRegions] = useState<AdminRegion[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMode, setImageMode] = useState<'upload' | 'select'>('select');

  // Fetch dropdown data
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          const [productsRes, providersRes, regionsRes] = await Promise.all([
            getProducts({ isActive: true, limit: 1000 }),
            getProviders(),
            getRegions(),
          ]);
          setProducts(productsRes.products || []);
          setProviders(providersRes || []);
          setRegions((regionsRes || []).filter(r => r.isActive));
        } catch (err) {
          console.error('Failed to fetch dropdown data:', err);
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [open]);

  // Fetch sections when productCode changes
  useEffect(() => {
    if (open && form.productCode) {
      const fetchSections = async () => {
        try {
          const sectionsRes = await getSections({ productCode: form.productCode });
          setSections(Array.isArray(sectionsRes) ? sectionsRes : []);
        } catch (err) {
          console.error('Failed to fetch sections:', err);
          setSections([]);
        }
      };
      fetchSections();
    } else {
      setSections([]);
    }
  }, [open, form.productCode]);

  // Fetch images when productCode changes
  useEffect(() => {
    if (open) {
      const fetchImages = async () => {
        try {
          const imagesRes = await getSKUImages({ productCode: form.productCode || undefined });
          setImages(imagesRes || []);
        } catch (err) {
          console.error('Failed to fetch images:', err);
          setImages([]);
        }
      };
      fetchImages();
    }
  }, [open, form.productCode]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          code: initialData.code || '',
          providerSkuCode: initialData.providerSkuCode || '',
          name: initialData.name || '',
          description: initialData.description || '',
          productCode: initialData.product?.code || '',
          providerCode: initialData.provider?.code || '',
          sectionCode: initialData.section?.code || '',
          image: initialData.image || '',
          processTime: String(initialData.processTime || 0),
          stock: (initialData.stock as StockStatus) || 'AVAILABLE',
          isActive: initialData.isActive,
          isFeatured: initialData.isFeatured,
          info: initialData.info || '',
          badgeText: initialData.badge?.text || '',
          badgeColor: initialData.badge?.color || '#4F46E5',
        });

        const rows =
          Object.entries(initialData.pricing || {}).map(([region, value]) => ({
            region,
            currency: value.currency || 'IDR',
            buyPrice: String(value.buyPrice || 0),
            sellPrice: String(value.sellPrice || 0),
            originalPrice: String(value.originalPrice || 0),
          })) || [];

        setPricingRows(rows.length ? rows : [emptyPricingRow]);

        // Set image preview from existing data
        if (initialData.image) {
          setImagePreview(initialData.image);
          setImageMode('select');
        } else {
          setImagePreview(null);
          setImageMode('upload');
        }
      } else {
        setForm(defaultSkuState);
        setPricingRows([emptyPricingRow]);
        setImagePreview(null);
        setImageMode('upload');
      }
      setImageFile(null);
      setError('');
    }
  }, [open, initialData]);

  const handleFormChange = (key: keyof SKUFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePricingChange = (index: number, key: keyof PricingRow, value: string) => {
    setPricingRows((prev) =>
      prev.map((row, idx) => {
        if (idx === index) {
          const updated = { ...row, [key]: value };
          // If region changed, update currency based on region
          if (key === 'region' && value) {
            const region = regions.find(r => r.code === value.toUpperCase());
            if (region) {
              updated.currency = region.currency || 'IDR';
            }
          }
          return updated;
        }
        return row;
      })
    );
  };

  // Get available regions (not yet used in pricing rows)
  const getAvailableRegions = () => {
    const usedRegions = pricingRows.map(row => row.region.toUpperCase()).filter(r => r);
    return regions.filter(r => !usedRegions.includes(r.code.toUpperCase()));
  };

  const addPricingRow = () => {
    const availableRegions = getAvailableRegions();
    if (availableRegions.length === 0) {
      setError('Semua region sudah digunakan. Satu negara hanya bisa memiliki satu field harga.');
      return;
    }
    setPricingRows((prev) => [...prev, { ...emptyPricingRow, region: availableRegions[0]?.code || '' }]);
  };

  const removePricingRow = (index: number) => {
    setPricingRows((prev) => prev.filter((_, idx) => idx !== index));
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
      setImageMode('upload');
      setForm((prev) => ({ ...prev, image: '' })); // Clear selected image from dropdown
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setForm((prev) => ({ ...prev, image: imageUrl }));
    setImageFile(null);
    setImagePreview(imageUrl);
    setImageMode('select');
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setForm((prev) => ({ ...prev, image: '' }));
    setImageMode('upload');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setImageMode('upload');
      setForm((prev) => ({ ...prev, image: '' })); // Clear selected image from dropdown
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const pricingPayload: AdminSKU['pricing'] = {};
      pricingRows.forEach((row) => {
        if (!row.region) return;
        pricingPayload[row.region.toUpperCase()] = {
          currency: row.currency || 'IDR',
          buyPrice: Number(row.buyPrice) || 0,
          sellPrice: Number(row.sellPrice) || 0,
          originalPrice: Number(row.originalPrice) || 0,
          margin: 0,
          discount: 0,
        };
      });

      // Validate pricing rows - no duplicate regions
      const regionSet = new Set<string>();
      for (const row of pricingRows) {
        if (!row.region) continue;
        const regionUpper = row.region.toUpperCase();
        if (regionSet.has(regionUpper)) {
          setError(`Region ${regionUpper} sudah digunakan. Satu negara hanya bisa memiliki satu field harga.`);
          setLoading(false);
          return;
        }
        regionSet.add(regionUpper);
      }

      // Validate image (only for new SKU, edit mode can keep existing image)
      if (!initialData && !imageFile && !form.image.trim()) {
        setError('Gambar SKU wajib diisi. Silakan upload gambar baru atau pilih dari gambar yang sudah ada.');
        setLoading(false);
        return;
      }

      // Build JSON payload object
      const payloadData: any = {
        code: form.code.trim(),
        providerSkuCode: form.providerSkuCode.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        productCode: form.productCode.trim(),
        providerCode: form.providerCode.trim(),
        sectionCode: form.sectionCode.trim() || undefined,
        processTime: Number(form.processTime) || 0,
        stockStatus: form.stock,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        pricing: pricingPayload,
        info: form.info.trim() || undefined,
        badge: form.badgeText
          ? {
            text: form.badgeText,
            color: form.badgeColor || '#4F46E5',
          }
          : undefined,
      };

      // Add image URL if selected from dropdown (not uploading new file)
      if (!imageFile && form.image.trim()) {
        payloadData.image = form.image.trim();
      }

      // Create FormData and append JSON payload as string
      const formData = new FormData();
      formData.append('payload', JSON.stringify(payloadData));

      // Append image file if present (new upload)
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (initialData) {
        await updateSKU(initialData.id, formData);
      } else {
        await createSKU(formData);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan SKU');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminModal
      open={open}
      onClose={loading ? () => null : onClose}
      title={initialData ? 'Edit SKU' : 'Tambah SKU'}
      description="Sesuaikan data SKU Seaply"
      maxWidthClass="max-w-3xl"
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
            form="sku-form"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      }
    >
      <form id="sku-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Kode SKU</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => handleFormChange('code', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
              placeholder="MLBB_86"
              required
              disabled={!!initialData}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Kode Provider</label>
            <input
              type="text"
              value={form.providerSkuCode}
              onChange={(e) => handleFormChange('providerSkuCode', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
              placeholder="ml-86"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Nama SKU</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Deskripsi</label>
          <textarea
            value={form.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            rows={3}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Kode Produk</label>
            <select
              value={form.productCode}
              onChange={(e) => {
                handleFormChange('productCode', e.target.value);
                handleFormChange('sectionCode', ''); // Reset section when product changes
              }}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary bg-white"
              required
              disabled={loadingData}
            >
              <option value="">Pilih Produk</option>
              {products.map((product) => (
                <option key={product.code} value={product.code}>
                  {product.title} ({product.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Kode Provider</label>
            <select
              value={form.providerCode}
              onChange={(e) => handleFormChange('providerCode', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary bg-white"
              required
              disabled={loadingData}
            >
              <option value="">Pilih Provider</option>
              {providers.map((provider) => (
                <option key={provider.code} value={provider.code}>
                  {provider.name} ({provider.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Kode Section</label>
            <select
              value={form.sectionCode}
              onChange={(e) => handleFormChange('sectionCode', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary bg-white"
              disabled={!form.productCode || loadingData}
            >
              <option value="">Pilih Section (Opsional)</option>
              {sections.map((section) => (
                <option key={section.code} value={section.code}>
                  {section.title} ({section.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Gambar SKU</label>
          <p className="text-xs text-gray-500 mb-2">
            Upload gambar baru atau pilih dari gambar yang sudah ada
          </p>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setImageMode('upload')}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${imageMode === 'upload'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
            >
              Upload Baru
            </button>
            <button
              type="button"
              onClick={() => setImageMode('select')}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${imageMode === 'select'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
            >
              Pilih dari yang Ada
            </button>
          </div>

          {/* Upload Mode */}
          {imageMode === 'upload' && (
            <div>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeImage();
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="w-12 h-12 text-gray-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-sm text-gray-600">
                        Klik untuk upload atau drag & drop gambar di sini
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG, GIF hingga 5MB
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Select Mode */}
          {imageMode === 'select' && (
            <div>
              <select
                value={form.image}
                onChange={(e) => handleImageSelect(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary bg-white"
                disabled={loadingData}
              >
                <option value="">Pilih Gambar</option>
                {images.map((image) => {
                  const filename = image.split('/').pop() || image;
                  return (
                    <option key={image} value={image}>
                      {filename}
                    </option>
                  );
                })}
              </select>
              {form.image && (
                <div className="mt-2">
                  <img
                    src={form.image}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="mt-2 text-xs text-red-600 hover:underline"
                  >
                    Hapus Gambar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Waktu Proses (detik)</label>
            <input
              type="number"
              min="0"
              value={form.processTime}
              onChange={(e) => handleFormChange('processTime', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Status Stok</label>
            <select
              value={form.stock}
              onChange={(e) =>
                handleFormChange('stock', e.target.value as StockStatus)
              }
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
            >
              <option value="AVAILABLE">Available</option>
              <option value="LIMITED">Limited</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 mt-6">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => handleFormChange('isActive', e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              Aktif
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 mt-6">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => handleFormChange('isFeatured', e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              Featured
            </label>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Informasi Tambahan</label>
          <input
            type="text"
            value={form.info}
            onChange={(e) => handleFormChange('info', e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
            placeholder="Contoh: Bonus item"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Badge Text</label>
            <input
              type="text"
              value={form.badgeText}
              onChange={(e) => handleFormChange('badgeText', e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
              placeholder="HOT"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Badge Color</label>
            <input
              type="color"
              value={form.badgeColor}
              onChange={(e) => handleFormChange('badgeColor', e.target.value)}
              className="mt-1 w-20 h-10 border border-gray-200 rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Harga per Region</h4>
              <p className="text-xs text-gray-500">
                Tambahkan konfigurasi harga untuk setiap region
              </p>
            </div>
            <button
              type="button"
              onClick={addPricingRow}
              disabled={getAvailableRegions().length === 0}
              className="text-sm font-medium text-primary hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              + Tambah Region {getAvailableRegions().length === 0 && '(Semua region sudah digunakan)'}
            </button>
          </div>

          <div className="space-y-4">
            {pricingRows.map((row, index) => (
              <div
                key={`pricing-${index}`}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">
                    Region #{index + 1}
                  </p>
                  {pricingRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePricingRow(index)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Region</label>
                    <select
                      value={row.region}
                      onChange={(e) => handlePricingChange(index, 'region', e.target.value)}
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary bg-white"
                      required
                    >
                      <option value="">Pilih Region</option>
                      {regions.map((region) => {
                        const isUsed = pricingRows.some(
                          (r, idx) => idx !== index && r.region.toUpperCase() === region.code.toUpperCase()
                        );
                        return (
                          <option
                            key={region.code}
                            value={region.code}
                            disabled={isUsed}
                          >
                            {region.code} - {region.country} {isUsed ? '(Sudah digunakan)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Currency</label>
                    <input
                      type="text"
                      value={row.currency}
                      onChange={(e) =>
                        handlePricingChange(index, 'currency', e.target.value.toUpperCase())
                      }
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                      placeholder="IDR"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Harga Modal</label>
                    <input
                      type="number"
                      min="0"
                      value={row.buyPrice}
                      onChange={(e) => handlePricingChange(index, 'buyPrice', e.target.value)}
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Harga Jual</label>
                    <input
                      type="number"
                      min="0"
                      value={row.sellPrice}
                      onChange={(e) => handlePricingChange(index, 'sellPrice', e.target.value)}
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Harga Original</label>
                    <input
                      type="number"
                      min="0"
                      value={row.originalPrice}
                      onChange={(e) =>
                        handlePricingChange(index, 'originalPrice', e.target.value)
                      }
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </AdminModal>
  );
}


