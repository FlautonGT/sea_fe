import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '../globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { isValidLocale, parseLocale, getAllLocales } from '@/lib/locale';
import { Toaster } from 'sonner';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

import { t } from '@/lib/translations';

// Dynamic Metadata Generator
export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = params.locale || 'id';

  return {
    title: t('homeTitle', locale),
    description: t('homeDescription', locale),
    keywords: ['top up game', 'voucher game', 'mobile legends', 'free fire', 'pubg mobile', 'valorant'],
    authors: [{ name: 'Seaply' }],
    creator: 'PT Gerbang Transaksi Digital',
    publisher: 'PT Gerbang Transaksi Digital',
    formatDetection: {
      telephone: false,
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/logo.svg',
    },
  };
}

export function generateStaticParams() {
  return getAllLocales().map((locale) => ({
    locale,
  }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate locale
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const { region, language } = parseLocale(params.locale);

  return (
    <html lang={language} className={plusJakartaSans.variable} suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider>
          <LocaleProvider initialRegion={region} initialLanguage={language}>
            <AuthProvider>
              {/* Structured Data (JSON-LD) for SEO & Sitelinks */}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@graph': [
                      {
                        '@type': 'WebSite',
                        '@id': `https://seaply.co/${params.locale}/#website`,
                        'url': `https://seaply.co/${params.locale}/`,
                        'name': params.locale === 'id' ? 'Seaply Indonesia' : 'Seaply Global',
                        'description': params.locale === 'id'
                          ? 'Platform top up game dan voucher digital terpercaya #1 di Asia.'
                          : '#1 Trusted game top-up and digital voucher platform in Asia.',
                        'potentialAction': [
                          {
                            '@type': 'SearchAction',
                            'target': `https://seaply.co/${params.locale}/search?q={search_term_string}`,
                            'query-input': 'required name=search_term_string'
                          }
                        ],
                        'inLanguage': params.locale
                      },
                      {
                        '@type': 'Organization',
                        '@id': 'https://seaply.co/#organization',
                        'name': 'Seaply',
                        'url': 'https://seaply.co/',
                        'logo': {
                          '@type': 'ImageObject',
                          'url': 'https://seaply.co/logo.png',
                          'width': 512,
                          'height': 512
                        },
                        'sameAs': [
                          'https://instagram.com/seaply.id',
                          'https://twitter.com/seaplyid',
                          'https://facebook.com/seaply'
                        ]
                      }
                    ]
                  })
                }}
              />
              {children}
              <Toaster position="top-right" richColors closeButton />
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

