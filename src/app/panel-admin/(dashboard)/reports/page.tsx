'use client';

import React, { useState } from 'react';
import { StatsCard } from '@/components/admin/ui';
import { FileText, Download, TrendingUp, DollarSign, ShoppingCart, Users, Calendar, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedReport, setSelectedReport] = useState('revenue');

  const reports = [
    { id: 'revenue', title: 'Laporan Pendapatan', description: 'Total pendapatan, profit, dan margin', icon: DollarSign },
    { id: 'transactions', title: 'Laporan Transaksi', description: 'Detail semua transaksi', icon: ShoppingCart },
    { id: 'products', title: 'Laporan Produk', description: 'Performa produk dan SKU', icon: BarChart3 },
    { id: 'users', title: 'Laporan Pengguna', description: 'Statistik pengguna dan membership', icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Laporan</h1><p className="text-gray-500 mt-1">Lihat dan export laporan</p></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Total Pendapatan" value="Rp 15.4M" icon={<DollarSign className="w-5 h-5 text-primary-600" />} />
        <StatsCard title="Total Profit" value="Rp 1.54M" icon={<TrendingUp className="w-5 h-5 text-green-600" />} iconBgColor="bg-green-100" />
        <StatsCard title="Total Transaksi" value="154,200" icon={<ShoppingCart className="w-5 h-5 text-blue-600" />} iconBgColor="bg-blue-100" />
        <StatsCard title="Total Pengguna" value="25,000" icon={<Users className="w-5 h-5 text-purple-600" />} iconBgColor="bg-purple-100" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Periode</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1"><label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label><input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600" /></div>
          <div className="flex-1"><label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Akhir</label><input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600" /></div>
          <div className="flex items-end"><button className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"><Calendar className="w-4 h-4" />Terapkan</button></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} onClick={() => setSelectedReport(report.id)} className={cn('bg-white rounded-xl border-2 p-6 cursor-pointer transition-all', selectedReport === report.id ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300')}>
              <div className="flex items-start gap-4">
                <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', selectedReport === report.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600')}><Icon className="w-6 h-6" /></div>
                <div className="flex-1"><h3 className="font-semibold text-gray-900">{report.title}</h3><p className="text-sm text-gray-500 mt-1">{report.description}</p></div>
                {selectedReport === report.id && <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-semibold text-gray-900">Export Laporan</h2></div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"><Download className="w-4 h-4" />Export Excel (.xlsx)</button>
          <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"><Download className="w-4 h-4" />Export CSV (.csv)</button>
          <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"><FileText className="w-4 h-4" />Export PDF</button>
        </div>
      </div>
    </div>
  );
}

