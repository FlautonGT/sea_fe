import React, { useEffect, useState } from 'react';
import { X, Clock } from 'lucide-react';
import { Popup } from '@/types';
import { getPopups } from '@/lib/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useTranslation } from '@/contexts/LocaleContext';

interface PopupComponentProps {
  region: string;
}

const POPUP_STORAGE_KEY_PREFIX = 'popup_hidden_';
const HIDDEN_DURATION_MS = 10 * 60 * 1000; // 10 menit dalam milliseconds

export default function PopupComponent({ region }: PopupComponentProps) {
  const { t } = useTranslation();
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
          const storageKey = `${POPUP_STORAGE_KEY_PREFIX}${region}`;
          const hiddenUntil = localStorage.getItem(storageKey);

          if (hiddenUntil) {
            const hiddenUntilTime = parseInt(hiddenUntil, 10);
            const now = Date.now();

            if (now < hiddenUntilTime) {
              setPopup(null);
              setLoading(false);
              return;
            } else {
              localStorage.removeItem(storageKey);
            }
          }

          setPopup(response.data);
          // Small delay for smooth entry animation
          setTimeout(() => setIsVisible(true), 500);
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
      const storageKey = `${POPUP_STORAGE_KEY_PREFIX}${region}`;
      // Hide for 24 hours
      const hiddenUntil = Date.now() + (24 * 60 * 60 * 1000);
      localStorage.setItem(storageKey, hiddenUntil.toString());
    }
  };

  if (loading || !popup) {
    return null;
  }

  // Animation classes
  const backdropClasses = isVisible ? "opacity-100" : "opacity-0";
  const modalClasses = isVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4";

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500",
        isVisible ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500",
          backdropClasses
        )}
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div
        className={cn(
          "relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transition-all duration-500 ease-out border border-white/20",
          modalClasses
        )}
      >
        {/* Close Button - Floating */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all transform hover:scale-110"
          aria-label="Tutup popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Section - Edge to Edge */}
        {popup.image && (
          <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800">
            <img
              src={popup.image}
              alt={popup.title || 'Popup image'}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white dark:from-gray-900 to-transparent" />
          </div>
        )}

        {/* Content Section */}
        <div className="p-6 pt-2 relative">
          {popup.title && (
            <h2
              className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3"
              dangerouslySetInnerHTML={{ __html: popup.title }}
            />
          )}

          {popup.content && (
            <div
              className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: popup.content }}
            />
          )}

          {/* CTA Button */}
          {popup.href && (
            <Link
              href={popup.href}
              onClick={handleClose}
              className="group relative block w-full mb-4 overflow-hidden rounded-xl bg-primary-600 p-3 text-center transition-all hover:bg-primary-700 active:scale-95"
            >
              <div className="relative z-10 flex items-center justify-center gap-2 font-semibold text-white">
                <span>{t('seeAll')}</span>
                <X className="w-4 h-4 rotate-45 group-hover:rotate-90 transition-transform" /> {/* Mock arrow icon using X for now or just generic */}
              </div>
            </Link>
          )}

          {/* Footer Checkbox */}
          <div className="flex items-center justify-center pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
            <label className="flex items-center gap-2 cursor-pointer group select-none">
              <div className={cn(
                "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                dontShowChecked
                  ? "bg-primary-500 border-primary-500 text-white"
                  : "bg-transparent border-gray-300 dark:border-gray-600 group-hover:border-primary-400"
              )}>
                {dontShowChecked && <X className="w-3 h-3 rotate-45" />} {/* Checkmark simulation if needed, or import Check */}
              </div>
              <input
                type="checkbox"
                checked={dontShowChecked}
                onChange={(e) => setDontShowChecked(e.target.checked)}
                className="hidden"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                {t('dontShowAgain')}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

