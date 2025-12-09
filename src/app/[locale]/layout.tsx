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

export const metadata: Metadata = {
  title: 'Seaply - Top Up Game & Pulsa',
  description: 'Platform top up game dan voucher digital terpercaya di Indonesia. Proses cepat, aman, dan tersedia 24/7.',
  keywords: ['top up game', 'voucher game', 'mobile legends', 'free fire', 'pubg mobile'],
  authors: [{ name: 'Seaply' }],
  creator: 'PT Gerbang Solusi Digital',
  publisher: 'Seaply',
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.svg',
  },
};

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
              {children}
              <Toaster position="top-right" richColors closeButton />
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

