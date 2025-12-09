import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Seaply Admin Panel',
  description: 'Seaply.co Admin Panel - Kelola transaksi, produk, dan pengguna',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <AdminAuthProvider>
          {children}
        </AdminAuthProvider>
      </body>
    </html>
  );
}

