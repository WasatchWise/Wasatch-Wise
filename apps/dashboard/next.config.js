import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.join(__dirname, '../..');

const nextConfig = {
  outputFileTracingRoot: workspaceRoot,
  reactStrictMode: true,
  // Transpile pixi.js packages for proper ESM handling
  transpilePackages: ['pixi.js', '@pixi/react', 'pixi-viewport'],
  // Webpack config
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // NOTE: in workspaces, node_modules is at the repo root, not apps/dashboard
      'iceberg-js': path.join(workspaceRoot, 'node_modules/iceberg-js/dist/index.mjs'),
      'entities/lib/esm': path.join(workspaceRoot, 'node_modules/entities/lib'),
      '@selderee/plugin-htmlparser2': path.join(
        __dirname,
        'lib/shims/selderee-plugin-htmlparser2.ts'
      ),
    };

    // Fix PixiJS v8 ESM module resolution
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.mjs': ['.mjs', '.mts'],
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

