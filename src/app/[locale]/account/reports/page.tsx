'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import { Button, Input, LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { getReports } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Report } from '@/types';

export default function ReportsPage() {
  const { token } = useAuth();
  const { regionCode, currency, language } = useLocale();
  const { t } = useTranslation();

  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    async function fetchReports() {
      if (!token) return;
      setIsLoading(true);

      try {
        const response = await getReports(token.accessToken, {
          region: regionCode,
          startDate,
          endDate,
        });

        if (response.data) {
          setReports(response.data.reports);
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReports();
  }, [token, regionCode, startDate, endDate]);

  const handleFilter = () => {
    // Refetch with filters
    setIsLoading(true);
    // The useEffect will handle the actual fetch
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {t('reports')}
        </h1>

        {/* Date Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            label={t('startDate')}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
          />
          <Input
            label={t('endDate')}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
          />
          <div className="flex items-end">
            <Button onClick={handleFilter}>
              {t('filter')}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {t('noReports')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('period')}
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('totalTransactions')}
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('success')}
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('failed')}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('totalAmount')}
                  </th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                      {report.date}
                    </td>
                    <td className="py-4 px-4 text-sm text-center text-gray-700 dark:text-gray-300">
                      {report.totalTransactions}
                    </td>
                    <td className="py-4 px-4 text-sm text-center text-green-600 dark:text-green-400">
                      -
                    </td>
                    <td className="py-4 px-4 text-sm text-center text-red-600 dark:text-red-400">
                      -
                    </td>
                    <td className="py-4 px-4 text-sm text-right font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(report.totalAmount, currency)}
                    </td>
                    <td className="py-4 px-4">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

