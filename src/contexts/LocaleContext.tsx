'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  SupportedRegion,
  SupportedLanguage,
  Locale,
  createLocaleString,
  getRegionCode,
  getCurrency,
  getFlagUrl,
  getLanguageFlagUrl,
  REGION_COUNTRY,
  LANGUAGE_NAMES,
  SUPPORTED_REGIONS,
  SUPPORTED_LANGUAGES,
} from '@/lib/locale';
import { getRegions, getLanguages } from '@/lib/api';
import { Region, Language } from '@/types';

interface LocaleContextType {
  region: SupportedRegion;
  language: SupportedLanguage;
  locale: Locale;
  localeString: string;
  regionCode: string;
  currency: string;
  flagUrl: string;
  languageFlagUrl: string;
  countryName: string;
  languageName: string;
  supportedRegions: typeof SUPPORTED_REGIONS;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
  changeLocale: (newRegion?: SupportedRegion, newLanguage?: SupportedLanguage) => void;
  changeRegion: (newRegion: SupportedRegion) => void;
  changeLanguage: (newLanguage: SupportedLanguage) => void;
  getLocalizedPath: (path: string) => string;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: React.ReactNode;
  initialRegion: SupportedRegion;
  initialLanguage: SupportedLanguage;
}

export function LocaleProvider({
  children,
  initialRegion,
  initialLanguage,
}: LocaleProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const region = initialRegion;
  const language = initialLanguage;
  const locale: Locale = { region, language };
  const localeString = createLocaleString(locale);
  const regionCode = getRegionCode(region);

  // Fetch region and language data from API for flag URLs
  const [regions, setRegions] = useState<Region[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoadingLocaleData, setIsLoadingLocaleData] = useState(true);

  // Fetch regions and languages on mount
  useEffect(() => {
    const fetchLocaleData = async () => {
      try {
        const [regionsRes, languagesRes] = await Promise.all([
          getRegions(),
          getLanguages(),
        ]);

        if (regionsRes.data && Array.isArray(regionsRes.data)) {
          setRegions(regionsRes.data);
        }
        if (languagesRes.data && Array.isArray(languagesRes.data)) {
          setLanguages(languagesRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch locale data:', error);
      } finally {
        setIsLoadingLocaleData(false);
      }
    };

    fetchLocaleData();
  }, []);

  // Get current region data from API
  const currentRegionData = regions.find(r => r.code.toLowerCase() === region) || null;
  const currentLanguageData = languages.find(l => l.code.toLowerCase() === language) || null;

  // Use API image if available, otherwise fallback to hardcoded
  const flagUrl = currentRegionData?.image || getFlagUrl(region);
  const languageFlagUrl = currentLanguageData?.image || getLanguageFlagUrl(language);
  const currency = currentRegionData?.currency || getCurrency(region);
  const countryName = currentRegionData?.country || REGION_COUNTRY[region][language];
  const languageName = currentLanguageData?.name || LANGUAGE_NAMES[language][language];

  // Set locale cookie when locale changes
  useEffect(() => {
    document.cookie = `SEA_LOCALE=${localeString};path=/;max-age=31536000;SameSite=Lax`;
  }, [localeString]);

  // Get path without locale prefix
  const getPathWithoutLocale = useCallback((path: string): string => {
    const segments = path.split('/').filter(Boolean);
    if (segments.length > 0) {
      // Check if first segment is a locale
      const firstSegment = segments[0];
      if (firstSegment.includes('-') && firstSegment.length === 5) {
        return '/' + segments.slice(1).join('/');
      }
    }
    return path;
  }, []);

  // Get localized path
  const getLocalizedPath = useCallback(
    (path: string): string => {
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      const pathWithoutLocale = getPathWithoutLocale(cleanPath);
      return `/${localeString}${pathWithoutLocale}`;
    },
    [localeString, getPathWithoutLocale]
  );

  // Change both region and language
  const changeLocale = useCallback(
    (newRegion?: SupportedRegion, newLanguage?: SupportedLanguage) => {
      const targetRegion = newRegion || region;
      const targetLanguage = newLanguage || language;
      const newLocaleString = `${targetRegion}-${targetLanguage}`;

      // Get current path without locale
      const currentPathWithoutLocale = getPathWithoutLocale(pathname);

      // Navigate to new locale
      router.push(`/${newLocaleString}${currentPathWithoutLocale}`);
    },
    [region, language, pathname, router, getPathWithoutLocale]
  );

  // Change only region
  const changeRegion = useCallback(
    (newRegion: SupportedRegion) => {
      changeLocale(newRegion, language);
    },
    [changeLocale, language]
  );

  // Change only language
  const changeLanguage = useCallback(
    (newLanguage: SupportedLanguage) => {
      changeLocale(region, newLanguage);
    },
    [changeLocale, region]
  );

  // Translation function using lazy-loaded translations
  const t = useCallback(
    (key: string): string => {
      // We'll import translations dynamically
      // For now, return the key - actual translation handled in useTranslation hook
      return key;
    },
    []
  );

  return (
    <LocaleContext.Provider
      value={{
        region,
        language,
        locale,
        localeString,
        regionCode,
        currency,
        flagUrl,
        languageFlagUrl,
        countryName,
        languageName,
        supportedRegions: SUPPORTED_REGIONS,
        supportedLanguages: SUPPORTED_LANGUAGES,
        changeLocale,
        changeRegion,
        changeLanguage,
        getLocalizedPath,
        t,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

// Custom hook for translations
export function useTranslation() {
  const { language } = useLocale();

  const t = useCallback(
    (key: string): string => {
      // Import translations synchronously (they're already bundled)
      const translations = require('@/lib/translations').translations;
      const lang = language === 'en' ? 'en' : 'id';
      return translations[lang]?.[key] || key;
    },
    [language]
  );

  return { t, language };
}

