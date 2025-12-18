'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { getRegions } from '@/lib/api';
import { Region } from '@/types';
import Image from 'next/image';

interface PhoneInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  defaultCountryCode?: string;
  required?: boolean;
}

// Mapping region code to phone code
const REGION_PHONE_CODE: Record<string, string> = {
  'ID': '+62',
  'MY': '+60',
  'PH': '+63',
  'SG': '+65',
  'TH': '+66',
};

// Phone number validation and formatting rules
const PHONE_RULES: Record<string, { min: number; max: number; format: (digits: string) => string; placeholder: string }> = {
  'ID': {
    min: 10,
    max: 13,
    placeholder: '812-3456-7890',
    format: (digits: string) => {
      // Indonesia: 812-3456-7890 (min 10, max 12-13 digit)
      if (digits.length <= 3) return digits;
      if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      if (digits.length <= 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}-${digits.slice(11)}`;
    }
  },
  'MY': {
    min: 9,
    max: 10,
    placeholder: '12-345-6789',
    format: (digits: string) => {
      // Malaysia: 12-345-6789 (min 9, max 10 digit)
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
      if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
      return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5, 9)}-${digits.slice(9)}`;
    }
  },
  'PH': {
    min: 10,
    max: 10,
    placeholder: '912-345-6789',
    format: (digits: string) => {
      // Filipina: 912-345-6789 (min 10, max 10 digit)
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  },
  'SG': {
    min: 8,
    max: 8,
    placeholder: '8123-4567',
    format: (digits: string) => {
      // Singapura: 8123-4567 (min 8, max 8 digit)
      if (digits.length <= 4) return digits;
      return `${digits.slice(0, 4)}-${digits.slice(4, 8)}`;
    }
  },
  'TH': {
    min: 9,
    max: 10,
    placeholder: '81-234-5678',
    format: (digits: string) => {
      // Thailand: 81-234-5678 (min 9, max 10 digit)
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
      if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
      return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5, 9)}-${digits.slice(9)}`;
    }
  },
};

// Format phone number display based on region
function formatPhoneDisplay(phone: string, regionCode: string): string {
  const digits = phone.replace(/\D/g, '');
  const rule = PHONE_RULES[regionCode];
  if (!rule) return digits;

  return rule.format(digits);
}

// Get placeholder based on region
function getPhonePlaceholder(regionCode: string): string {
  return PHONE_RULES[regionCode]?.placeholder || '812345678';
}

// Strip country code or leading 0 from phone number
function cleanPhoneInput(input: string, regionCode: string): string {
  let cleaned = input.replace(/\D/g, ''); // Remove all non-digits

  // Remove country code if user typed it
  const phoneCode = REGION_PHONE_CODE[regionCode]?.replace('+', '') || '';
  if (cleaned.startsWith(phoneCode)) {
    cleaned = cleaned.slice(phoneCode.length);
  }

  // Remove leading 0 (national prefix) for countries that use it
  // Indonesia, Malaysia, Filipina, Thailand use 0 as national prefix
  // Singapore does NOT use 0
  if (regionCode !== 'SG' && cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }

  return cleaned;
}

// Validate phone number length
function validatePhoneLength(digits: string, regionCode: string): boolean {
  const rule = PHONE_RULES[regionCode];
  if (!rule) return true;

  return digits.length >= rule.min && digits.length <= rule.max;
}

export default function PhoneInput({
  label,
  value,
  onChange,
  error,
  placeholder,
  defaultCountryCode = '+62',
  required = false,
}: PhoneInputProps) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('ID'); // Use region code, not phone code
  const [phoneNumber, setPhoneNumber] = useState<string>(''); // Store clean number (no dashes)
  const [displayNumber, setDisplayNumber] = useState<string>(''); // Display formatted number (with dashes)
  const [phonePlaceholder, setPhonePlaceholder] = useState<string>('812-3456-7890'); // Dynamic placeholder
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  // Fetch regions on mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await getRegions();
        if (response.data && Array.isArray(response.data)) {
          setRegions(response.data);
          // Set default region based on phone code
          const defaultRegion = response.data.find(
            (r) => REGION_PHONE_CODE[r.code] === defaultCountryCode
          );
          if (defaultRegion) {
            setSelectedRegion(defaultRegion.code);
          }
        }
      } catch (error) {
        console.error('Failed to fetch regions:', error);
      }
    };
    fetchRegions();
  }, [defaultCountryCode]);

  // Track previous value to detect external changes
  const prevValueRef = useRef(value);

  // Sync internal state with value prop
  useEffect(() => {
    // If regions not loaded yet, we can't parse efficiently, so wait.
    if (regions.length === 0) return;

    const propChanged = value !== prevValueRef.current;

    // We sync if:
    // 1. The prop has actually changed (external update or parent echo)
    // 2. OR we haven't initialized yet (first load or waiting for regions)
    if (propChanged || !isInitialized.current) {
      prevValueRef.current = value;

      // Construct what our current internal state represents
      const currentCode = REGION_PHONE_CODE[selectedRegion] || defaultCountryCode;
      // Use a functional check or rely on closure state? 
      // Since we don't want to depend on phoneNumber/selectedRegion triggering this effect,
      // we use the values available in the closure. 
      // Note: This relies on 'selectedRegion' and 'phoneNumber' being fresh enough.
      // But since this effect only runs when 'value' or 'regions' changes, 
      // during high-frequency typing 'value' changes on every stroke (echo),
      // so we will have fresh closure values.
      const currentInternalValue = phoneNumber ? `${currentCode}${phoneNumber}` : '';

      // If the incoming value matches what we already have, it's an echo. Do nothing.
      // This prevents cursor jumping and race conditions.
      if (value === currentInternalValue && isInitialized.current) return;

      // Mismatch or First Load -> Sync Internal State to Prop
      if (value) {
        let foundRegion = '';
        let numberToParse = value;

        // Try to match start with known region codes
        for (const [regionCode, phoneCode] of Object.entries(REGION_PHONE_CODE)) {
          if (value.startsWith(phoneCode)) {
            foundRegion = regionCode;
            numberToParse = value.slice(phoneCode.length);
            break;
          }
        }

        // If we found a region in the number, switch to it. 
        // Otherwise keep current default/selected.
        const regionToUse = foundRegion || selectedRegion;

        if (foundRegion) {
          setSelectedRegion(foundRegion);
        }

        const cleanNumber = cleanPhoneInput(numberToParse, regionToUse);
        setPhoneNumber(cleanNumber);
        isInitialized.current = true;
      } else {
        // Value cleared externally
        setPhoneNumber('');
        setDisplayNumber('');
        // Keep isInitialized true as we are engaging
      }
    }
  }, [value, regions]); // Intentionally omit selectedRegion/phoneNumber to avoid typing loops

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update placeholder when region changes
  useEffect(() => {
    setPhonePlaceholder(getPhonePlaceholder(selectedRegion));
  }, [selectedRegion]);

  // Update display number format when phone number or region changes
  useEffect(() => {
    if (phoneNumber) {
      setDisplayNumber(formatPhoneDisplay(phoneNumber, selectedRegion));
    } else {
      setDisplayNumber('');
    }
  }, [phoneNumber, selectedRegion]);

  // Update parent value when phone number or region changes
  useEffect(() => {
    if (!isInitialized.current) return; // Skip if not initialized yet

    const phoneCode = REGION_PHONE_CODE[selectedRegion] || defaultCountryCode;
    const fullPhoneNumber = phoneNumber ? `${phoneCode}${phoneNumber}` : '';

    // Only call onChange if the value actually changed (to avoid loops)
    if (fullPhoneNumber !== value) {
      onChange(fullPhoneNumber);
    }
  }, [phoneNumber, selectedRegion, value, onChange, defaultCountryCode]);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Clean input: remove country code, leading 0, and non-digits
    let cleanNumber = cleanPhoneInput(inputValue, selectedRegion);

    // Get max length for current region
    const rule = PHONE_RULES[selectedRegion];
    const maxLength = rule?.max || 13;

    // Limit to max length
    if (cleanNumber.length > maxLength) {
      cleanNumber = cleanNumber.slice(0, maxLength);
    }

    // Store clean number (no dashes) - displayNumber will be updated by useEffect
    setPhoneNumber(cleanNumber);
    isInitialized.current = true; // Mark as initialized when user types
  };

  const handleRegionSelect = (regionCode: string) => {
    setSelectedRegion(regionCode);
    // Display number will be reformatted by useEffect when selectedRegion changes
    setIsDropdownOpen(false);
  };

  const selectedRegionData = regions.find((r) => r.code === selectedRegion);
  const phoneCode = REGION_PHONE_CODE[selectedRegion] || defaultCountryCode;
  const selectedRegionDisplay = selectedRegionData
    ? {
      code: phoneCode,
      flag: selectedRegionData.image || '',
      country: selectedRegionData.country,
    }
    : {
      code: defaultCountryCode,
      flag: '',
      country: 'Indonesia',
    };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative group" ref={dropdownRef}>
        <div className={`flex rounded-xl bg-gray-50 dark:bg-gray-800/50 border transition-all duration-300 ${error
          ? 'border-red-500 focus-within:ring-red-100 dark:focus-within:ring-red-900/30 focus-within:border-red-500'
          : 'border-gray-200 dark:border-gray-700 focus-within:ring-4 focus-within:ring-primary-100 dark:focus-within:ring-primary-900/30 focus-within:border-primary-500'
          }`}>
          {/* Country Code Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDropdownOpen((prev) => !prev);
              }}
              className="flex items-center gap-2 pl-4 pr-3 py-3.5 bg-transparent border-r border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors rounded-l-xl cursor-pointer h-full"
            >
              {selectedRegionDisplay.flag && (
                <div className="relative w-6 h-4 flex-shrink-0">
                  <Image
                    src={selectedRegionDisplay.flag}
                    alt={selectedRegionDisplay.country}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {selectedRegionDisplay.code}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Phone Number Input */}
          <input
            type="tel"
            value={displayNumber}
            onChange={handlePhoneNumberChange}
            placeholder={phonePlaceholder}
            className="flex-1 px-4 py-3.5 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 rounded-r-xl"
          />
        </div>

        {/* Dropdown - positioned outside the input container */}
        {isDropdownOpen && (
          <div
            className="absolute top-full left-0 z-[50] mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
          >
            {regions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                Loading regions...
              </div>
            ) : (
              regions
                .filter((r) => REGION_PHONE_CODE[r.code])
                .map((region) => {
                  const code = REGION_PHONE_CODE[region.code] || '';
                  return (
                    <button
                      key={region.code}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRegionSelect(region.code);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b last:border-0 border-gray-50 dark:border-gray-700/50 ${selectedRegion === region.code
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : ''
                        }`}
                    >
                      {region.image && (
                        <div className="relative w-6 h-4 flex-shrink-0">
                          <Image
                            src={region.image}
                            alt={region.country}
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {region.country}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {code}
                      </span>
                    </button>
                  );
                })
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 font-medium animate-in slide-in-from-top-1 px-1">{error}</p>
      )}
    </div>
  );
}

