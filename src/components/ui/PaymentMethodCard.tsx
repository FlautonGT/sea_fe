'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { PaymentChannel, PaymentChannelCategory } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';

interface PaymentCategoryProps {
  category: PaymentChannelCategory;
  channels: PaymentChannel[];
  selectedChannel: PaymentChannel | null;
  onSelectChannel: (channel: PaymentChannel) => void;
  isExpanded: boolean;
  onToggle: () => void;
  amount: number;
  currency: string;
}

export default function PaymentCategory({
  category,
  channels,
  selectedChannel,
  onSelectChannel,
  isExpanded,
  onToggle,
  amount,
  currency,
}: PaymentCategoryProps) {
  const categoryChannels = channels.filter(
    (ch) => ch.category.code === category.code
  );

  if (categoryChannels.length === 0) return null;

  // Featured channels for collapsed view
  const featuredChannels = categoryChannels.filter((ch) => ch.featured).slice(0, 4);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-900 dark:text-white">
            {category.title}
          </span>
          {/* Show featured channel logos when collapsed */}
          {!isExpanded && featuredChannels.length > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              {featuredChannels.map((ch) => (
                <Image
                  key={ch.code}
                  src={ch.image}
                  alt={ch.name}
                  width={32}
                  height={20}
                  className="h-5 w-auto object-contain"
                />
              ))}
            </div>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categoryChannels.map((channel) => {
              const isSelected = selectedChannel?.code === channel.code;
              const fee = channel.feeAmount + (amount * channel.feePercentage) / 100;
              const totalWithFee = amount + fee;

              return (
                <button
                  key={channel.code}
                  onClick={() => onSelectChannel(channel)}
                  className={cn(
                    "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all",
                    isSelected
                      ? "border-primary-500 bg-white dark:bg-gray-800"
                      : "border-transparent bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                >
                  <Image
                    src={channel.image}
                    alt={channel.name}
                    width={48}
                    height={32}
                    className="h-8 w-auto object-contain mb-2"
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                    {channel.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatCurrency(totalWithFee, currency)}
                  </span>
                  
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface PaymentMethodListProps {
  categories: PaymentChannelCategory[];
  channels: PaymentChannel[];
  selectedChannel: PaymentChannel | null;
  onSelectChannel: (channel: PaymentChannel) => void;
  amount: number;
  currency: string;
}

export function PaymentMethodList({
  categories,
  channels,
  selectedChannel,
  onSelectChannel,
  amount,
  currency,
}: PaymentMethodListProps) {
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(
    categories[0]?.code || null
  );

  const handleToggle = (categoryCode: string) => {
    setExpandedCategory(expandedCategory === categoryCode ? null : categoryCode);
  };

  // Sort categories by order
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-3">
      {sortedCategories.map((category) => (
        <PaymentCategory
          key={category.code}
          category={category}
          channels={channels}
          selectedChannel={selectedChannel}
          onSelectChannel={onSelectChannel}
          isExpanded={expandedCategory === category.code}
          onToggle={() => handleToggle(category.code)}
          amount={amount}
          currency={currency}
        />
      ))}
    </div>
  );
}

