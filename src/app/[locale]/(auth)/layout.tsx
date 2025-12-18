'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';
import Logo from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import { getRegions } from '@/lib/api';

// Map coordinates configuration
const MAP_CONFIG: Record<string, { x: number; y: number; scale: number; name: string; isFallback?: boolean }> = {
  ID: { x: 30.5, y: 76.5, scale: 1, name: 'Indonesia' },
  MY: { x: 21, y: 59.4, scale: 1.5, name: 'Malaysia' },
  SG: { x: 25, y: 62.4, scale: 5.0, name: 'Singapore' },
  PH: { x: 57.7, y: 37.8, scale: 2.5, name: 'Philippines' },
  TH: { x: 18.5, y: 39.6, scale: 2.5, name: 'Thailand' },
};

interface Region {
  code: string;
  country: string;
  currency: string;
  image: string;
  isDefault: boolean;
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getLocalizedPath } = useLocale();
  const [activeCountry, setActiveCountry] = React.useState<string | null>(null);
  const [countries, setCountries] = React.useState<Array<Region & { x: number; y: number; scale: number }>>([]);

  // Fetch regions on mount
  React.useEffect(() => {
    const loadRegions = async () => {
      try {
        const response = await getRegions();

        if (response.data && Array.isArray(response.data)) {
          // Merge API data with Map Config
          let mappedCountries = response.data
            .filter((region: any) => MAP_CONFIG[region.code])
            .map((region: any) => ({
              ...region,
              ...MAP_CONFIG[region.code]
            }));

          setCountries(mappedCountries);
        }
      } catch (error) {
        console.error('Failed to fetch regions:', error);
        // Fallback: Populate from MAP_CONFIG
        setCountries(Object.entries(MAP_CONFIG).map(([code, config]) => ({
          code,
          country: config.name,
          image: '',
          currency: '',
          isDefault: false,
          ...config
        })));
      }
    };

    loadRegions();
  }, []);

  // Calculate transform based on active country
  const getMapStyle = () => {
    // Default state: centered, scale 1
    if (!activeCountry) return {
      transform: 'translate(0%, 0%) scale(1)',
      transformOrigin: '0 0' // Top-left origin simplifies logic (optional if we handle math right, but let's be explicit)
    };

    const country = countries.find(c => c.country === activeCountry);
    // Fallback if country not found
    if (!country) return { transform: 'translate(0%, 0%) scale(1)', transformOrigin: '0 0' };

    // Calculate centering offsets
    // We want the point (country.x, country.y) to end up at (50, 50) on screen.
    // With origin at (0,0): FinalPos = Translate + (OriginalPos * Scale)
    // 50 = Translate + (country.x * country.scale)
    // Translate = 50 - (country.x * country.scale)

    const xOffset = 50 - (country.x * country.scale);
    const yOffset = 50 - (country.y * country.scale);

    return {
      transform: `translate(${xOffset}%, ${yOffset}%) scale(${country.scale})`,
      transformOrigin: '0 0'
    };
  };

  // Helper to keep pins constant size (counter-scale)
  const getPinScale = () => {
    if (!activeCountry) return 1;
    const country = countries.find(c => c.country === activeCountry);
    return country ? (1 / country.scale) : 1;
  };

  const pinScaleValue = getPinScale();

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left side - Interactive SEA Map (Desktop) */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-[#307ef8] overflow-hidden group">

        {/* Animated Map Container */}
        <div
          className="absolute inset-0 transition-transform duration-1000 cubic-bezier(0.25, 1, 0.5, 1) will-change-transform"
          style={getMapStyle()}
        >
          <Image
            src="/assets/images/sea_map.jpg"
            alt="Seaply SEA Coverage"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Global Reset Button */}
        <div
          className="absolute inset-0 z-10 cursor-default"
          onClick={() => setActiveCountry(null)}
        />

        {/* Content Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col items-start justify-between w-full px-12 pt-8 pb-12 h-full pointer-events-none">
          <Link href={getLocalizedPath('/')} className="block pointer-events-auto">
            <Logo className="h-10 w-auto brightness-0 invert" />
          </Link>

          <div className="absolute bottom-16 left-12 pointer-events-auto">
            <h1 className="text-4xl font-bold text-white leading-tight drop-shadow-lg">
              SEA Gaming Supply
            </h1>
          </div>
        </div>

        {/* Pins Container */}
        <div
          className="absolute inset-0 transition-transform duration-1000 cubic-bezier(0.25, 1, 0.5, 1) pointer-events-none z-30"
          style={getMapStyle()}
        >
          <div className="relative w-full h-full">
            {countries.map((country) => (
              <button
                key={country.code}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveCountry(activeCountry === country.country ? null : country.country);
                }}
                className={cn(
                  "absolute pointer-events-auto group/pin will-change-transform",
                  "transition-transform duration-1000 cubic-bezier(0.25, 1, 0.5, 1)",
                  activeCountry === country.country ? "z-50" : "hover:z-50 z-40"
                )}
                style={{
                  left: `${country.x}%`,
                  top: `${country.y}%`,
                  // Anchor at bottom-center (50% 100%) so the 'tip' of the pin stays on the coordinate
                  transformOrigin: '50% 100%',
                  // Translate -50% (x) to center horizontally
                  // Translate -100% (y) to move the whole pin UP so the bottom touches the coordinate
                  transform: `translate(-50%, -100%) scale(${pinScaleValue})`
                }}
              >
                {/* Pin Structure: Flag + Stick */}
                <div className="flex flex-col items-center">
                  {/* Visual Marker (Pulse) */}
                  <div className="relative flex-shrink-0 z-10">
                    <span className="absolute inset-0 inline-flex h-full w-full rounded-full bg-white opacity-20 animate-ping duration-1000"></span>
                    {/* Flag Circle */}
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border-[1.5px] border-white shadow-xl bg-slate-100 flex items-center justify-center transition-transform duration-300 group-hover/pin:scale-105">
                      {country.image ? (
                        <Image
                          src={country.image}
                          alt={country.country}
                          fill
                          className="object-cover"
                          sizes="36px"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-[10px]">📍</span>
                      )}
                    </div>
                  </div>

                  {/* The Stick (Garis) */}
                  <div className="w-[2px] h-6 bg-white/80 shadow-sm origin-top" />
                  {/* Optional Dot at bottom of stick */}
                  <div className="w-1 h-1 rounded-full bg-white/80 shadow-sm" />
                </div>

                {/* Country Name Label */}
                <div
                  className="absolute left-full top-0 ml-3 flex items-center h-9 pointer-events-none"
                >
                  <span className={cn(
                    "px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-lg text-xs font-bold text-blue-900 shadow-lg transition-all duration-700 ease-out whitespace-nowrap border border-white/20 origin-left",
                    activeCountry === country.country
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-8 group-hover/pin:opacity-100 group-hover/pin:translate-x-0"
                  )}>
                    {country.country}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form Container with ScrollFix */}
      <div className="flex-1 flex flex-col min-h-screen bg-white dark:bg-gray-900 relative overflow-y-auto h-screen">
        {/* Mobile Header (Logo) */}
        <div className="lg:hidden w-full p-6 flex justify-center z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 sticky top-0">
          <Link href={getLocalizedPath('/')}>
            <Logo className="h-8 w-auto" />
          </Link>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 flex items-center justify-center py-10 px-6 md:px-12">
          <div className="w-full max-w-lg mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
