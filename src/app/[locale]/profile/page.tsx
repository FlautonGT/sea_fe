'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Edit, Lock, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { generateInitials, formatCurrency } from '@/lib/utils';
import { getUserProfile } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Modals
import MFASetupModal from '@/components/account/MFASetupModal';
import MFADisableModal from '@/components/account/MFADisableModal';
import EditProfileModal from '@/components/account/EditProfileModal';
import ChangePasswordModal from '@/components/account/ChangePasswordModal';

export default function ProfilePage() {
  const { user, isLoading, refreshUser } = useAuth();
  const { t } = useTranslation();
  const { regionCode, currency, getLocalizedPath, language } = useLocale();
  const router = useRouter();

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Modal States
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [showMfaDisable, setShowMfaDisable] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  if (!user) return null;
  const isMfaActive = user.mfaStatus === 'ACTIVE';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 1. Profile Header & MFA Alert */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {user.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt={user.firstName}
                width={96}
                height={96}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center text-white text-3xl font-bold">
                {generateInitials(user.firstName, user.lastName)}
              </div>
            )}
            <button
              onClick={() => setShowEditProfile(true)}
              className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 hover:text-primary-600 rounded-full flex items-center justify-center shadow-sm transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>

          {/* Name & Username */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {user.email}
            </p>

            {/* MFA Status Badge */}
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
              <Shield className={`w-4 h-4 ${isMfaActive ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {isMfaActive ? (language === 'id' ? '2FA Aktif' : '2FA Active') : (language === 'id' ? '2FA Tidak Aktif' : '2FA Inactive')}
              </span>
              {isMfaActive && (
                <button
                  onClick={() => setShowMfaDisable(true)}
                  className="text-xs text-red-500 hover:underline ml-1"
                >
                  (Disable)
                </button>
              )}
            </div>
          </div>

          {/* MFA Alert (If Inactive) */}
          {!isMfaActive && (
            <div className="w-full md:w-auto bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 rounded-xl p-4 flex flex-col items-end gap-2 text-right">
              <p className="text-xs font-medium text-red-600 dark:text-red-400 max-w-[200px]">
                {language === 'id'
                  ? 'Kamu belum mengaktifkan Two Factor Authentication'
                  : 'You have not enabled Two Factor Authentication'}
              </p>
              <Button
                size="sm"
                className="h-8 text-xs"
                onClick={() => setShowMfaSetup(true)}
              >
                {language === 'id' ? 'Aktifkan Disini' : 'Enable Here'}
              </Button>
            </div>
          )}
        </div>



        {/* 3. Personal Information */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Info Grid */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {language === 'id' ? 'Informasi Pribadi' : 'Personal Information'}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditProfile(true)}
                  className="gap-2"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  {language === 'id' ? 'Ubah Informasi' : 'Edit Info'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChangePassword(true)}
                  className="gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {language === 'id' ? 'Ubah Password' : 'Change Password'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {language === 'id' ? 'Nama Depan' : 'First Name'}
                </label>
                <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">
                  {user.firstName}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {language === 'id' ? 'Nama Belakang' : 'Last Name'}
                </label>
                <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">
                  {user.lastName}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </label>
                <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">
                  {user.email}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {language === 'id' ? 'Nomor Handphone' : 'Phone Number'}
                </label>
                <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">
                  {user.phoneNumber || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Modals */}
        <MFASetupModal
          isOpen={showMfaSetup}
          onClose={() => setShowMfaSetup(false)}
          onSuccess={refreshUser}
        />

        <MFADisableModal
          isOpen={showMfaDisable}
          onClose={() => setShowMfaDisable(false)}
          onSuccess={refreshUser}
        />

        <EditProfileModal
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
        />

        <ChangePasswordModal
          isOpen={showChangePassword}
          onClose={() => setShowChangePassword(false)}
        />

      </div>
    </DashboardLayout>
  );
}
