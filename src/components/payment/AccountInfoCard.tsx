'use client';

import React from 'react';
import Image from 'next/image';
import { User, Server, Hash } from 'lucide-react';
import { Order } from '@/types';

interface AccountInfoCardProps {
    order: Order;
    language: 'id' | 'en';
}

export default function AccountInfoCard({ order, language }: AccountInfoCardProps) {
    const { account, product, sku } = order;
    const accountId = account.userId || (account.inputs ? account.inputs.split(' - ')[0] : '-');
    const zoneId = account.zoneId || (account.inputs ? account.inputs.split(' - ')[1] : '');
    const displayZone = zoneId ? `(${zoneId})` : '';

    return (
        <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl overflow-hidden relative group hover:border-blue-500/20 dark:hover:border-white/20 transition-all duration-300">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-blue-500/10 dark:group-hover:bg-blue-500/20 transition-all duration-500" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />

            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-6 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                {language === 'id' ? 'Informasi Akun' : 'Account Information'}
            </h3>

            <div className="flex gap-6 items-start">
                {/* Product Image */}
                <div className="shrink-0 relative">
                    <div className="w-24 h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-2xl bg-slate-100 dark:bg-slate-800 relative z-10 group-hover:scale-105 transition-transform duration-500">
                        {product.image ? (
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            /* Placeholder gradient */
                            <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-900 flex items-center justify-center p-2 text-center">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-white transition-colors">{product.name}</span>
                            </div>
                        )}
                    </div>
                    {/* Product Glow */}
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl -z-0" />
                </div>

                <div className="flex-1 space-y-4 pt-1">
                    {/* Product Name Title */}
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold text-xl leading-tight tracking-tight">{product.name}</h4>
                        <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">{sku.name}</p>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/5">
                                <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-wider font-bold">Nickname</p>
                                <p className="text-slate-900 dark:text-white font-medium">{account.nickname || '-'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/5">
                                <Hash className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-wider font-bold">ID</p>
                                <p className="text-slate-900 dark:text-white font-medium">{accountId}</p>
                            </div>
                        </div>

                        {zoneId && (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/5">
                                    <Server className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-wider font-bold">Server/Zone</p>
                                    <p className="text-slate-900 dark:text-white font-medium">{zoneId}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
