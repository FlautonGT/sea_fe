'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, Receipt, History, FileText, Wallet, LayoutDashboard } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, isLoading } = useAuth();
    const { getLocalizedPath, language } = useLocale();
    const { t } = useTranslation();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push(getLocalizedPath('/login'));
        }
    }, [isAuthenticated, isLoading, router, getLocalizedPath]);

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
                </div>
            </MainLayout>
        );
    }

    if (!isAuthenticated || !user) {
        return null; // Or return MainLayout with unauthorized message if preferred, but usually redirect handles it
    }

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: Wallet, label: language === 'id' ? 'Saldo' : 'Balance', href: '/deposit' },
        { icon: Receipt, label: t('transactions'), href: '/transactions' },
        { icon: History, label: 'Mutations', href: '/mutations' },
        { icon: FileText, label: t('reports') || 'Reports', href: '/reports' },
        { icon: User, label: t('profile') || 'Profile', href: '/profile' },
    ];

    const isActive = (href: string) => {
        const localizedHref = getLocalizedPath(href);
        if (href === '/profile') {
            return pathname === localizedHref;
        }
        return pathname.startsWith(localizedHref);
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-24">
                            {/* Navigation */}
                            <nav className="p-4">
                                <ul className="space-y-1">
                                    {menuItems.map((item) => {
                                        const Icon = item.icon;
                                        const active = isActive(item.href);
                                        return (
                                            <li key={item.href}>
                                                <Link
                                                    href={getLocalizedPath(item.href)}
                                                    className={cn(
                                                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                                                        active
                                                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    )}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                    <span className="font-medium">{item.label}</span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">{children}</div>
                </div>
            </div>
        </MainLayout>
    );
}
