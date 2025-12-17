'use client';

import React, { useEffect, useState } from 'react';
import { getReviews } from '@/lib/api';
import { Review, ReviewStats, Pagination } from '@/types';
import { ReviewList } from '@/components/reviews/ReviewList';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui';

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Fetch reviews on mount
    useEffect(() => {
        fetchReviews(1);
    }, []);

    const fetchReviews = async (pageNum: number) => {
        try {
            setIsLoading(true);
            const res = await getReviews({
                limit: 10,
                page: pageNum,
                region: 'ID', // Default to 'ID' as requested or maybe dynamic? Prompt said "region=ID"
            });

            if (res.data) {
                if (pageNum === 1) {
                    setReviews(res.data.reviews);
                } else {
                    setReviews(prev => [...prev, ...res.data!.reviews]);
                }
                setStats(res.data.stats);

                // simple hasMore check
                if (res.data.reviews.length < 10 || pageNum >= res.data.pagination.totalPages) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }
            }
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchReviews(nextPage);
    };

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
            {/* Header & Stats */}
            <div className="space-y-6">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Ulasan Pembeli
                </h1>

                {stats && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-12">
                        <div className="text-center md:text-left">
                            <div className="flex items-center gap-1 text-5xl md:text-6xl font-bold text-white">
                                {stats.rating.toFixed(1)}
                                <Star className="w-8 h-8 md:w-12 md:h-12 fill-yellow-400 text-yellow-400" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} className="w-6 h-6 md:w-8 md:h-8 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-white/60 text-sm md:text-base">
                                Berdasarkan total {stats.totalReviews} rating dari pelanggan puas kami.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Review List */}
            <ReviewList
                reviews={reviews}
                isLoading={isLoading && page === 1}
            />

            {/* Load More */}
            {hasMore && !isLoading && (
                <div className="flex justify-center pt-4">
                    <Button
                        onClick={loadMore}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                    >
                        Muat Lebih Banyak
                    </Button>
                </div>
            )}
            {isLoading && page > 1 && (
                <div className="flex justify-center pt-4 text-white/40 text-sm">
                    Memuat...
                </div>
            )}
        </div>
    );
}
