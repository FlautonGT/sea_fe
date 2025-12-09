// Locale configuration and utilities

export const SUPPORTED_REGIONS = ['id', 'my', 'ph', 'sg', 'th'] as const;
export const SUPPORTED_LANGUAGES = ['id', 'en'] as const;

export type SupportedRegion = (typeof SUPPORTED_REGIONS)[number];
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export interface Locale {
  region: SupportedRegion;
  language: SupportedLanguage;
}

export const DEFAULT_LOCALE: Locale = {
  region: 'id',
  language: 'id',
};

// Region to currency mapping
export const REGION_CURRENCY: Record<SupportedRegion, string> = {
  id: 'IDR',
  my: 'MYR',
  ph: 'PHP',
  sg: 'SGD',
  th: 'THB',
};

// Region to country name mapping
export const REGION_COUNTRY: Record<SupportedRegion, { id: string; en: string }> = {
  id: { id: 'Indonesia', en: 'Indonesia' },
  my: { id: 'Malaysia', en: 'Malaysia' },
  ph: { id: 'Filipina', en: 'Philippines' },
  sg: { id: 'Singapura', en: 'Singapore' },
  th: { id: 'Thailand', en: 'Thailand' },
};

// Language display names
export const LANGUAGE_NAMES: Record<SupportedLanguage, { id: string; en: string }> = {
  id: { id: 'Bahasa Indonesia', en: 'Indonesian' },
  en: { id: 'English', en: 'English' },
};

// Parse locale string like "id-id" to Locale object
export function parseLocale(localeString: string): Locale {
  const parts = localeString.toLowerCase().split('-');
  
  const region = SUPPORTED_REGIONS.includes(parts[0] as SupportedRegion)
    ? (parts[0] as SupportedRegion)
    : DEFAULT_LOCALE.region;
    
  const language = SUPPORTED_LANGUAGES.includes(parts[1] as SupportedLanguage)
    ? (parts[1] as SupportedLanguage)
    : DEFAULT_LOCALE.language;

  return { region, language };
}

// Create locale string from Locale object
export function createLocaleString(locale: Locale): string {
  return `${locale.region}-${locale.language}`;
}

// Validate if a locale string is valid
export function isValidLocale(localeString: string): boolean {
  const parts = localeString.toLowerCase().split('-');
  return (
    parts.length === 2 &&
    SUPPORTED_REGIONS.includes(parts[0] as SupportedRegion) &&
    SUPPORTED_LANGUAGES.includes(parts[1] as SupportedLanguage)
  );
}

// Get all valid locale combinations
export function getAllLocales(): string[] {
  const locales: string[] = [];
  for (const region of SUPPORTED_REGIONS) {
    for (const language of SUPPORTED_LANGUAGES) {
      locales.push(`${region}-${language}`);
    }
  }
  return locales;
}

// Get region code in uppercase (for API calls)
export function getRegionCode(region: SupportedRegion): string {
  return region.toUpperCase();
}

// Get currency for region
export function getCurrency(region: SupportedRegion): string {
  return REGION_CURRENCY[region];
}

// Get flag image URL for region
export function getFlagUrl(region: SupportedRegion): string {
  return `https://nos.jkt-1.neo.id/gate/flags/${region}.svg`;
}

// Get language flag URL
export function getLanguageFlagUrl(language: SupportedLanguage): string {
  if (language === 'en') {
    return 'https://nos.jkt-1.neo.id/gate/flags/us.svg';
  }
  return `https://nos.jkt-1.neo.id/gate/flags/${language}.svg`;
}

