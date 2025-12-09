'use client';

import React, { useEffect, useState } from 'react';
import { X, Clock } from 'lucide-react';
import { Popup } from '@/types';
import { getPopups } from '@/lib/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface PopupComponentProps {
  region: string;
}

const POPUP_STORAGE_KEY_PREFIX = 'popup_hidden_';
const HIDDEN_DURATION_MS = 10 * 60 * 1000; // 10 menit dalam milliseconds

export default function PopupComponent({ region }: PopupComponentProps) {
  const [popup, setPopup] = useState<Popup | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowChecked, setDontShowChecked] = useState(false);

  useEffect(() => {
    async function loadPopup() {
      try {
        setLoading(true);
        const response = await getPopups(region);
        
        if (response.data && response.data.isActive) {
          // Cek apakah popup ini sudah di-hidden dalam 10 menit terakhir
          const storageKey = `${POPUP_STORAGE_KEY_PREFIX}${region}`;
          const hiddenUntil = localStorage.getItem(storageKey);
          
          if (hiddenUntil) {
            const hiddenUntilTime = parseInt(hiddenUntil, 10);
            const now = Date.now();
            
            if (now < hiddenUntilTime) {
              // Masih dalam periode hidden
              setPopup(null);
              setLoading(false);
              return;
            } else {
              // Periode hidden sudah berakhir, hapus dari localStorage
              localStorage.removeItem(storageKey);
            }
          }

          setPopup(response.data);
          setIsVisible(true);
        } else {
          setPopup(null);
        }
      } catch (error) {
        console.error('Failed to load popup:', error);
        setPopup(null);
      } finally {
        setLoading(false);
      }
    }

    loadPopup();
  }, [region]);

  const handleClose = () => {
    setIsVisible(false);
    
    if (dontShowChecked) {
      // Simpan waktu sampai popup tidak ditampilkan (10 menit dari sekarang)
      const storageKey = `${POPUP_STORAGE_KEY_PREFIX}${region}`;
      const hiddenUntil = Date.now() + HIDDEN_DURATION_MS;
      localStorage.setItem(storageKey, hiddenUntil.toString());
    }
  };

  if (loading || !popup || !isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full transition-colors shadow-md"
          aria-label="Tutup popup"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* Image */}
        {popup.image && (
          <div className="relative w-full aspect-video bg-gray-100">
            <img
              src={popup.image}
              alt={popup.title || 'Popup image'}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          {popup.title && (
            <h2
              className="text-2xl font-bold text-gray-900 mb-3"
              dangerouslySetInnerHTML={{ __html: popup.title }}
            />
          )}
          
          {popup.content && (
            <div
              className="text-gray-600 mb-6 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: popup.content }}
            />
          )}

          {/* CTA Button */}
          {popup.href && (
            <Link
              href={popup.href}
              onClick={handleClose}
              className="block w-full mb-4 px-6 py-3 bg-primary text-white text-center font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Lihat Detail
            </Link>
          )}
        </div>

        {/* Footer dengan checkbox */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowChecked}
              onChange={(e) => setDontShowChecked(e.target.checked)}
              className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
            />
            <span className="text-sm text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              Jangan tampilkan selama 10 menit
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

