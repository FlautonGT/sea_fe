'use client';

import React from 'react';
import AdminModal from './Modal';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <AdminModal
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      maxWidthClass="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors',
              loading && 'opacity-60 cursor-not-allowed',
              confirmVariant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-primary hover:bg-primary/90'
            )}
          >
            {loading ? 'Memproses...' : confirmText}
          </button>
        </div>
      }
    >
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
    </AdminModal>
  );
}


