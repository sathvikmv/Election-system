import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'Election Navigator AI',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: 'AIzaSyCQ2V1ljjUvmYoSzPGjT-Jroqq5FnyAjdk',
    NEXT_PUBLIC_FIREBASE_API_KEY: 'AQ.Ab8RN6KWSVEFHvK0-0xX9j3cTcvjtVBYymxXnj4f4n7pIbr-Nw',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'just-rhythm-328816.firebaseapp.com',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'just-rhythm-328816',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'just-rhythm-328816.firebasestorage.app',
  },
};

export default nextConfig;
