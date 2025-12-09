'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Camera, Mail, Phone, Shield, Save } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { updateUserProfile, changePassword } from '@/lib/api';
import { generateInitials } from '@/lib/utils';

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth();
  const { regionCode, language } = useLocale();
  const { t } = useTranslation();

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsUpdating(true);
    setProfileMessage('');

    try {
      const formData = new FormData();
      formData.append('firstName', profileData.firstName);
      formData.append('lastName', profileData.lastName);
      if (profileData.phoneNumber) {
        formData.append('phoneNumber', profileData.phoneNumber);
      }
      formData.append('region', regionCode);

      const response = await updateUserProfile(
        formData,
        token.accessToken
      );

      if (response.error) {
        setProfileMessage(response.error.message);
      } else if (response.data) {
        updateUser(response.data);
        setProfileMessage(language === 'id' ? 'Profil berhasil diperbarui' : 'Profile updated successfully');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setProfileMessage(language === 'id' ? 'Gagal memperbarui profil' : 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setPasswordError('');
    setPasswordMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(language === 'id' ? 'Kata sandi tidak cocok' : 'Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError(language === 'id' ? 'Kata sandi minimal 8 karakter' : 'Password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        regionCode,
        token.accessToken
      );

      if (response.error) {
        setPasswordError(response.error.message);
      } else {
        setPasswordMessage(language === 'id' ? 'Kata sandi berhasil diubah' : 'Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Change password error:', error);
      setPasswordError(language === 'id' ? 'Gagal mengubah kata sandi' : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {t('profile')}
        </h1>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            {user.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt={user.firstName}
                width={96}
                height={96}
                className="rounded-full"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold">
                {generateInitials(user.firstName, user.lastName)}
              </div>
            )}
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <Mail className="w-4 h-4" />
              {user.email}
              {user.emailVerifiedAt && (
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded-full">
                  {language === 'id' ? 'Terverifikasi' : 'Verified'}
                </span>
              )}
            </div>
            {user.phoneNumber && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                <Phone className="w-4 h-4" />
                {user.phoneNumber}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Update Profile Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('updateProfile')}
        </h2>

        {profileMessage && (
          <div className={`mb-4 p-4 rounded-xl ${
            profileMessage.includes('berhasil') || profileMessage.includes('success')
              ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
          }`}>
            {profileMessage}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('firstName')}
              value={profileData.firstName}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, firstName: e.target.value }))
              }
            />
            <Input
              label={t('lastName')}
              value={profileData.lastName}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, lastName: e.target.value }))
              }
            />
          </div>
          <Input
            label={t('phoneNumber')}
            type="tel"
            value={profileData.phoneNumber}
            onChange={(e) =>
              setProfileData((prev) => ({ ...prev, phoneNumber: e.target.value }))
            }
          />
          <Button type="submit" isLoading={isUpdating}>
            <Save className="w-4 h-4 mr-2" />
            {t('saveChanges')}
          </Button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          <Shield className="w-5 h-5 inline mr-2" />
          {t('changePassword')}
        </h2>

        {passwordError && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
            {passwordError}
          </div>
        )}

        {passwordMessage && (
          <div className="mb-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
            {passwordMessage}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label={t('currentPassword')}
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
            }
          />
          <Input
            label={t('newPassword')}
            type="password"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
            }
          />
          <Input
            label={t('confirmNewPassword')}
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
            }
          />
          <Button type="submit" isLoading={isChangingPassword}>
            {t('changePassword')}
          </Button>
        </form>
      </div>
    </div>
  );
}

