'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { resetPassword } from '@/lib/api';
import Logo from '@/components/ui/Logo';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { regionCode, getLocalizedPath } = useLocale();
  const { t, language } = useTranslation();

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.newPassword) {
      newErrors.newPassword = language === 'id' ? 'Kata sandi baru wajib diisi' : 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = language === 'id' ? 'Kata sandi minimal 8 karakter' : 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = language === 'id' ? 'Konfirmasi kata sandi wajib diisi' : 'Confirm password is required';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = language === 'id' ? 'Kata sandi tidak cocok' : 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    if (!token) {
      setApiError(language === 'id' ? 'Token reset password tidak ditemukan' : 'Reset password token not found');
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const response = await resetPassword(token, formData.newPassword, formData.confirmPassword);

      if (response.error) {
        if (response.error.code === 'INVALID_TOKEN' || response.error.code === 'TOKEN_EXPIRED') {
          setApiError(
            language === 'id'
              ? 'Token reset password tidak valid atau sudah kadaluarsa. Silakan request reset password baru.'
              : 'Reset password token is invalid or expired. Please request a new password reset.'
          );
        } else {
          setApiError(response.error.message || (language === 'id' ? 'Terjadi kesalahan' : 'An error occurred'));
        }
        return;
      }

      if (response.data) {
        setIsSuccess(true);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setApiError(language === 'id' ? 'Terjadi kesalahan' : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {language === 'id' ? 'Password Berhasil Direset!' : 'Password Reset Successfully!'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {language === 'id'
            ? 'Password Anda berhasil diubah. Silakan login dengan password baru Anda.'
            : 'Your password has been changed successfully. Please login with your new password.'}
        </p>
        <Link href={getLocalizedPath('/login')}>
          <Button fullWidth>
            {language === 'id' ? 'Masuk ke Akun' : 'Go to Login'}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Logo for desktop */}
      <div className="hidden lg:flex justify-center mb-8">
        <Link href={getLocalizedPath('/')}>
          <Logo className="h-10 w-auto" />
        </Link>
      </div>

      <Link
        href={getLocalizedPath('/login')}
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('backToLogin')}
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {language === 'id' ? 'Reset Password' : 'Reset Password'}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {language === 'id'
          ? 'Masukkan kata sandi baru untuk akun Anda'
          : 'Enter a new password for your account'}
      </p>

      {apiError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Input
            label={language === 'id' ? 'Kata Sandi Baru' : 'New Password'}
            type={showPassword ? 'text' : 'password'}
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder={language === 'id' ? 'Masukkan kata sandi baru' : 'Enter new password'}
            error={errors.newPassword}
            autoComplete="new-password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
          />
        </div>

        <div>
          <Input
            label={language === 'id' ? 'Konfirmasi Kata Sandi' : 'Confirm Password'}
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder={language === 'id' ? 'Konfirmasi kata sandi baru' : 'Confirm new password'}
            error={errors.confirmPassword}
            autoComplete="new-password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
          />
        </div>

        <Button type="submit" fullWidth isLoading={isLoading}>
          {language === 'id' ? 'Reset Password' : 'Reset Password'}
        </Button>
      </form>
    </div>
  );
}

