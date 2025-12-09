import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number, currency: string): string {
  const formats: Record<string, { locale: string; symbol: string }> = {
    IDR: { locale: 'id-ID', symbol: 'Rp' },
    MYR: { locale: 'ms-MY', symbol: 'RM' },
    PHP: { locale: 'en-PH', symbol: '₱' },
    SGD: { locale: 'en-SG', symbol: 'S$' },
    THB: { locale: 'th-TH', symbol: '฿' },
  };

  const format = formats[currency] || formats.IDR;
  
  return new Intl.NumberFormat(format.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

export function formatDate(dateString: string, locale: string = 'id-ID'): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(dateString: string, locale: string = 'id-ID'): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getTimeRemaining(expiredAt: string): {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
} {
  const now = new Date().getTime();
  const expiry = new Date(expiredAt).getTime();
  const diff = expiry - now;

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, isExpired: false };
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    SUCCESS: 'text-green-600 bg-green-50',
    PROCESSING: 'text-yellow-600 bg-yellow-50',
    PENDING: 'text-orange-600 bg-orange-50',
    FAILED: 'text-red-600 bg-red-50',
    EXPIRED: 'text-gray-600 bg-gray-100',
    PAID: 'text-green-600 bg-green-50',
    UNPAID: 'text-orange-600 bg-orange-50',
    ACTIVE: 'text-green-600 bg-green-50',
    INACTIVE: 'text-gray-600 bg-gray-100',
    SUSPENDED: 'text-red-600 bg-red-50',
  };
  return colors[status] || 'text-gray-600 bg-gray-100';
}

export function getStatusText(status: string, locale: string = 'id'): string {
  const texts: Record<string, Record<string, string>> = {
    id: {
      SUCCESS: 'Sukses',
      PROCESSING: 'Diproses',
      PENDING: 'Menunggu',
      FAILED: 'Gagal',
      EXPIRED: 'Kadaluarsa',
      PAID: 'Dibayar',
      UNPAID: 'Belum Bayar',
      ACTIVE: 'Aktif',
      INACTIVE: 'Tidak Aktif',
      SUSPENDED: 'Ditangguhkan',
    },
    en: {
      SUCCESS: 'Success',
      PROCESSING: 'Processing',
      PENDING: 'Pending',
      FAILED: 'Failed',
      EXPIRED: 'Expired',
      PAID: 'Paid',
      UNPAID: 'Unpaid',
      ACTIVE: 'Active',
      INACTIVE: 'Inactive',
      SUSPENDED: 'Suspended',
    },
  };
  return texts[locale]?.[status] || status;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateInitials(firstName: string, lastName?: string): string {
  const first = firstName.charAt(0).toUpperCase();
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return first + last;
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePhone(phone: string): boolean {
  const re = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
  return re.test(phone);
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Convert to +62 format
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  
  return '+' + cleaned;
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard
    .writeText(text)
    .then(() => true)
    .catch(() => false);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}

export function removeLocalStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

