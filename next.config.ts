import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['genkit', '@genkit-ai/google-genai'],
  // Remove console.log in production to reduce JS overhead
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  // Tree-shake large packages — reduces unused JS significantly
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      'date-fns',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-toast',
      '@radix-ui/react-slot',
      'zustand',
    ],
  },
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    const cspDirectives = [
      "default-src 'self'",
      `script-src 'self' ${isDev ? "'unsafe-eval'" : ""} 'unsafe-inline' https://apis.google.com https://*.firebaseio.com https://*.googleapis.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      `frame-src 'self' https: ${isDev ? "http:" : ""} https://*.firebaseapp.com https://*.google.com https://apis.google.com`,
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com",
      ...(!isDev ? [
        "require-trusted-types-for 'script'",
        "trusted-types default nextjs#bundler next-image-loader gapi#gapi goog#html",
      ] : []),
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspDirectives,
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          }
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'naraandratyaga.my.id',
          },
        ],
        destination: 'https://www.naraandratyaga.my.id/:path*',
        permanent: true,
      },
    ];
  },
  images: {
    // AVIF/WebP first — modern browsers get 30-50% smaller images
    formats: ['image/avif', 'image/webp'],
    // Granular device sizes to eliminate oversized images on mobile viewports
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 1 year cache for optimized images — huge performance win on repeat visits
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  }
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
