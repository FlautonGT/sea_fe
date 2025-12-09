import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seaply - Top Up Game & Pulsa',
  description: 'Platform top up game dan voucher digital terpercaya di Indonesia. Proses cepat, aman, dan tersedia 24/7.',
  icons: {
    icon: '/favicon.ico',
  },
  authors: [{ name: 'Seaply' }],
  keywords: ['top up game', 'voucher game', 'mobile legends', 'free fire', 'pubg mobile'],
  publisher: 'Seaply',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
