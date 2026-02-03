/**
 * Runtime env validation — fail fast with clear errors so we never run with
 * missing or invalid config. Revenue-critical: Supabase and Stripe must be
 * correct in production.
 */
import { z } from 'zod';

const serverEnvSchema = z.object({
  // Required for all server operations (auth, DB, RLS)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  // Optional: required for server-side admin (checkout, webhook, DAROS)
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Required for payments (revenue)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // Required for AI and email (lead gen, proposals)
  ANTHROPIC_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),

  // Optional integrations
  HEYGEN_API_KEY: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let _serverEnv: ServerEnv | null = null;

/**
 * Validates and returns server env. Throws on first use if required vars missing.
 * Call from server-only code (API routes, server components, server actions).
 */
export function getServerEnv(): ServerEnv {
  if (_serverEnv) return _serverEnv;
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new Error(`Invalid server env: ${msg}`);
  }
  _serverEnv = parsed.data;
  return _serverEnv;
}

/**
 * Client-safe env (only NEXT_PUBLIC_*). Use in client components.
 * Throws at module load if required vars missing so the app fails fast.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

let _clientEnv: z.infer<typeof clientEnvSchema> | null = null;

export function getClientEnv(): z.infer<typeof clientEnvSchema> {
  if (_clientEnv) return _clientEnv;
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  });
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new Error(`Invalid client env: ${msg}`);
  }
  _clientEnv = parsed.data;
  return _clientEnv;
}

/** Require Stripe server env; throw if missing (use in checkout/webhook routes). */
export function requireStripeEnv(): { STRIPE_SECRET_KEY: string; STRIPE_WEBHOOK_SECRET: string } {
  const env = getServerEnv();
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are required for payments');
  }
  return {
    STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: env.STRIPE_WEBHOOK_SECRET,
  };
}
