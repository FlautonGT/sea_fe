'use client';

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface OTPInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    className?: string;
    disabled?: boolean;
    error?: boolean;
    success?: boolean;
}

export default function OTPInput({
    length = 6,
    value,
    onChange,
    className,
    disabled = false,
    error = false,
    success = false,
}: OTPInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Focus the first empty input or the first input on mount
    useEffect(() => {
        if (disabled) return;
        const firstEmptyIndex = value.length < length ? value.length : -1;
        if (firstEmptyIndex !== -1 && inputRefs.current[firstEmptyIndex]) {
            // Optional: Auto focus logic if desired, but might be annoying on page load
            // inputRefs.current[firstEmptyIndex]?.focus();
        }
    }, [disabled, length, value.length]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const rawValue = e.target.value;
        const newValue = rawValue.replace(/[^0-9]/g, '');

        // Handle paste inside input (mostly handled by onPaste, but fallback)
        if (newValue.length > 1) {
            // If user pasted into one input
            handlePaste(newValue);
            return;
        }

        const newOtp = value.split('');
        newOtp[index] = newValue;
        const combined = newOtp.join('').slice(0, length);
        onChange(combined);

        // Auto advance
        if (newValue && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            if (!value[index] && index > 0) {
                // Empty current, move previous
                inputRefs.current[index - 1]?.focus();
                const newOtp = value.split('');
                newOtp[index - 1] = ''; // clear previous
                onChange(newOtp.join(''));
            } else {
                // Clear current
                const newOtp = value.split('');
                newOtp[index] = '';
                onChange(newOtp.join(''));
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (pastedData: string) => {
        const cleaned = pastedData.replace(/[^0-9]/g, '').slice(0, length);
        onChange(cleaned);

        // Focus last filled
        const nextIndex = Math.min(cleaned.length, length - 1);
        if (inputRefs.current[nextIndex]) {
            inputRefs.current[nextIndex]?.focus();
        }
    };

    const onPasteIO = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text');
        handlePaste(pasted);
    };

    return (
        <div className={cn("flex gap-2 justify-center", className)}>
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[index] || ''}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={onPasteIO}
                    disabled={disabled}
                    className={cn(
                        "w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all outline-none focus:ring-4 placeholder:text-gray-300 dark:placeholder:text-gray-700",
                        "bg-gray-50 dark:bg-gray-800",
                        // Base Colors
                        error
                            ? "text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 focus:border-red-500 focus:ring-red-500/20"
                            : success
                                ? "text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-green-500/20"
                                : "text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20",
                        // Active filled state overrides for non-error/success
                        !error && !success && value[index] && "border-primary-500 focus:ring-primary-500/20"
                    )}
                />
            ))}
        </div>
    );
}
