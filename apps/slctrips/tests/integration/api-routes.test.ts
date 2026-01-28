/**
 * Integration tests for API routes
 * Tests API endpoints with actual HTTP requests
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('API Routes Integration', () => {
  test.describe('Health Check Endpoints', () => {
    test('should have accessible API routes', async ({ request }) => {
      // Test that API routes are accessible (even if they return errors)
      const routes = [
        '/api/checkout',
        '/api/tripkits/request-access',
        '/api/purchases/by-session',
      ];

      for (const route of routes) {
        const response = await request.get(`${BASE_URL}${route}`);
        // Routes should respond (even with 400/401/500, not 404)
        expect(response.status()).not.toBe(404);
      }
    });
  });

  test.describe('Checkout API', () => {
    test('should require tripkit_id parameter', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/checkout`);
      const data = await response.json();

      expect(response.status()).toBe(400);
      expect(data).toHaveProperty('error');
    });

    test('should validate tripkit_id format', async ({ request }) => {
      const response = await request.get(
        `${BASE_URL}/api/checkout?tripkit_id=invalid`
      );

      // Should return 400 or 404 for invalid format
      expect([400, 404]).toContain(response.status());
    });
  });

  test.describe('Debug Endpoints', () => {
    test('should handle debug endpoint with slug parameter', async ({ request }) => {
      const response = await request.get(
        `${BASE_URL}/api/debug/destination-data?slug=test-slug`
      );

      // Should respond (may be 404 if slug doesn't exist, but not 500)
      expect(response.status()).not.toBe(500);
    });

    test('should require slug parameter for debug endpoint', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/debug/destination-data`);
      const data = await response.json();

      expect(response.status()).toBe(400);
      expect(data).toHaveProperty('error');
    });
  });

  test.describe('Error Handling', () => {
    test('should return JSON error responses', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/checkout`);
      const contentType = response.headers()['content-type'];

      expect(contentType).toContain('application/json');
    });

    test('should handle malformed requests gracefully', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/checkout`, {
        data: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });

      // Should return error, not crash
      expect(response.status()).toBeGreaterThanOrEqual(400);
    });
  });
});
