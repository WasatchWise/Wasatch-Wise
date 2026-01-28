import { z } from 'zod';

/**
 * Zod schema for server-side environment variables.
 * These are secrets and should never be exposed to the client.
 */
const serverEnvSchema = z.object({
    // AI Provider Keys (all optional - graceful degradation)
    OPENAI_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    HEYGEN_API_KEY: z.string().optional(),
    SUNO_API_KEY: z.string().optional(),
    SUNO_API_URL: z.string().url().optional(), // Self-hosted Suno API URL

    // Model Configuration (with defaults)
    OPENAI_MODEL_NAME: z.string().default('gpt-5.2'),
    GEMINI_MODEL_NAME: z.string().default('gemini-3'),

    // Neo4j Knowledge Graph (optional)
    NEO4J_URI: z.string().url().optional(),
    NEO4J_USER: z.string().optional(),
    NEO4J_PASSWORD: z.string().optional(),
});

/**
 * Zod schema for client-side environment variables.
 * These are prefixed with NEXT_PUBLIC_ and safe to expose.
 */
const clientEnvSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;
type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Parses and validates server environment variables.
 * Call this on the server side only.
 */
function parseServerEnv(): ServerEnv {
    const result = serverEnvSchema.safeParse({
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        HEYGEN_API_KEY: process.env.HEYGEN_API_KEY,
        SUNO_API_KEY: process.env.SUNO_API_KEY,
        SUNO_API_URL: process.env.SUNO_API_URL,
        OPENAI_MODEL_NAME: process.env.OPENAI_MODEL_NAME,
        GEMINI_MODEL_NAME: process.env.GEMINI_MODEL_NAME,
        NEO4J_URI: process.env.NEO4J_URI,
        NEO4J_USER: process.env.NEO4J_USER,
        NEO4J_PASSWORD: process.env.NEO4J_PASSWORD,
    });

    if (!result.success) {
        console.error('Invalid server environment configuration:', result.error.format());
        throw new Error('Invalid server environment configuration');
    }

    return result.data;
}

/**
 * Parses and validates client environment variables.
 * Safe to use on both client and server.
 */
function parseClientEnv(): ClientEnv {
    const result = clientEnvSchema.safeParse({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });

    if (!result.success) {
        console.error('Invalid client environment configuration:', result.error.format());
        throw new Error('Invalid client environment configuration');
    }

    return result.data;
}

// Lazy-loaded singletons to avoid parsing on every access
let _serverEnv: ServerEnv | null = null;
let _clientEnv: ClientEnv | null = null;

/**
 * Server-side configuration. Only use in server contexts.
 */
export const serverConfig = {
    get openai() {
        _serverEnv ??= parseServerEnv();
        return {
            apiKey: _serverEnv.OPENAI_API_KEY,
            modelName: _serverEnv.OPENAI_MODEL_NAME,
            isConfigured: Boolean(_serverEnv.OPENAI_API_KEY),
        };
    },

    get gemini() {
        _serverEnv ??= parseServerEnv();
        return {
            apiKey: _serverEnv.GEMINI_API_KEY,
            modelName: _serverEnv.GEMINI_MODEL_NAME,
            isConfigured: Boolean(_serverEnv.GEMINI_API_KEY),
        };
    },

    get heygen() {
        _serverEnv ??= parseServerEnv();
        return {
            apiKey: _serverEnv.HEYGEN_API_KEY,
            isConfigured: Boolean(_serverEnv.HEYGEN_API_KEY),
        };
    },

    get suno() {
        _serverEnv ??= parseServerEnv();
        return {
            apiKey: _serverEnv.SUNO_API_KEY,
            apiUrl: _serverEnv.SUNO_API_URL || 'http://localhost:8000',
            isConfigured: Boolean(_serverEnv.SUNO_API_KEY || _serverEnv.SUNO_API_URL),
        };
    },

    get neo4j() {
        _serverEnv ??= parseServerEnv();
        return {
            uri: _serverEnv.NEO4J_URI,
            user: _serverEnv.NEO4J_USER,
            password: _serverEnv.NEO4J_PASSWORD,
            isConfigured: Boolean(
                _serverEnv.NEO4J_URI &&
                _serverEnv.NEO4J_USER &&
                _serverEnv.NEO4J_PASSWORD
            ),
        };
    },
};

/**
 * Client-safe configuration. Can be used anywhere.
 */
export const clientConfig = {
    get supabase() {
        _clientEnv ??= parseClientEnv();
        return {
            url: _clientEnv.NEXT_PUBLIC_SUPABASE_URL,
            anonKey: _clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            isConfigured: Boolean(
                _clientEnv.NEXT_PUBLIC_SUPABASE_URL &&
                _clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
            ),
        };
    },
};

/**
 * Re-export schemas for external validation needs
 */
export { serverEnvSchema, clientEnvSchema };
export type { ServerEnv, ClientEnv };
