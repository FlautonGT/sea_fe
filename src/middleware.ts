import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEFAULT_LOCALE, isValidLocale, SUPPORTED_REGIONS, SupportedRegion } from '@/lib/locale';

// Routes that should not have locale prefix
const PUBLIC_FILES = [
  '/favicon.ico',
  '/logo.svg',
  '/robots.txt',
  '/sitemap.xml',
];

// Map country codes to supported regions
// ISO 3166-1 alpha-2 country codes
const COUNTRY_TO_REGION: Record<string, SupportedRegion> = {
  // Indonesia
  'ID': 'id',

  // Malaysia
  'MY': 'my',

  // Singapore
  'SG': 'sg',

  // Philippines
  'PH': 'ph',

  // Thailand
  'TH': 'th',
};

// Countries that primarily use Indonesian language
const INDONESIAN_SPEAKING_COUNTRIES = ['ID'];

// Function to detect country from request headers
function detectCountry(request: NextRequest): string | null {
  // 1. Vercel automatically adds this header
  const vercelCountry = request.headers.get('x-vercel-ip-country');
  if (vercelCountry) {
    return vercelCountry.toUpperCase();
  }

  // 2. Cloudflare adds this header
  const cloudflareCountry = request.headers.get('cf-ipcountry');
  if (cloudflareCountry) {
    return cloudflareCountry.toUpperCase();
  }

  // 3. Some other CDNs/proxies use these headers
  const geoCountry = request.headers.get('x-geo-country') ||
    request.headers.get('x-country-code') ||
    request.headers.get('geoip-country-code');
  if (geoCountry) {
    return geoCountry.toUpperCase();
  }

  // 4. For development/testing - check query param
  const url = new URL(request.url);
  const testCountry = url.searchParams.get('_country');
  if (testCountry) {
    return testCountry.toUpperCase();
  }

  return null;
}

// Function to detect preferred language from Accept-Language header
function detectLanguage(request: NextRequest, country: string | null): 'id' | 'en' {
  // If from Indonesia, default to Indonesian
  if (country && INDONESIAN_SPEAKING_COUNTRIES.includes(country)) {
    return 'id';
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',').map(lang => {
      const [code] = lang.trim().split(';');
      return code.split('-')[0].toLowerCase();
    });

    // Check if Indonesian is preferred
    if (languages.includes('id')) {
      return 'id';
    }
  }

  // Default to English for other countries
  return 'en';
}

// Function to get locale based on detected country
function getLocaleFromCountry(country: string | null, language: 'id' | 'en'): string {
  if (country && COUNTRY_TO_REGION[country]) {
    const region = COUNTRY_TO_REGION[country];
    return `${region}-${language}`;
  }

  // Default locale for unsupported countries
  return `${DEFAULT_LOCALE.region}-${DEFAULT_LOCALE.language}`;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public files, API routes, and admin panel
  if (
    PUBLIC_FILES.some((file) => pathname === file) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/panel-admin') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Get the first segment of the path
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0] || '';

  // Check if the first segment is a valid locale
  if (isValidLocale(firstSegment)) {
    // Valid locale in URL, continue
    return NextResponse.next();
  }

  // No valid locale in URL, need to detect and redirect

  // Check for test country parameter (for development/testing)
  const url = new URL(request.url);
  const testCountry = url.searchParams.get('_country');

  // 1. First, check if user has a saved preference in cookie (skip if testing)
  if (!testCountry) {
    const cookieLocale = request.cookies.get('SEA_LOCALE')?.value;
    if (cookieLocale && isValidLocale(cookieLocale)) {
      // Use saved preference
      const newUrl = new URL(`/${cookieLocale}${pathname}`, request.url);
      newUrl.search = request.nextUrl.search;
      return NextResponse.redirect(newUrl);
    }
  }

  // 2. Detect country from headers
  const detectedCountry = detectCountry(request);

  // 3. Detect preferred language
  const detectedLanguage = detectLanguage(request, detectedCountry);

  // 4. Get locale based on detected country and language
  const targetLocale = getLocaleFromCountry(detectedCountry, detectedLanguage);

  // Log for debugging (will show in server logs)
  console.log(`[Locale Detection] Country: ${detectedCountry || 'unknown'}, Language: ${detectedLanguage}, Locale: ${targetLocale}`);

  // Redirect to localized URL
  const newUrl = new URL(`/${targetLocale}${pathname}`, request.url);
  newUrl.search = request.nextUrl.search;

  // Set cookie to remember the auto-detected locale
  const response = NextResponse.redirect(newUrl);
  response.cookies.set('SEA_LOCALE', targetLocale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  });

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|logo.svg|.*\\..*).*)',
  ],
};
