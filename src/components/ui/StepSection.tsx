'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Lock } from 'lucide-react';

interface StepSectionProps {
    title: string;
    number: string;
    isActive?: boolean;
    isCompleted?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    className?: string;
}

export function StepSection({
    title,
    number,
    isActive = false,
    isCompleted = false,
    disabled = false,
    children,
    className,
}: StepSectionProps) {
    return (
        <section
            className={cn(
                'relative rounded-xl md:rounded-2xl p-3 md:p-6 transition-all duration-300 border', // Compact radius & padding
                disabled
                    ? 'bg-gray-100 dark:bg-gray-800/40 border-transparent opacity-60 pointer-events-none grayscale'
                    : isActive
                        ? 'bg-white dark:bg-gray-800 border-primary-500 shadow-lg ring-2 ring-primary-500/10'
                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600',
                className
            )}
        >
            {/* Header */}
            <h2
                className={cn(
                    'text-base md:text-lg font-bold mb-3 md:mb-6 flex items-center gap-2 md:gap-3', // Compact font & margin
                    disabled ? 'text-gray-400' : 'text-gray-900 dark:text-white'
                )}
            >
                <div
                    className={cn(
                        'w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold transition-all', // Compact circle
                        isCompleted
                            ? 'bg-green-500 text-white'
                            : isActive
                                ? 'bg-primary-600 text-white'
                                : disabled
                                    ? 'bg-gray-200 text-gray-400'
                                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
                    )}
                >
                    {isCompleted ? <Check className="w-3 h-3 md:w-5 md:h-5" /> : number}
                </div>
                {title}
                {disabled && <Lock className="w-3 h-3 md:w-4 md:h-4 text-gray-400 ml-auto" />}
            </h2>

            {/* Content */}
            <div className={cn('transition-all', disabled && 'blur-sm select-none')}>
                {children}
            </div>

            {/* Disabled Overlay (optional extra protection) */}
            {disabled && <div className="absolute inset-0 z-10" />}
        </section>
    );
}
