"use client";

import React from 'react';

/**
 * ElectionVisuals.tsx
 * Subtle SVG illustrations for the Election Navigator UI.
 */

interface VisualProps {
  className?: string;
  size?: number;
}

export function BallotBoxIcon({ className, size = 48 }: VisualProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 12V7a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v5" />
      <path d="M4 12h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8z" />
      <line x1="9" y1="16" x2="15" y2="16" />
      <line x1="12" y1="2" x2="12" y2="5" />
    </svg>
  );
}

export function EVMIcon({ className, size = 48 }: VisualProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="12" y1="6" x2="12" y2="6" strokeWidth="3" />
      <line x1="12" y1="10" x2="12" y2="10" strokeWidth="3" />
      <line x1="12" y1="14" x2="12" y2="14" strokeWidth="3" />
      <circle cx="12" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function IndiaMapSymbol({ className, size = 48 }: VisualProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
      <path d="M12 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" opacity="0.3" />
    </svg>
  );
}
