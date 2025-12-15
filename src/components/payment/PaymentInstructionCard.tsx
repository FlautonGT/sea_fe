'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui';
import { Order } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface PaymentInstructionCardProps {
    order: Order;
    language: 'id' | 'en';
    onCopy: (text: string) => void;
    copied: boolean;
}

// Countdown Timer Component
function CountdownTimer({ expiredAt, language }: { expiredAt: string; language: 'id' | 'en' }) {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const expired = new Date(expiredAt).getTime();
            const diff = Math.max(0, expired - now);

            return {
                hours: Math.floor(diff / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
            };
        };

        setTimeLeft(calculateTimeLeft());
        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(interval);
    }, [expiredAt]);

    const label = language === 'id' ? 'Sisa Waktu Pembayaran' : 'Payment Time Left';

    return (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex justify-between items-center mb-6">
            <span className="text-red-400 font-medium text-sm">{label}</span>
            <div className="font-mono text-xl font-bold text-red-500 flex gap-1">
                <span>{String(timeLeft.hours).padStart(2, '0')}:</span>
                <span>{String(timeLeft.minutes).padStart(2, '0')}:</span>
                <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
        </div>
    );
}

export default function PaymentInstructionCard({ order, language, onCopy, copied }: PaymentInstructionCardProps) {
    const { payment, pricing, invoiceNumber, expiredAt } = order;
    const total = pricing?.total || 0;
    const currency = pricing?.currency || 'IDR';

    // Helper to determine payment type safely
    const paymentType = payment.paymentType ||
        (payment.code === 'QRIS' ? 'QRIS' :
            payment.code?.includes('VA') ? 'VIRTUAL_ACCOUNT' :
                payment.code?.includes('ALFAMART') ? 'RETAIL' :
                    'E_WALLET'); // Fallback

    const paymentCode = payment.paymentCode || payment.qrString || payment.redirectUrl || payment.accountNumber || '';

    // QR Code URL (for QRIS)
    const qrCodeUrl = (paymentType === 'QRIS' && paymentCode)
        ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentCode)}`
        : null;

    // Barcode URL (for Retail)
    const barcodeUrl = (paymentType === 'RETAIL' && paymentCode)
        ? `https://quickchart.io/barcode?type=code128&text=${encodeURIComponent(paymentCode)}&format=png&width=150`
        : null;

    const [showInstructions, setShowInstructions] = useState(false);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    const handleDownload = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback
            window.open(url, '_blank');
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Payment Details & Instructions */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-xl">
                    <h3 className="text-slate-500 dark:text-gray-400 text-sm font-semibold mb-6 uppercase tracking-wider">
                        {language === 'id' ? 'Rincian Pembayaran' : 'Payment Details'}
                    </h3>

                    {expiredAt && <CountdownTimer expiredAt={expiredAt} language={language} />}

                    <div className="space-y-4 mb-6 text-sm">
                        <div className="flex justify-between items-center text-slate-600 dark:text-gray-400">
                            <span>{language === 'id' ? 'Harga' : 'Price'}</span>
                            <span className="text-slate-900 dark:text-white font-medium">{formatCurrency(pricing?.subtotal || 0, currency)}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600 dark:text-gray-400">
                            <span>{language === 'id' ? 'Biaya Admin' : 'Admin Fee'}</span>
                            <span className="text-slate-900 dark:text-white font-medium">{formatCurrency(pricing?.paymentFee || 0, currency)}</span>
                        </div>

                        <div className="border-t border-slate-200 dark:border-gray-800 pt-4 mt-4 flex justify-between items-center">
                            <span className="text-slate-900 dark:text-white font-bold text-lg">{language === 'id' ? 'Total Pembayaran' : 'Total Payment'}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-amber-600 dark:text-primary-400 font-bold text-xl">{formatCurrency(total, currency)}</span>
                                <button onClick={() => onCopy(total.toString())} className="text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-white">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <Button
                        fullWidth
                        className="h-12 text-lg font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/20 mb-4"
                        onClick={() => window.location.reload()}
                    >
                        {language === 'id' ? 'Cek Status Pembayaran' : 'Check Payment Status'}
                    </Button>

                    {/* Instructions List (Desktop & Mobile) */}
                    <div className="mt-4">
                        <button
                            onClick={() => setShowInstructions(!showInstructions)}
                            className="w-full flex justify-between items-center text-slate-500 dark:text-gray-400 text-sm py-2 font-medium hover:text-slate-700 dark:hover:text-gray-300 transition-colors"
                        >
                            <span>{language === 'id' ? 'Panduan Pembayaran' : 'Payment Instructions'}</span>
                            {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {showInstructions && (payment.instructions && payment.instructions.length > 0) && (
                            <div className="mt-2 text-slate-500 dark:text-gray-500 text-xs space-y-1 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                                {payment.instructions.map((step, idx) => (
                                    <p key={idx}>{step}</p>
                                ))}
                            </div>
                        )}
                        {showInstructions && (!payment.instructions || payment.instructions.length === 0) && (
                            <div className="mt-2 text-slate-500 dark:text-gray-500 text-xs p-4">
                                {language === 'id' ? 'Ikuti instruksi di layar pembayaran.' : 'Follow instructions on the payment screen.'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: QR Code / Virtual Account / Retail Code / Deeplink */}
                <div className="bg-white dark:bg-white rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center">

                    {paymentType === 'QRIS' && qrCodeUrl ? (
                        <>
                            <h3 className="text-gray-900 font-bold text-lg mb-4">Scan QRIS</h3>
                            <div
                                className="bg-white p-2 rounded-lg border border-gray-200 shadow-inner mb-4 cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => setZoomedImage(qrCodeUrl)}
                            >
                                <Image src={qrCodeUrl} alt="QR Code" width={250} height={250} className="rounded-md" unoptimized />
                            </div>
                            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50" onClick={() => handleDownload(qrCodeUrl, `qris-${invoiceNumber}.png`)}>
                                <Download className="w-4 h-4 mr-2" />
                                {language === 'id' ? 'Unduh Kode QR' : 'Download QR Code'}
                            </Button>
                        </>
                    ) : paymentType === 'VIRTUAL_ACCOUNT' && paymentCode ? (
                        <div className="w-full">
                            <h3 className="text-gray-900 font-bold text-lg mb-6">{payment.name || 'Virtual Account'}</h3>
                            <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 mb-6 relative group cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => onCopy(paymentCode)}>
                                {payment.accountName && <p className="text-sm text-gray-500 mb-1">{payment.accountName}</p>}
                                <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider break-all">{paymentCode}</p>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs bg-black text-white px-2 py-1 rounded">{copied ? 'Copied' : 'Copy'}</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full" onClick={() => onCopy(paymentCode)}>
                                <Copy className="w-4 h-4 mr-2" />
                                {language === 'id' ? 'Salin Nomor VA' : 'Copy VA Number'}
                            </Button>
                        </div>
                    ) : paymentType === 'RETAIL' && paymentCode ? (
                        <div className="w-full">
                            <h3 className="text-gray-900 font-bold text-lg mb-6">{payment.name || 'Retail Payment'}</h3>
                            <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 mb-6">
                                <p className="text-3xl font-mono font-bold text-gray-900 tracking-widest break-all">{paymentCode}</p>
                            </div>
                            {barcodeUrl && (
                                <div
                                    className="mb-6 flex justify-center bg-white p-4 rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
                                    onClick={() => setZoomedImage(barcodeUrl)}
                                >
                                    <Image src={barcodeUrl} alt="Barcode" width={300} height={80} unoptimized />
                                </div>
                            )}
                            <p className="text-sm text-gray-500">
                                {language === 'id' ? 'Tunjukkan kode ini ke kasir.' : 'Show this code to the cashier.'}
                            </p>
                        </div>
                    ) : paymentType === 'E_WALLET' && paymentCode ? (
                        <div className="flex flex-col items-center w-full">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                {payment.image ? <Image src={payment.image} alt={payment.name} width={40} height={40} /> : <span className="text-2xl">📱</span>}
                            </div>
                            <h3 className="text-gray-900 font-bold text-lg mb-2">{payment.name || 'E-Wallet'}</h3>
                            <p className="text-gray-500 mb-6 text-sm">
                                {language === 'id' ? 'Klik tombol di bawah untuk menyelesaikan pembayaran.' : 'Click the button below to complete payment.'}
                            </p>
                            <Button
                                fullWidth
                                onClick={() => window.open(paymentCode, '_blank')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12"
                            >
                                {language === 'id' ? 'Selesaikan Pembayaran' : 'Complete Payment'}
                            </Button>
                        </div>
                    ) : (
                        // Default / Fallback
                        <div className="flex flex-col items-center">
                            <p className="text-gray-900 font-medium mb-4">{language === 'id' ? 'Lanjutkan Pembayaran' : 'Continue Payment'}</p>
                            <Button onClick={() => window.open(paymentCode || '#', '_blank')}>
                                {language === 'id' ? 'Bayar Sekarang' : 'Pay Now'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Zoom Modal */}
            {zoomedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={() => setZoomedImage(null)}
                >
                    <div className="relative w-full max-w-3xl bg-white p-8 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col items-center">
                        <Image
                            src={zoomedImage}
                            alt="Zoomed Payment Code"
                            width={800}
                            height={800}
                            className="object-contain max-h-[80vh] w-full h-auto"
                            unoptimized
                        />
                        <p className="text-center text-sm text-gray-500 mt-6 font-medium">
                            {language === 'id' ? 'Ketuk di mana saja untuk menutup' : 'Tap anywhere to close'}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
