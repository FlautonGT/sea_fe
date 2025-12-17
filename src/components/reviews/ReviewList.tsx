import React from 'react';
import { Review } from '@/types';
import { ReviewCard } from './ReviewCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ReviewListProps {
    reviews: Review[];
    isLoading?: boolean;
    emptyMessage?: string;
    className?: string;
}

export function ReviewList({
    reviews = [], // Default to empty array to prevent undefined error
    isLoading,
    emptyMessage = "Belum ada ulasan.",
    className = ""
}: ReviewListProps) {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <LoadingSpinner className="w-8 h-8 text-primary" />
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 text-white/40">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
            {reviews.map((review, index) => (
                <ReviewCard key={`${review.invoiceNumber}-${index}`} review={review} />
            ))}
        </div>
    );
}
