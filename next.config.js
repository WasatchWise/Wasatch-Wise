import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'iceberg-js': path.join(process.cwd(), 'node_modules/iceberg-js/dist/index.mjs'),
      'entities/lib/esm': path.join(process.cwd(), 'node_modules/entities/lib'),
      '@selderee/plugin-htmlparser2': path.join(
        process.cwd(),
        'lib/shims/selderee-plugin-htmlparser2.ts'
      ),
    };

    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

