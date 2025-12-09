'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
}

export default function Logo({ className, width, height, alt = 'Gate' }: LogoProps) {
  const { theme } = useTheme();
  
  // Use dark logo when theme is dark
  const logoSrc = theme === 'dark' ? '/logo_dark.svg' : '/logo.svg';

  return (
    <img
      src={logoSrc}
      alt={alt}
      className={cn('transition-opacity', className)}
      width={width}
      height={height}
    />
  );
}

