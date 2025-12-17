import React from 'react';
import { Review } from '@/types';
import { Star } from 'lucide-react';

interface ReviewCardProps {
    review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
    const maskInvoice = (inv: string) => {
        if (!inv || inv.length <= 8) return inv;
        // 4 front, 16 stars, 4 back
        return `${inv.slice(0, 4)}${'*'.repeat(16)}${inv.slice(-4)}`;
    };

    const maskName = (name: string) => {
        if (!name) return '';
        if (name.length <= 3) return name;
        return `${name.slice(0, 3)}${'*'.repeat(name.length - 3)}`;
    };

    const maskPhone = (phone: string) => {
        if (!phone) return '';
        return `*********${phone.slice(-3)}`;
    };

    // If fullName is null, use phoneNumber logic described: only show phone number masked?
    // "jika fullName null maka tampilin phoneNumber"
    // User said: "phoneNumber (gunakan nomor telepon dari transaksi dia, dan tampilkan hanya 3 angka diakhir, contoh *********123"
    // "fullName (jika dia beli auth, tampilin nama dia 3 huruf didepan, jika dia beli guest, cukup null)"
    // The display requirement: "jika fullName null maka tampilin phoneNumber"

    const displayName = review.fullName ? maskName(review.fullName) : maskPhone(review.phoneNumber);

    return (
        <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl p-4 space-y-3 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white/90 text-sm md:text-base">
                            {displayName}
                        </span>
                        <span className="text-gray-400 dark:text-white/40 text-xs">•</span>
                        <span className="text-gray-400 dark:text-white/40 text-xs">
                            {new Date(review.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-white/60">
                        <span className="bg-white dark:bg-white/5 px-2 py-0.5 rounded text-gray-500 dark:text-white/50 border border-gray-200 dark:border-white/5">
                            {review.productName}
                        </span>
                        <span className="bg-white dark:bg-white/5 px-2 py-0.5 rounded text-gray-500 dark:text-white/50 border border-gray-200 dark:border-white/5">
                            {review.skuName}
                        </span>
                    </div>
                </div>

                <div className="flex gap-0.5 shrink-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200 dark:fill-white/10 dark:text-white/10'
                                }`}
                        />
                    ))}
                </div>
            </div>

            <div className="text-sm text-gray-700 dark:text-white/80 leading-relaxed">
                "{review.comment}"
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex items-center gap-2 text-xs text-gray-400 dark:text-white/40 font-mono">
                <span>Invoice:</span>
                <span>{maskInvoice(review.invoiceNumber)}</span>
            </div>
        </div>
    );
}
