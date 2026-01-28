import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    // Load environment variables from .env files
    // Vite automatically exposes variables prefixed with VITE_ to the client
    const env = loadEnv(mode, '.', '');
    
    return {
      define: {
        // Legacy support for process.env (for Gemini API)
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // Ensure VITE_ prefixed variables are available
      envPrefix: ['VITE_', 'GEMINI_', 'SUPABASE_'],
    };
});
