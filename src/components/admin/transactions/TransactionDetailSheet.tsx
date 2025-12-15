'use client';

import React, { useState } from 'react';
import { AdminTransaction } from '@/types/admin';
import { StatusBadge } from '@/components/admin/ui';
import {
    updateTransactionStatus,
    refundTransaction,
    retryTransaction,
    manualTransaction
} from '@/lib/adminApi';
import {
    X,
    Copy,
    CreditCard,
    Package,
    User,
    Calendar,
    Globe,
    Smartphone,
    Server,
    RotateCcw,
    CheckCircle,
    AlertTriangle,
    FileText,
    DollarSign,
    Clock,
    ExternalLink,
    ShieldAlert,
    Edit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TransactionDetailSheetProps {
    transaction: AdminTransaction;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export default function TransactionDetailSheet({
    transaction,
    isOpen,
    onClose,
    onUpdate
}: TransactionDetailSheetProps) {
    const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'logs'>('details');
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [showActionModal, setShowActionModal] = useState<'status' | 'refund' | 'retry' | 'manual' | null>(null);

    // Action Form States
    const [actionReason, setActionReason] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [manualStatus, setManualStatus] = useState<'SUCCESS' | 'FAILED'>('SUCCESS');
    const [refundType, setRefundType] = useState<'BALANCE' | 'ORIGINAL_METHOD'>('BALANCE');
    const [providerCode, setProviderCode] = useState('');

    // Detailed transaction state
    const [detailTransaction, setDetailTransaction] = useState<AdminTransaction>(transaction);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    // Fetch detail on open
    React.useEffect(() => {
        if (isOpen && transaction.id) {
            const fetchDetail = async () => {
                try {
                    setIsDetailLoading(true);
                    const { getTransactionDetail } = await import('@/lib/adminApi');
                    const detail = await getTransactionDetail(transaction.id);
                    setDetailTransaction(detail);
                } catch (error) {
                    console.error('Failed to fetch transaction detail', error);
                    toast.error('Gagal memuat detail lengkap transaksi');
                } finally {
                    setIsDetailLoading(false);
                }
            };
            fetchDetail();
        } else {
            setDetailTransaction(transaction);
        }
    }, [isOpen, transaction.id, transaction]);

    if (!isOpen) return null;

    // Use detailTransaction instead of transaction for display
    const currentTransaction = detailTransaction;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Disalin ke clipboard');
    };

    const handleUpdateStatus = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!actionReason) return;

        try {
            setIsActionLoading(true);
            await updateTransactionStatus(transaction.id, {
                status: manualStatus,
                reason: actionReason,
                serialNumber: serialNumber || undefined
            });
            toast.success('Status transaksi berhasil diperbarui');
            onUpdate();
            setShowActionModal(null);
        } catch (error: any) {
            toast.error(error.message || 'Gagal memperbarui status');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleManualProcess = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!actionReason) return;

        try {
            setIsActionLoading(true);
            await manualTransaction(transaction.id, {
                serialNumber: serialNumber || undefined,
                reason: actionReason
            });
            toast.success('Transaksi berhasil diproses manual');
            onUpdate();
            setShowActionModal(null);
        } catch (error: any) {
            toast.error(error.message || 'Gagal memproses manual');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRefund = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!actionReason) return; // Spec requires reason

        try {
            setIsActionLoading(true);
            await refundTransaction(transaction.id, {
                reason: actionReason,
                refundTo: refundType,
                amount: transaction.pricing.total // Full refund by default based on spec typical usage, though spec has amount.
            });
            toast.success('Refund berhasil diproses');
            onUpdate();
            setShowActionModal(null);
        } catch (error: any) {
            toast.error(error.message || 'Gagal memproses refund');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRetry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!actionReason) return;

        try {
            setIsActionLoading(true);
            await retryTransaction(transaction.id, {
                providerCode: providerCode || undefined,
                reason: actionReason
            });
            toast.success('Retry berhasil diproses');
            onUpdate();
            setShowActionModal(null);
        } catch (error: any) {
            toast.error(error.message || 'Gagal melakukan retry');
        } finally {
            setIsActionLoading(false);
        }
    };

    const ActionModal = () => {
        if (!showActionModal) return null;

        return (
            <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900">
                        {showActionModal === 'status' && 'Update Status'}
                        {showActionModal === 'manual' && 'Proses Manual'}
                        {showActionModal === 'refund' && 'Refund Transaksi'}
                        {showActionModal === 'retry' && 'Retry Transaksi'}
                    </h3>

                    <form onSubmit={(e) => {
                        if (showActionModal === 'status') handleUpdateStatus(e);
                        if (showActionModal === 'manual') handleManualProcess(e);
                        if (showActionModal === 'refund') handleRefund(e);
                        if (showActionModal === 'retry') handleRetry(e);
                    }} className="space-y-4">

                        {/* Status Select for Update Status */}
                        {showActionModal === 'status' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status Baru</label>
                                <select
                                    value={manualStatus}
                                    onChange={(e) => setManualStatus(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:outline-none"
                                >
                                    <option value="SUCCESS">Success</option>
                                    <option value="FAILED">Failed</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="PROCESSING">Processing</option>
                                </select>
                            </div>
                        )}

                        {/* Serial Number for Status & Manual */}
                        {(showActionModal === 'status' || showActionModal === 'manual') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number / SN / Ref ID</label>
                                <input
                                    type="text"
                                    value={serialNumber}
                                    onChange={(e) => setSerialNumber(e.target.value)}
                                    placeholder="Masukkan SN jika ada"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:outline-none"
                                />
                            </div>
                        )}

                        {/* Refund Type */}
                        {showActionModal === 'refund' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tujuan Refund</label>
                                <select
                                    value={refundType}
                                    onChange={(e) => setRefundType(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:outline-none"
                                >
                                    <option value="BALANCE">Saldo Akun</option>
                                    <option value="ORIGINAL_METHOD">Metode Pembayaran Asal</option>
                                </select>
                            </div>
                        )}

                        {/* Retry Provider */}
                        {showActionModal === 'retry' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Provider Code (Optional)</label>
                                <input
                                    type="text"
                                    value={providerCode}
                                    onChange={(e) => setProviderCode(e.target.value)}
                                    placeholder="Kosongkan untuk auto"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:outline-none"
                                />
                            </div>
                        )}

                        {/* Reason - Required for all */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alasan <span className="text-red-500">*</span></label>
                            <textarea
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:outline-none min-h-[80px]"
                                placeholder="Jelaskan alasan tindakan ini..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowActionModal(null)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isActionLoading}
                                className="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isActionLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                Konfirmasi
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className={cn(
                "fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>

                {/* Header */}
                <div className="flex-none px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-lg font-bold text-gray-900">Detail Transaksi</h2>
                            <StatusBadge status={currentTransaction.status} size="sm" />
                            {isDetailLoading && <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-mono">
                            {currentTransaction.invoiceNumber}
                            <button
                                onClick={() => copyToClipboard(currentTransaction.invoiceNumber)}
                                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <Copy className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex-none px-6 border-b border-gray-200 bg-white">
                    <div className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={cn(
                                "py-3 text-sm font-medium border-b-2 transition-colors",
                                activeTab === 'details'
                                    ? "border-primary-600 text-primary-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Detail Info
                        </button>
                        <button
                            onClick={() => setActiveTab('timeline')}
                            className={cn(
                                "py-3 text-sm font-medium border-b-2 transition-colors",
                                activeTab === 'timeline'
                                    ? "border-primary-600 text-primary-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Timeline
                        </button>
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={cn(
                                "py-3 text-sm font-medium border-b-2 transition-colors",
                                activeTab === 'logs'
                                    ? "border-primary-600 text-primary-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Logs & Technical
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">

                    {activeTab === 'details' && (
                        <div className="space-y-6">

                            {/* Product Info */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                <div className="flex items-center gap-2 mb-4 text-gray-900 font-medium">
                                    <Package className="w-4 h-4 text-gray-500" />
                                    Produk & Item
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Produk</label>
                                        <p className="font-medium text-gray-900">{currentTransaction.product?.name || '-'}</p>
                                        <p className="text-xs text-gray-500 font-mono mt-0.5">{currentTransaction.product?.code}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Item SKU</label>
                                        <p className="font-medium text-gray-900">{currentTransaction.sku?.name || '-'}</p>
                                        <p className="text-xs text-gray-500 font-mono mt-0.5">{currentTransaction.sku?.code}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Account Info */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                <div className="flex items-center gap-2 mb-4 text-gray-900 font-medium">
                                    <User className="w-4 h-4 text-gray-500" />
                                    Akun Tujuan
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Target Input (ID/Zone)</label>
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono bg-gray-50 px-2 py-1 rounded text-gray-900">{currentTransaction.account?.inputs || '-'}</p>
                                            <button onClick={() => copyToClipboard(currentTransaction.account?.inputs || '')} className="text-gray-400 hover:text-gray-600">
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Nickname</label>
                                        <p className="font-medium text-gray-900">{currentTransaction.account?.nickname || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing & Payment */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                <div className="flex items-center gap-2 mb-4 text-gray-900 font-medium">
                                    <CreditCard className="w-4 h-4 text-gray-500" />
                                    Pembayaran
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Metode</label>
                                            <p className="font-medium text-gray-900">{currentTransaction.payment?.name || '-'}</p>
                                            <p className="text-xs text-gray-500 font-mono">{currentTransaction.payment?.code}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Status Bayar</label>
                                            <span className={cn(
                                                "inline-flex px-2 py-0.5 rounded text-xs font-semibold",
                                                currentTransaction.paymentStatus === 'PAID' ? "bg-green-100 text-green-700" :
                                                    currentTransaction.paymentStatus === 'UNPAID' ? "bg-yellow-100 text-yellow-700" :
                                                        "bg-red-100 text-red-700"
                                            )}>
                                                {currentTransaction.paymentStatus}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t border-dashed border-gray-200 pt-3 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Harga Beli (Modal)</span>
                                            <span className="font-mono text-gray-900">Rp {currentTransaction.pricing?.buyPrice?.toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Harga Jual</span>
                                            <span className="font-mono text-gray-900">Rp {currentTransaction.pricing?.sellPrice?.toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Biaya Layanan</span>
                                            <span className="font-mono text-gray-900">+ Rp {currentTransaction.pricing?.paymentFee?.toLocaleString('id-ID')}</span>
                                        </div>
                                        {currentTransaction.pricing?.discount > 0 && (
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span>Diskon</span>
                                                <span className="font-mono">- Rp {currentTransaction.pricing?.discount?.toLocaleString('id-ID')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-100">
                                            <span className="text-gray-900">Total</span>
                                            <span className="font-mono text-primary-600">Rp {currentTransaction.pricing?.total?.toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between text-xs bg-green-50 p-2 rounded border border-green-100 mt-2">
                                            <span className="text-green-700 font-medium">Estimasi Profit</span>
                                            <span className="font-mono text-green-700 font-bold">+ Rp {currentTransaction.pricing?.profit?.toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Provider Info */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                <div className="flex items-center gap-2 mb-4 text-gray-900 font-medium">
                                    <Server className="w-4 h-4 text-gray-500" />
                                    Provider & Teknis
                                </div>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Provider</label>
                                            <p className="font-medium text-gray-900">{currentTransaction.provider?.name || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Kode</label>
                                            <p className="font-mono text-gray-900 text-sm">{currentTransaction.provider?.code || '-'}</p>
                                        </div>
                                    </div>

                                    {currentTransaction.provider?.serialNumber && (
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                            <label className="text-xs text-gray-500 block mb-1">Serial Number / SN / Ref ID</label>
                                            <div className="flex items-center gap-2 w-full">
                                                <code className="font-mono text-sm text-gray-900 break-all">{currentTransaction.provider.serialNumber}</code>
                                                <button onClick={() => copyToClipboard(currentTransaction.provider.serialNumber || '')} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}

                    {activeTab === 'timeline' && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="space-y-6">
                                {currentTransaction.timeline && currentTransaction.timeline.length > 0 ? (
                                    currentTransaction.timeline.map((item, index) => (
                                        <div key={index} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className={cn(
                                                    "w-3 h-3 rounded-full mt-1.5",
                                                    index === 0 ? "bg-primary-600 ring-4 ring-primary-50" : "bg-gray-300"
                                                )} />
                                                {index !== currentTransaction.timeline!.length - 1 && (
                                                    <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={cn(
                                                        "text-sm font-semibold",
                                                        item.status === 'SUCCESS' ? "text-green-600" :
                                                            item.status === 'FAILED' ? "text-red-600" :
                                                                "text-gray-900"
                                                    )}>
                                                        {item.status}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(item.timestamp).toLocaleString('id-ID', {
                                                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">{item.message}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                        <p>Timeline belum tersedia</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'logs' && (
                        <div className="space-y-6">

                            {/* System Logs */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                                    System Logs
                                </h4>
                                {currentTransaction.logs && currentTransaction.logs.length > 0 ? (
                                    <div className="space-y-3">
                                        {currentTransaction.logs
                                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                            .map((log, index) => (
                                                <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 font-mono text-xs overflow-hidden">
                                                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                                                        <span className="font-bold text-gray-700">{log.type}</span>
                                                        <span className="text-gray-400">{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                                                    </div>
                                                    <pre className="text-gray-600 overflow-x-auto whitespace-pre-wrap break-all">
                                                        {JSON.stringify(log.data, null, 2)}
                                                    </pre>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 bg-white rounded-xl border border-gray-200 text-gray-500 text-sm">
                                        <FileText className="w-6 h-6 mx-auto mb-2 opacity-20" />
                                        <p>Belum ada log sistem</p>
                                    </div>
                                )}
                            </div>

                            {/* Payment Logs */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    Payment Logs ({currentTransaction.payment?.name || 'Unknown'})
                                </h4>
                                {currentTransaction.payment?.logs && currentTransaction.payment.logs.length > 0 ? (
                                    <div className="space-y-3">
                                        {currentTransaction.payment.logs
                                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                            .map((log, index) => (
                                                <div key={index} className="bg-white rounded-xl border border-blue-100 p-4 font-mono text-xs overflow-hidden">
                                                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-blue-50">
                                                        <span className="font-bold text-blue-700">{log.type}</span>
                                                        <span className="text-blue-400">{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                                                    </div>
                                                    <pre className="text-gray-600 overflow-x-auto whitespace-pre-wrap break-all">
                                                        {JSON.stringify(log.data, null, 2)}
                                                    </pre>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 bg-blue-50/50 rounded-xl border border-blue-100 text-gray-500 text-sm">
                                        <CreditCard className="w-6 h-6 mx-auto mb-2 opacity-20 text-blue-500" />
                                        <p>Belum ada log pembayaran</p>
                                    </div>
                                )}
                            </div>

                            {/* Provider Logs */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                    Provider Logs ({currentTransaction.provider?.name || 'Unknown'})
                                </h4>
                                {currentTransaction.provider?.logs && currentTransaction.provider.logs.length > 0 ? (
                                    <div className="space-y-3">
                                        {currentTransaction.provider.logs
                                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                            .map((log, index) => (
                                                <div key={index} className="bg-white rounded-xl border border-purple-100 p-4 font-mono text-xs overflow-hidden">
                                                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-purple-50">
                                                        <span className="font-bold text-purple-700">{log.type}</span>
                                                        <span className="text-purple-400">{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                                                    </div>
                                                    <pre className="text-gray-600 overflow-x-auto whitespace-pre-wrap break-all">
                                                        {JSON.stringify(log.data, null, 2)}
                                                    </pre>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 bg-purple-50/50 rounded-xl border border-purple-100 text-gray-500 text-sm">
                                        <Server className="w-6 h-6 mx-auto mb-2 opacity-20 text-purple-500" />
                                        <p>Belum ada log provider</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-4 mt-6">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Info Teknis Tambahan</h4>
                                <dl className="grid grid-cols-1 gap-2 text-xs">
                                    <div className="flex justify-between py-1 border-b border-gray-100">
                                        <dt className="text-gray-500">Device User Agent</dt>
                                        <dd className="text-gray-900 font-mono text-right truncate max-w-[200px]" title={currentTransaction.userAgent}>
                                            {currentTransaction.userAgent || '-'}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-gray-100">
                                        <dt className="text-gray-500">IP Address</dt>
                                        <dd className="text-gray-900 font-mono text-right">{currentTransaction.ipAddress}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="flex-none p-4 border-t border-gray-200 bg-white grid grid-cols-2 gap-3">
                    {/* Action buttons based on status */}
                    <button
                        onClick={() => {
                            setActionReason('Manual Update by Admin');
                            setManualStatus(currentTransaction.status as any);
                            setSerialNumber(currentTransaction.provider?.serialNumber || '');
                            setShowActionModal('status');
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        Update Status
                    </button>

                    <button
                        onClick={() => {
                            setActionReason('Retry transaction');
                            setProviderCode('');
                            setShowActionModal('retry');
                        }}
                        disabled={currentTransaction.status === 'SUCCESS'}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Retry
                    </button>

                    <button
                        onClick={() => {
                            setActionReason('Manual Process');
                            setSerialNumber('');
                            setShowActionModal('manual');
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-sm font-medium transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Manual Process
                    </button>

                    <button
                        onClick={() => {
                            setActionReason('Customer Request');
                            setRefundType('BALANCE');
                            setShowActionModal('refund');
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm font-medium transition-colors"
                    >
                        <DollarSign className="w-4 h-4" />
                        Refund
                    </button>
                </div>

                {/* Action Modal */}
                <ActionModal />

            </div>
        </>
    );
}
