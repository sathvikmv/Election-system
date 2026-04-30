"use client";

/**
 * TechLogos.tsx
 * Inline SVG logos for Google Cloud technology stack.
 * Zero external dependencies — guaranteed to render on all networks.
 */

interface LogoProps {
  size?: number;
  className?: string;
}

export function GeminiLogo({ size = 64, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Google Gemini"
      role="img"
    >
      <defs>
        <linearGradient id="gemini-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="50%" stopColor="#9B72CB" />
          <stop offset="100%" stopColor="#D96570" />
        </linearGradient>
      </defs>
      {/* Gemini sparkle / star shape */}
      <path
        d="M12 2C12 2 13.5 8 16 10.5C18.5 13 24 12 24 12C24 12 18.5 11 16 13.5C13.5 16 12 22 12 22C12 22 10.5 16 8 13.5C5.5 11 0 12 0 12C0 12 5.5 13 8 10.5C10.5 8 12 2 12 2Z"
        fill="url(#gemini-grad)"
      />
    </svg>
  );
}

export function FirebaseLogo({ size = 64, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Firebase"
      role="img"
    >
      <path d="M5.85 24.49L8.29 4.75a.44.44 0 01.79-.21L11.56 7.8l2.35-4.46a.44.44 0 01.78 0L26.15 24.49" fill="#FFA000" />
      <path d="M5.85 24.49l5.76-3.57 5.08 3.57" fill="#F57F17" />
      <path d="M17.79 14.2l-3.14-9.76a.44.44 0 00-.78 0L11.56 7.8 17.79 14.2z" fill="#FFCA28" />
      <path d="M5.85 24.49L17.79 14.2l8.36 10.29-20.3 0z" fill="#FFCA28" />
      <path d="M11.61 20.92l5.08 3.57 9.46-5.86" fill="#F57F17" opacity="0.7" />
    </svg>
  );
}

export function BigQueryLogo({ size = 64, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Google BigQuery"
      role="img"
    >
      <rect width="64" height="64" rx="8" fill="#4285F4" />
      {/* Magnifying glass over data grid */}
      <rect x="12" y="14" width="24" height="4" rx="2" fill="white" opacity="0.9" />
      <rect x="12" y="22" width="18" height="4" rx="2" fill="white" opacity="0.7" />
      <rect x="12" y="30" width="20" height="4" rx="2" fill="white" opacity="0.7" />
      <circle cx="40" cy="38" r="10" stroke="white" strokeWidth="3" fill="none" />
      <line x1="47" y1="45" x2="54" y2="52" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function CloudRunLogo({ size = 64, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Google Cloud Run"
      role="img"
    >
      <defs>
        <linearGradient id="run-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1A73E8" />
          <stop offset="100%" stopColor="#34A853" />
        </linearGradient>
      </defs>
      {/* Cloud shape */}
      <path
        d="M48 30c0-8.84-7.16-16-16-16a16 16 0 00-15.78 13.5C11.88 28.58 8 32.84 8 38c0 5.52 4.48 10 10 10h30c4.42 0 8-3.58 8-8 0-4.08-3.05-7.44-7-7.9V30z"
        fill="url(#run-grad)"
      />
      {/* Play button triangle */}
      <path d="M27 25l14 8-14 8V25z" fill="white" />
    </svg>
  );
}

export function VertexAILogo({ size = 64, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Google Vertex AI"
      role="img"
    >
      <defs>
        <linearGradient id="vertex-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="100%" stopColor="#9B72CB" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="8" fill="url(#vertex-grad)" />
      {/* Neural network nodes */}
      <circle cx="12" cy="20" r="4" fill="white" opacity="0.9" />
      <circle cx="12" cy="44" r="4" fill="white" opacity="0.9" />
      <circle cx="32" cy="12" r="4" fill="white" />
      <circle cx="32" cy="32" r="5" fill="white" />
      <circle cx="32" cy="52" r="4" fill="white" />
      <circle cx="52" cy="22" r="4" fill="white" opacity="0.9" />
      <circle cx="52" cy="42" r="4" fill="white" opacity="0.9" />
      {/* Connections */}
      <line x1="16" y1="20" x2="28" y2="30" stroke="white" strokeWidth="1.5" opacity="0.6" />
      <line x1="16" y1="44" x2="28" y2="34" stroke="white" strokeWidth="1.5" opacity="0.6" />
      <line x1="32" y1="16" x2="32" y2="27" stroke="white" strokeWidth="1.5" opacity="0.6" />
      <line x1="32" y1="37" x2="32" y2="48" stroke="white" strokeWidth="1.5" opacity="0.6" />
      <line x1="36" y1="30" x2="48" y2="22" stroke="white" strokeWidth="1.5" opacity="0.6" />
      <line x1="36" y1="34" x2="48" y2="42" stroke="white" strokeWidth="1.5" opacity="0.6" />
      <line x1="32" y1="12" x2="48" y2="22" stroke="white" strokeWidth="1.5" opacity="0.4" />
      <line x1="32" y1="52" x2="48" y2="42" stroke="white" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}
