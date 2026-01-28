import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          name: 'local-gemini-api',
          configureServer(server) {
            server.middlewares.use('/api/recommendation', async (req, res) => {
              if (req.method !== 'POST') {
                res.statusCode = 405;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED' } }));
                return;
              }

              const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
              if (!apiKey) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    error: {
                      code: 'MISSING_GEMINI_API_KEY',
                      message:
                        'Missing GEMINI_API_KEY. Create a .env.local file (copy from env.local.example) and set GEMINI_API_KEY.',
                    },
                  }),
                );
                return;
              }

              try {
                const body = await new Promise<string>((resolve, reject) => {
                  let data = '';
                  req.on('data', (chunk) => (data += chunk));
                  req.on('end', () => resolve(data));
                  req.on('error', reject);
                });

                const filters = JSON.parse(body || '{}');
                const { recommendRestaurantWithGemini } = await import(
                  './server/geminiRecommendation'
                );

                const result = await recommendRestaurantWithGemini(filters, apiKey);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result));
              } catch (err) {
                // eslint-disable-next-line no-console
                console.error('Recommendation API error:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    error: { code: 'INTERNAL_ERROR', message: 'Failed to get recommendation.' },
                  }),
                );
              }
            });
          },
        },
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
