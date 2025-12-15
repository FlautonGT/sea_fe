'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { X, Save, Camera, Upload } from 'lucide-react';
import { Button, Input, PhoneInput } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { updateUserProfile } from '@/lib/api';
import { generateInitials } from '@/lib/utils';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
    const { user, token, updateUser } = useAuth();
    const { regionCode, language } = useLocale();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phoneNumber: user?.phoneNumber || '',
    });

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError(language === 'id' ? 'Ukuran gambar maksimal 5MB' : 'Max image size is 5MB');
            return;
        }

        // Validate type
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setError(language === 'id' ? 'Format gambar harus JPG, PNG, atau WebP' : 'Image format must be JPG, PNG, or WebP');
            return;
        }

        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            data.append('firstName', formData.firstName);
            data.append('lastName', formData.lastName);
            if (formData.phoneNumber) {
                data.append('phoneNumber', String(formData.phoneNumber));
            }

            // Append image if selected
            if (selectedImage) {
                data.append('profilePicture', selectedImage);
            }

            data.append('region', regionCode);

            const res = await updateUserProfile(data, token.accessToken);
            if (res.data) {
                updateUser(res.data);
                onClose();
            } else if (res.error) {
                setError(res.error.message);
            }
        } catch (err) {
            console.error(err);
            setError(language === 'id' ? 'Gagal menyimpan perubahan' : 'Failed to save changes');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                    {language === 'id' ? 'Ubah Profil' : 'Edit Profile'}
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Picture Uploader */}
                    <div className="flex flex-col items-center">
                        <div
                            className="relative group cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700 shadow-sm relative">
                                {previewUrl ? (
                                    <Image
                                        src={previewUrl}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                ) : user?.profilePicture ? (
                                    <Image
                                        src={user.profilePicture}
                                        alt="Current Profile"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-primary-100 flex items-center justify-center text-secondary font-bold text-2xl">
                                        {generateInitials(user?.firstName || '', user?.lastName || '')}
                                    </div>
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center text-white shadow-md">
                                <Upload className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {language === 'id' ? 'Klik untuk ubah foto' : 'Click to change photo'}
                        </p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={language === 'id' ? 'Nama Depan' : 'First Name'}
                            value={formData.firstName}
                            onChange={(e) => setFormData(p => ({ ...p, firstName: e.target.value }))}
                            required
                        />
                        <Input
                            label={language === 'id' ? 'Nama Belakang' : 'Last Name'}
                            value={formData.lastName}
                            onChange={(e) => setFormData(p => ({ ...p, lastName: e.target.value }))}
                        />
                    </div>

                    <PhoneInput
                        label={language === 'id' ? 'Nomor Handphone' : 'Phone Number'}
                        value={formData.phoneNumber}
                        onChange={(value: string) => setFormData(p => ({ ...p, phoneNumber: value }))}
                        defaultCountryCode={regionCode === 'ID' ? '+62' : '+1'}
                    />

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            {language === 'id' ? 'Batal' : 'Cancel'}
                        </Button>
                        <Button type="submit" isLoading={loading}>
                            {language === 'id' ? 'Simpan Perubahan' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
