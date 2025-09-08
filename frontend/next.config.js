/** @type {import('next').NextConfig} */
const withMDX = require('@next/mdx')({ extension: /\.mdx?$/ });

// Optional bundle analyzer - only load if installed
let withBundleAnalyzer;
try {
  withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  });
} catch (error) {
  // Bundle analyzer not installed, use identity function
  withBundleAnalyzer = (config) => config;
}

const nextConfig = withBundleAnalyzer(withMDX({
  reactStrictMode: true,
  
  // Performance optimizations
  // swcMinify: true, // ❌ Removed for Next.js 15 compatibility
  compress: true,
  
  // Image optimization
  images: {
    domains: ['your-cdn.com', 'cdn.example.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NUDGE_ENGINE_API_KEY: process.env.NUDGE_ENGINE_API_KEY,
  },
  
  // Page extensions
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  
  // Webpack optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analyzer in development
    if (dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },
          firebase: {
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            name: 'firebase',
            priority: 20,
            chunks: 'all',
          },
          charts: {
            test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/,
            name: 'charts',
            priority: 20,
            chunks: 'all',
          },
        },
      };
    }
    
    // Tree shaking optimization
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;
    
    // Resolve optimizations
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
      '@/components': require('path').resolve(__dirname, 'components'),
      '@/store': require('path').resolve(__dirname, 'store'),
      '@/hooks': require('path').resolve(__dirname, 'hooks'),
      '@/lib': require('path').resolve(__dirname, 'lib'),
      '@/styles': require('path').resolve(__dirname, 'styles'),
    };
    
    return config;
  },
  
  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@headlessui/react',
      '@heroicons/react',
      'chart.js',
      'react-chartjs-2',
    ],
  },
  
  // Output configuration
  output: 'standalone',
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
}));

module.exports = nextConfig;
