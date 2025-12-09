'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronDown, Check, Loader2 } from 'lucide-react';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { getRegions, getLanguages } from '@/lib/api';
import { Region, Language } from '@/types';
import { cn } from '@/lib/utils';

interface CurrencyLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CurrencyLanguageModal({ isOpen, onClose }: CurrencyLanguageModalProps) {
  const {
    region,
    language,
    changeLocale,
  } = useLocale();
  const { t } = useTranslation();
  
  const [regions, setRegions] = useState<Region[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // Fetch regions and languages from API
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [regionsRes, languagesRes] = await Promise.all([
            getRegions(),
            getLanguages(),
          ]);

          if (regionsRes.data && Array.isArray(regionsRes.data)) {
            setRegions(regionsRes.data);
            // Set selected region based on current region code
            const currentRegion = regionsRes.data.find(r => r.code.toLowerCase() === region);
            if (currentRegion) {
              setSelectedRegion(currentRegion);
            } else if (regionsRes.data.length > 0) {
              // Fallback to default or first region
              const defaultRegion = regionsRes.data.find(r => r.isDefault) || regionsRes.data[0];
              setSelectedRegion(defaultRegion);
            }
          }

          if (languagesRes.data && Array.isArray(languagesRes.data)) {
            setLanguages(languagesRes.data);
            // Set selected language based on current language code
            const currentLang = languagesRes.data.find(l => l.code.toLowerCase() === language);
            if (currentLang) {
              setSelectedLanguage(currentLang);
            } else if (languagesRes.data.length > 0) {
              // Fallback to default or first language
              const defaultLang = languagesRes.data.find(l => l.isDefault) || languagesRes.data[0];
              setSelectedLanguage(defaultLang);
            }
          }
        } catch (error) {
          console.error('Failed to fetch regions/languages:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isOpen, region, language]);

  const handleSave = () => {
    if (selectedRegion && selectedLanguage) {
      // Convert API region code to SupportedRegion format (lowercase)
      const regionCode = selectedRegion.code.toLowerCase() as any;
      const languageCode = selectedLanguage.code.toLowerCase() as any;
      changeLocale(regionCode, languageCode);
      onClose();
    }
  };

  if (!isOpen) return null;

  // Show all regions and languages (they're already filtered by isActive in the API)
  const activeRegions = regions;
  const activeLanguages = languages;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('changeCurrencyLanguage')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Currency/Region Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('currency')}
            </label>
            <div className="relative">
              <button
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-500 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {selectedRegion?.image && (
                    <Image
                      src={selectedRegion.image}
                      alt={selectedRegion.country}
                      width={24}
                      height={18}
                      className="rounded-sm object-cover"
                    />
                  )}
                  <span className="text-gray-900 dark:text-white">
                    {selectedRegion?.country} ({selectedRegion?.currency})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                    {t('change')}
                  </span>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-gray-400 transition-transform",
                    showCurrencyDropdown && "rotate-180"
                  )} />
                </div>
              </button>

              {showCurrencyDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-dropdown z-10 animate-slide-down overflow-hidden max-h-64 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                    </div>
                  ) : activeRegions.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 text-center">No regions available</div>
                  ) : (
                    activeRegions.map((r) => (
                      <button
                        key={r.code}
                        onClick={() => {
                          setSelectedRegion(r);
                          setShowCurrencyDropdown(false);
                        }}
                        className={cn(
                          "flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors",
                          selectedRegion?.code === r.code && "bg-primary-50 dark:bg-primary-900/20"
                        )}
                      >
                        {r.image && (
                          <Image
                            src={r.image}
                            alt={r.country}
                            width={24}
                            height={18}
                            className="rounded-sm object-cover"
                          />
                        )}
                        <span className="text-gray-900 dark:text-white">
                          {r.country} ({r.currency})
                        </span>
                        {selectedRegion?.code === r.code && (
                          <Check className="w-4 h-4 text-primary-600 ml-auto" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('languageLabel')}
            </label>
            <div className="flex gap-3">
              {loading ? (
                <div className="flex items-center justify-center w-full p-4">
                  <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                </div>
              ) : activeLanguages.length === 0 ? (
                <div className="w-full p-4 text-sm text-gray-500 text-center">No languages available</div>
              ) : (
                activeLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-xl border transition-all flex-1",
                      selectedLanguage?.code === lang.code
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-primary-300"
                    )}
                  >
                    {lang.image && (
                      <Image
                        src={lang.image}
                        alt={lang.name}
                        width={24}
                        height={18}
                        className="rounded-sm object-cover"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {lang.name}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors"
          >
            {t('saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
}
