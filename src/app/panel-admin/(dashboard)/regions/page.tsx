'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StatusBadge, StatsCard, ConfirmDialog } from '@/components/admin/ui';
import { RegionFormModal, LanguageFormModal } from '@/components/admin/forms';
import { getRegions, deleteRegion, getLanguages, deleteLanguage } from '@/lib/adminApi';
import { AdminRegion, AdminLanguage } from '@/types/admin';
import { Plus, Edit, Trash2, RefreshCw, Globe, CheckCircle, Star, Users, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}Jt`;
  return value.toLocaleString('id-ID');
}

export default function RegionsLanguagesPage() {
  const [regions, setRegions] = useState<AdminRegion[]>([]);
  const [languages, setLanguages] = useState<AdminLanguage[]>([]);
  const [loading, setLoading] = useState(true);
  const [languageLoading, setLanguageLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'regions' | 'languages'>('regions');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'region' | 'language'; id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showRegionForm, setShowRegionForm] = useState(false);
  const [editingRegion, setEditingRegion] = useState<AdminRegion | null>(null);
  const [showLanguageForm, setShowLanguageForm] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<AdminLanguage | null>(null);

  const fetchRegions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getRegions();
      setRegions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat regions');
      setRegions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLanguages = useCallback(async () => {
    try {
      setLanguageLoading(true);
      setError('');
      const data = await getLanguages();
      setLanguages(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat languages');
      setLanguages([]);
    } finally {
      setLanguageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegions();
    fetchLanguages();
  }, [fetchRegions, fetchLanguages]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      if (deleteTarget.type === 'region') {
        await deleteRegion(deleteTarget.id);
        await fetchRegions();
      } else {
        await deleteLanguage(deleteTarget.id);
        await fetchLanguages();
      }
      setShowDeleteDialog(false);
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Region & Bahasa</h1>
          <p className="text-gray-500 mt-1">Kelola region dan bahasa yang tersedia</p>
        </div>
        {activeTab === 'regions' && (
          <div className="flex items-center gap-2">
            <button
              onClick={fetchRegions}
              disabled={loading}
              className={cn('inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50')}
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              Refresh
            </button>
            <button
              onClick={() => {
                setEditingRegion(null);
                setShowRegionForm(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              Tambah Region
            </button>
          </div>
        )}
        {activeTab === 'languages' && (
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLanguages}
              disabled={languageLoading}
              className={cn('inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50')}
            >
              <RefreshCw className={cn('w-4 h-4', languageLoading && 'animate-spin')} />
              Refresh
            </button>
            <button
              onClick={() => {
                setEditingLanguage(null);
                setShowLanguageForm(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              Tambah Bahasa
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Region" 
          value={((Array.isArray(regions) ? regions : []).length).toString()} 
          icon={<Globe className="w-5 h-5 text-primary" />} 
          loading={loading} 
        />
        <StatsCard 
          title="Region Aktif" 
          value={((Array.isArray(regions) ? regions : []).filter(r => r?.isActive).length).toString()} 
          icon={<CheckCircle className="w-5 h-5 text-green-600" />} 
          iconBgColor="bg-green-100" 
          loading={loading} 
        />
        <StatsCard 
          title="Total Bahasa" 
          value={((Array.isArray(languages) ? languages : []).length).toString()} 
          icon={<Languages className="w-5 h-5 text-purple-600" />} 
          iconBgColor="bg-purple-100" 
          loading={languageLoading} 
        />
        <StatsCard 
          title="Bahasa Aktif" 
          value={((Array.isArray(languages) ? languages : []).filter(l => l?.isActive).length).toString()} 
          icon={<CheckCircle className="w-5 h-5 text-green-600" />} 
          iconBgColor="bg-green-100" 
          loading={languageLoading} 
        />
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('regions')} 
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors', 
            activeTab === 'regions' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          Region
        </button>
        <button 
          onClick={() => setActiveTab('languages')} 
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors', 
            activeTab === 'languages' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          Bahasa
        </button>
      </div>

      {activeTab === 'regions' && (
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Array.isArray(regions) ? regions : []).map((region) => (
              <div key={region.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {region.image && (
                      <img src={region.image} alt={region.country} className="w-12 h-8 rounded object-cover" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{region.country}</h3>
                        {region.isDefault && (
                          <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">Default</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{region.code} • {region.currencySymbol} {region.currency}</p>
                    </div>
                  </div>
                  <StatusBadge status={region.isActive ? 'ACTIVE' : 'INACTIVE'} size="sm" />
                </div>
                {region.stats && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">User</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(region.stats.totalUsers || 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Transaksi</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(region.stats.totalTransactions || 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Revenue</p>
                      <p className="font-semibold text-gray-900">{region.currencySymbol}{formatCurrency(region.stats.totalRevenue || 0)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setEditingRegion(region);
                      setShowRegionForm(true);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  {!region.isDefault && (
                    <button
                      onClick={() => {
                        setDeleteTarget({ type: 'region', id: region.id, name: region.country });
                        setShowDeleteDialog(true);
                      }}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'languages' && (
        languageLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Array.isArray(languages) ? languages : []).map((language) => (
              <div key={language.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {language.image && (
                      <img src={language.image} alt={language.country} className="w-12 h-8 rounded object-cover" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{language.name}</h3>
                        {language.isDefault && (
                          <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">Default</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{language.country} • {language.code}</p>
                    </div>
                  </div>
                  <StatusBadge status={language.isActive ? 'ACTIVE' : 'INACTIVE'} size="sm" />
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setEditingLanguage(language);
                      setShowLanguageForm(true);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  {!language.isDefault && (
                    <button
                      onClick={() => {
                        setDeleteTarget({ type: 'language', id: language.id, name: language.name });
                        setShowDeleteDialog(true);
                      }}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      <ConfirmDialog
        open={showDeleteDialog}
        onCancel={() => {
          setShowDeleteDialog(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title={`Hapus ${deleteTarget?.type === 'region' ? 'Region' : 'Bahasa'}?`}
        description={`Apakah Anda yakin ingin menghapus ${deleteTarget?.name}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        confirmVariant="danger"
        loading={deleteLoading}
      />

      <RegionFormModal
        open={showRegionForm}
        onClose={() => {
          setShowRegionForm(false);
          setEditingRegion(null);
        }}
        initialData={editingRegion}
        onSuccess={() => {
          fetchRegions();
        }}
      />

      <LanguageFormModal
        open={showLanguageForm}
        onClose={() => {
          setShowLanguageForm(false);
          setEditingLanguage(null);
        }}
        initialData={editingLanguage}
        onSuccess={() => {
          fetchLanguages();
        }}
      />
    </div>
  );
}