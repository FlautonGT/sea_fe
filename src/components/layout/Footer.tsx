'use client';

import React from 'react';
import Link from 'next/link';
import { Youtube, Instagram, Phone, Twitter } from 'lucide-react';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import Logo from '@/components/ui/Logo';

const socialLinks = [
  { icon: Youtube, href: 'https://youtube.com/@gateofficial', label: 'YouTube' },
  { icon: Instagram, href: 'https://instagram.com/gate.official', label: 'Instagram' },
  { icon: Phone, href: 'https://wa.me/6281234567890', label: 'WhatsApp' },
  { icon: Twitter, href: 'https://x.com/gate_official', label: 'X' },
];

export default function Footer() {
  const { getLocalizedPath } = useLocale();
  const { t, language } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    legality: [
      { labelId: 'Kebijakan Privasi', labelEn: 'Privacy Policy', href: '/privacy-policy' },
      { labelId: 'Syarat & Ketentuan', labelEn: 'Terms & Conditions', href: '/terms' },
    ],
  };

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href={getLocalizedPath('/')} className="inline-block">
              <Logo className="h-10 w-auto" />
            </Link>
            <p className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
              PT Gerbang Transaksi Digital
            </p>
          </div>

          {/* Head Office */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              {t('headOffice')}
            </h3>
            <address className="not-italic text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p>
                Wisma Keiai Lantai 14 Unit 1410, Jalan Jenderal Sudirman Kav.3, Kel. Karet Tengsin, Kec. Tanah Abang, Kota Jakarta Pusat, Provinsi DKI Jakarta, Kode Pos: 10220
              </p>
              <div className="pt-2">
                <p className="font-medium text-gray-900 dark:text-white">Email</p>
                <a
                  href="mailto:support@gate.id"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  support@gate.id
                </a>
              </div>
              <div className="pt-2">
                <p className="font-medium text-gray-900 dark:text-white">WhatsApp</p>
                <a
                  href="https://wa.me/628138181640"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  +628138181640
                </a>
              </div>
            </address>
          </div>

          {/* Legality */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              {t('legality')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.legality.map((link) => (
                <li key={link.href}>
                  <Link
                    href={getLocalizedPath(link.href)}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {language === 'en' ? link.labelEn : link.labelId}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              {t('socialMedia')}
            </h3>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            © {currentYear} PT Gerbang Transaksi Digital | {t('allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}
