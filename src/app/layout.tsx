import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gate - Top Up Game & Pulsa',
  description: 'Semua kebutuhan game & pulsa dalam satu aplikasi, dijamin cepat, mudah, aman.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
