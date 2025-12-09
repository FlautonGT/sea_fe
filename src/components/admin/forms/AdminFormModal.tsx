'use client';

import React, { useEffect, useState } from 'react';
import { AdminModal } from '@/components/admin/ui';
import { Admin, AdminRole } from '@/types/admin';
import { createAdmin, updateAdmin, getRoles } from '@/lib/adminApi';
import { Loader2 } from 'lucide-react';

interface AdminFormState {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  roleCode: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

const defaultAdminState: AdminFormState = {
  name: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  roleCode: '',
  status: 'ACTIVE',
};

interface AdminFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: Admin | null;
  onSuccess?: () => void;
}

export default function AdminFormModal({
  open,
  onClose,
  initialData,
  onSuccess,
}: AdminFormModalProps) {
  const [form, setForm] = useState<AdminFormState>(defaultAdminState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          name: initialData.name || '',
          email: initialData.email || '',
          phoneNumber: initialData.phoneNumber || '',
          password: '',
          confirmPassword: '',
          roleCode: initialData.role?.code || '',
          status: initialData.status || 'ACTIVE',
        });
      } else {
        setForm(defaultAdminState);
      }
      setError('');

      // Load roles
      loadRoles();
    }
  }, [open, initialData]);

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      const data = await getRoles();
      setRoles(data || []);
    } catch (err) {
      console.error('Failed to load roles', err);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleChange = (key: keyof AdminFormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!initialData) {
        // Create mode - password required
        if (!form.password) {
          throw new Error('Password wajib diisi');
        }
        if (form.password.length < 8) {
          throw new Error('Password minimal 8 karakter');
        }
        if (form.password !== form.confirmPassword) {
          throw new Error('Password tidak sama');
        }
      } else {
        // Update mode - password optional
        if (form.password && form.password.length < 8) {
          throw new Error('Password minimal 8 karakter');
        }
        if (form.password && form.password !== form.confirmPassword) {
          throw new Error('Password tidak sama');
        }
      }

      if (!form.roleCode) {
        throw new Error('Role wajib dipilih');
      }

      const payload: any = {
        name: form.name.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim() || undefined,
        roleCode: form.roleCode,
        status: form.status,
      };

      if (!initialData) {
        // Create
        payload.password = form.password;
        await createAdmin(payload);
      } else {
        // Update
        if (form.password) {
          payload.password = form.password;
        }
        await updateAdmin(initialData.id, payload);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminModal
      open={open}
      onClose={loading ? () => null : onClose}
      title={initialData ? 'Edit Admin' : 'Tambah Admin'}
      description="Kelola akun administrator"
      maxWidthClass="max-w-2xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Batal
          </button>
          <button
            type="submit"
            form="admin-form"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      }
    >
      <form id="admin-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-sm text-red-700">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="John Doe"
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="admin@seaply.co"
            required
            disabled={!!initialData}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          />
          {initialData && (
            <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nomor Telepon
          </label>
          <input
            type="tel"
            value={form.phoneNumber}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            placeholder="+628123456789"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Role <span className="text-red-500">*</span>
          </label>
          {loadingRoles ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Memuat roles...
            </div>
          ) : (
            <select
              value={form.roleCode}
              onChange={(e) => handleChange('roleCode', e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Pilih Role</option>
              {roles.map((role) => (
                <option key={role.code} value={role.code}>
                  {role.name} (Level {role.level})
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Password {!initialData && <span className="text-red-500">*</span>}
            {initialData && <span className="text-xs text-gray-500">(kosongkan jika tidak ingin mengubah)</span>}
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder={initialData ? '••••••••' : 'Minimal 8 karakter'}
            required={!initialData}
            minLength={initialData ? 0 : 8}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {(form.password || !initialData) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Konfirmasi Password {!initialData && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="Ulangi password"
              required={!initialData || !!form.password}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value as AdminFormState['status'])}
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Tidak Aktif</option>
            <option value="SUSPENDED">Ditangguhkan</option>
          </select>
        </div>
      </form>
    </AdminModal>
  );
}

