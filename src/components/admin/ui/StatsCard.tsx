'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  loading?: boolean;
}

export default function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconBgColor = 'bg-primary/10',
  loading = false,
}: StatsCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {icon && (
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', iconBgColor)}>
            {icon}
          </div>
        )}
      </div>

      <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>

      {change !== undefined && (
        <div className="flex items-center gap-1">
          {isPositive && (
            <>
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">+{change}%</span>
            </>
          )}
          {isNegative && (
            <>
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-500">{change}%</span>
            </>
          )}
          {!isPositive && !isNegative && (
            <span className="text-sm font-medium text-gray-500">0%</span>
          )}
          {changeLabel && (
            <span className="text-sm text-gray-400 ml-1">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

