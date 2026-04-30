import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'Election Navigator AI',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: 'AIzaSyCQ2V1ljjUvmYoSzPGjT-Jroqq5FnyAjdk',
  },
};

export default nextConfig;
