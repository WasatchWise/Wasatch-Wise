/**
 * Configuration validation tests
 * Ensures all required environment variables and configurations are present
 */

import { describe, it, expect } from '@jest/globals';

describe('Configuration Validation', () => {
  describe('Environment Variables', () => {
    it('should have required Supabase variables', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
    });

    it('should have Supabase URL format', () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (url) {
        expect(url).toMatch(/^https?:\/\//);
      }
    });

    it('should have optional but recommended Stripe keys', () => {
      // These are optional but recommended for production
      const hasStripe = 
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
        process.env.STRIPE_SECRET_KEY;
      
      // Log warning if missing but don't fail test
      if (!hasStripe) {
        console.warn('Stripe keys not configured - checkout features may not work');
      }
    });
  });

  describe('Build Configuration', () => {
    it('should have valid Node version', () => {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      
      // Require Node 18+
      expect(majorVersion).toBeGreaterThanOrEqual(18);
    });

    it('should have required npm packages', async () => {
      const fs = require('fs');
      const packageJson = JSON.parse(
        fs.readFileSync('package.json', 'utf-8')
      );

      const requiredDeps = [
        'next',
        'react',
        'react-dom',
        '@supabase/supabase-js',
      ];

      requiredDeps.forEach(dep => {
        expect(packageJson.dependencies || packageJson.devDependencies).toHaveProperty(dep);
      });
    });
  });

  describe('TypeScript Configuration', () => {
    it('should have tsconfig.json', () => {
      const fs = require('fs');
      expect(fs.existsSync('tsconfig.json')).toBe(true);
    });

    it('should have valid TypeScript config', () => {
      const fs = require('fs');
      const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf-8'));
      
      expect(tsconfig.compilerOptions).toBeDefined();
      expect(tsconfig.compilerOptions.target).toBeDefined();
    });
  });

  describe('Next.js Configuration', () => {
    it('should have next.config.js or next.config.mjs', () => {
      const fs = require('fs');
      const hasConfig = 
        fs.existsSync('next.config.js') ||
        fs.existsSync('next.config.mjs') ||
        fs.existsSync('next.config.ts');
      
      expect(hasConfig).toBe(true);
    });
  });
});
