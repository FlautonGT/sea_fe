import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui';
import { ReviewPayload } from '@/types';

interface ReviewFormProps {
    invoiceNumber: string;
    onSubmit: (data: ReviewPayload) => Promise<void>;
}

const REVIEW_CHIPS = [
    "Proses Cepat",
    "Harga Termurah",
    "Pelayanan Ramah",
    "Terpercaya",
    "Fast Respon",
    "Recommended"
];

export function ReviewForm({ invoiceNumber, onSubmit }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleChipClick = (chip: string) => {
        if (comment.includes(chip)) return;
        const newComment = comment ? `${comment}, ${chip}` : chip;
        if (newComment.length <= 50) {
            setComment(newComment);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError("Mohon berikan rating bintang.");
            return;
        }
        setError("");
        setIsSubmitting(true);
        try {
            await onSubmit({
                invoiceNumber,
                rating,
                comment
            });
        } catch (err) {
            console.error(err);
            setError("Gagal mengirim ulasan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-6 shadow-sm">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bagaimana pengalaman Anda?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Berikan rating dan ulasan untuk transaksi ini</p>
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className="focus:outline-none transition-transform active:scale-95 hover:scale-110"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                    >
                        <Star
                            className={`w-10 h-10 ${star <= (hoverRating || rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                                } transition-colors duration-200`}
                        />
                    </button>
                ))}
            </div>

            {/* Chips */}
            <div className="flex flex-wrap justify-center gap-2">
                {REVIEW_CHIPS.map((chip) => (
                    <button
                        key={chip}
                        type="button"
                        onClick={() => handleChipClick(chip)}
                        disabled={comment.length + chip.length + 2 > 50 && !comment.includes(chip)} // simple check
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-transparent text-gray-700 dark:text-gray-300 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {chip}
                    </button>
                ))}
            </div>

            {/* Comment Input */}
            <div className="space-y-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 block">
                    Komentar (Opsional, Max 50 karakter)
                </label>
                <div className="relative">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value.slice(0, 50))} // Max 50
                        placeholder="Tulis ulasan Anda disini atau pilih opsi diatas..."
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary-500 resize-none h-24"
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                        {comment.length}/50
                    </div>
                </div>
            </div>

            {error && (
                <p className="text-red-400 text-xs text-center">{error}</p>
            )}

            <Button
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={rating === 0}
                className="w-full bg-primary hover:bg-primary/90 text-black font-semibold"
            >
                Kirim Ulasan
            </Button>
        </div>
    );
}
