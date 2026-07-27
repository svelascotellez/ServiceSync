import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, max-age=0, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;
