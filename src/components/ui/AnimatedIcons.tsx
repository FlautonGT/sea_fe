'use client';

import React from 'react';
import { motion } from 'framer-motion';

// --- Types ---
interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

// --- Success Icon (Animated Checkmark) ---
export const AnimatedCheck = ({ className, size = 48, color = 'currentColor' }: IconProps) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial="hidden"
      animate="visible"
    >
      <motion.path
        d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
              pathLength: { delay: 0.2, type: 'spring', duration: 1.5, bounce: 0 },
              opacity: { delay: 0.2, duration: 0.01 },
            },
          },
        }}
      />
      <motion.path
        d="M22 4L12 14.01l-3-3"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
              pathLength: { delay: 0.8, type: 'spring', duration: 1.5, bounce: 0 },
              opacity: { delay: 0.8, duration: 0.01 },
            },
          },
        }}
      />
    </motion.svg>
  );
};

// --- Processing Icon (Animated Hourglass/Spinner) ---
export const AnimatedProcessing = ({ className, size = 48, color = 'currentColor' }: IconProps) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <motion.span
        className="absolute top-0 left-0 block rounded-full opacity-20"
        style={{
          width: size,
          height: size,
          border: `4px solid ${color}`,
        }}
      />
      <motion.span
        className="absolute top-0 left-0 block rounded-full"
        style={{
          width: size,
          height: size,
          border: `4px solid ${color}`,
          borderTopColor: 'transparent',
          borderRightColor: 'transparent',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {/* Inner pulsating dot */}
      <motion.div
        className="absolute top-1/2 left-1/2 rounded-full"
        style={{
          width: size * 0.4,
          height: size * 0.4,
          backgroundColor: color,
          marginLeft: -(size * 0.4) / 2,
          marginTop: -(size * 0.4) / 2,
        }}
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

// --- Pending Icon (Animated Scan/Payment) ---
export const AnimatedPending = ({ className, size = 48, color = 'currentColor' }: IconProps) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Card outline */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>

      {/* Scan line */}
      <motion.div
        className="absolute left-[10%] w-[80%] bg-current opacity-50"
        style={{
          height: 2,
          backgroundColor: color
        }}
        animate={{
          top: ['30%', '70%', '30%'],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

// --- Failed Icon (Animated X) ---
export const AnimatedFailed = ({ className, size = 48, color = 'currentColor' }: IconProps) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial="hidden"
      animate="visible"
    >
      <motion.line
        x1="18"
        y1="6"
        x2="6"
        y2="18"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
              pathLength: { delay: 0.2, type: 'spring', duration: 1.5, bounce: 0 },
              opacity: { delay: 0.2, duration: 0.01 },
            },
          },
        }}
      />
      <motion.line
        x1="6"
        y1="6"
        x2="18"
        y2="18"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
              pathLength: { delay: 0.5, type: 'spring', duration: 1.5, bounce: 0 },
              opacity: { delay: 0.5, duration: 0.01 },
            },
          },
        }}
      />
    </motion.svg>
  );
};

// --- Expired Icon (Animated Clock) ---
export const AnimatedExpired = ({ className, size = 48, color = 'currentColor' }: IconProps) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial="hidden"
      animate="visible"
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 1, ease: "easeInOut" }
          }
        }}
      />
      <motion.polyline
        points="12 6 12 12 16 14"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: { delay: 0.5, duration: 1, ease: "easeInOut" }
          }
        }}
      />
    </motion.svg>
  );
};

// --- Refunded Icon (Animated Undo/Return) ---
export const AnimatedRefunded = ({ className, size = 48, color = 'currentColor' }: IconProps) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial="hidden"
      animate="visible"
    >
      {/* Circle Arrow */}
      <motion.path
        d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 1.5, ease: "easeInOut" }
          }
        }}
      />
      <motion.path
        d="M3 3v5h5"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: { delay: 1, duration: 0.5, ease: "easeInOut" }
          }
        }}
      />
      {/* Dollar Sign inside */}
      <motion.path
        d="M12 7v10"
        strokeWidth={1.5}
        variants={{
          hidden: { opacity: 0, y: 5 },
          visible: { opacity: 1, y: 0, transition: { delay: 1.5, duration: 0.5 } }
        }}
      />
      <motion.path
        d="M14 9h-3a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-3"
        strokeWidth={1.5}
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1, transition: { delay: 1.5, duration: 0.5 } }
        }}
      />
    </motion.svg>
  );
};

// --- Zap Icon (Flash Sale) ---
export const AnimatedZap = ({ className, size = 24, color = 'currentColor' }: IconProps) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color} // Filled for better impact
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <motion.polygon
        points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
        style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
        animate={{
          scale: [1, 1.25, 1],
          opacity: [1, 0.7, 1],
          filter: ["drop-shadow(0 0 0px rgba(239, 68, 68, 0))", "drop-shadow(0 0 10px rgba(239, 68, 68, 0.6))", "drop-shadow(0 0 0px rgba(239, 68, 68, 0))"]
        }}
        transition={{
          duration: 1.5, // Slightly faster pulse
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.svg>
  );
};

// --- Star Icon (Favorites) ---
export const AnimatedStar = ({ className, size = 24, color = 'currentColor' }: IconProps) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <motion.polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
        animate={{
          rotate: [0, 15, -15, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 2.5, // Slightly faster
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 0.2
        }}
      />
    </motion.svg>
  );
};

// --- Trending Icon (Graph) ---
export const AnimatedTrending = ({ className, size = 24, color = 'currentColor' }: IconProps) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial="hidden"
      animate="visible"
    >
      <motion.polyline
        points="23 6 13.5 15.5 8.5 10.5 1 18"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 1,
              repeatType: "reverse"
            }
          }
        }}
      />
      <motion.polyline
        points="17 6 23 6 23 12"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 1,
              repeatType: "reverse"
            }
          }
        }}
      />
    </motion.svg>
  );
};
