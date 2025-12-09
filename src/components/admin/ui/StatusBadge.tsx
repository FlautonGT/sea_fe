'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 
  | 'success' | 'SUCCESS' | 'PAID' | 'ACTIVE' | 'HEALTHY'
  | 'pending' | 'PENDING' | 'PROCESSING' | 'UNPAID'
  | 'warning' | 'WARNING' | 'DEGRADED' | 'LIMITED' | 'INACTIVE'
  | 'error' | 'ERROR' | 'FAILED' | 'EXPIRED' | 'SUSPENDED' | 'DOWN' | 'OUT_OF_STOCK';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusStyles: Record<string, string> = {
  // Success states
  success: 'bg-green-100 text-green-700',
  SUCCESS: 'bg-green-100 text-green-700',
  PAID: 'bg-green-100 text-green-700',
  ACTIVE: 'bg-green-100 text-green-700',
  HEALTHY: 'bg-green-100 text-green-700',
  AVAILABLE: 'bg-green-100 text-green-700',

  // Pending/Processing states
  pending: 'bg-yellow-100 text-yellow-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  UNPAID: 'bg-yellow-100 text-yellow-700',

  // Warning states
  warning: 'bg-orange-100 text-orange-700',
  WARNING: 'bg-orange-100 text-orange-700',
  DEGRADED: 'bg-orange-100 text-orange-700',
  LIMITED: 'bg-orange-100 text-orange-700',
  INACTIVE: 'bg-gray-100 text-gray-700',

  // Error states
  error: 'bg-red-100 text-red-700',
  ERROR: 'bg-red-100 text-red-700',
  FAILED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-red-100 text-red-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  DOWN: 'bg-red-100 text-red-700',
  OUT_OF_STOCK: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  SUCCESS: 'Sukses',
  PAID: 'Dibayar',
  ACTIVE: 'Aktif',
  HEALTHY: 'Sehat',
  AVAILABLE: 'Tersedia',
  PENDING: 'Pending',
  PROCESSING: 'Diproses',
  UNPAID: 'Belum Dibayar',
  WARNING: 'Peringatan',
  DEGRADED: 'Terganggu',
  LIMITED: 'Terbatas',
  INACTIVE: 'Tidak Aktif',
  ERROR: 'Error',
  FAILED: 'Gagal',
  EXPIRED: 'Kadaluarsa',
  SUSPENDED: 'Ditangguhkan',
  DOWN: 'Down',
  OUT_OF_STOCK: 'Habis',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export default function StatusBadge({
  status,
  label,
  size = 'md',
}: StatusBadgeProps) {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-700';
  const displayLabel = label || statusLabels[status] || status;

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        style,
        sizeStyles[size]
      )}
    >
      {displayLabel}
    </span>
  );
}

