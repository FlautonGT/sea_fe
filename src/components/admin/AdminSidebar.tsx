'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  CreditCard,
  Tags,
  Image,
  FileText,
  Settings,
  Shield,
  Server,
  Wallet,
  Globe,
  Languages,
  FolderTree,
  Layers,
  Receipt,
  History,
  X,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  permission?: string | string[];
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/panel-admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Transaksi',
    href: '/panel-admin/transactions',
    icon: ShoppingCart,
    permission: 'transaction:read',
  },
  {
    title: 'Deposit',
    href: '/panel-admin/deposits',
    icon: Wallet,
    permission: 'transaction:read',
  },
  {
    title: 'Pengguna',
    href: '/panel-admin/users',
    icon: Users,
    permission: 'user:read',
  },
  {
    title: 'Produk',
    href: '/panel-admin/products',
    icon: Package,
    permission: 'product:read',
  },
  {
    title: 'SKU',
    href: '/panel-admin/skus',
    icon: Layers,
    permission: 'sku:read',
  },
  {
    title: 'Kategori',
    href: '/panel-admin/categories',
    icon: FolderTree,
    permission: 'product:read',
  },
  {
    title: 'Section',
    href: '/panel-admin/sections',
    icon: Layers,
    permission: 'product:read',
  },
  {
    title: 'Promo',
    href: '/panel-admin/promos',
    icon: Tags,
    permission: 'promo:read',
  },
  {
    title: 'Konten',
    href: '/panel-admin/content',
    icon: Image,
    permission: 'content:banner',
  },
  {
    title: 'Provider',
    href: '/panel-admin/providers',
    icon: Server,
    permission: 'provider:read',
  },
  {
    title: 'Payment Channel',
    href: '/panel-admin/payment-channels',
    icon: Receipt,
    permission: 'gateway:read',
  },
  {
    title: 'Laporan',
    href: '/panel-admin/reports',
    icon: FileText,
    permission: 'report:read',
  },
  {
    title: 'Audit Log',
    href: '/panel-admin/audit-logs',
    icon: History,
    permission: 'audit:read',
  },
  {
    title: 'Region & Bahasa',
    href: '/panel-admin/regions',
    icon: Globe,
    permission: 'setting:read',
  },
  {
    title: 'Admin',
    href: '/panel-admin/admins',
    icon: Shield,
    permission: 'admin:read',
  },
  {
    title: 'Pengaturan',
    href: '/panel-admin/settings',
    icon: Settings,
    permission: 'setting:read',
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { hasPermission, hasAnyPermission } = useAdminAuth();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    if (Array.isArray(item.permission)) {
      return hasAnyPermission(item.permission);
    }
    return hasPermission(item.permission);
  });

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 flex flex-col lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link href="/panel-admin" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Gate" className="h-8 w-auto" />
            <span className="font-semibold text-gray-900">Admin</span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/panel-admin' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

