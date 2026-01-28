/**
 * Validation schemas using Zod
 * Centralized validation logic for forms and API inputs
 */

import { z } from 'zod';

/**
 * Email validation schema
 * Note: trim and lowercase applied before email validation
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .trim()
  .toLowerCase()
  .email('Please enter a valid email address');

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Optional password schema (for updates)
 */
export const optionalPasswordSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || val.length >= 8,
    'Password must be at least 8 characters if provided'
  );

/**
 * Welcome Modal email capture schema
 */
export const welcomeModalSchema = z.object({
  email: z.union([z.literal(''), emailSchema]).optional(),
  visitorType: z.enum(['visitor', 'local', 'relocating']),
  preferences: z.array(z.enum(['tripkits', 'staykit', 'secrets', 'offers'])),
});

/**
 * User signup schema
 */
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

/**
 * User login schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Password reset request schema
 */
export const resetPasswordRequestSchema = z.object({
  email: emailSchema,
});

/**
 * Password reset schema
 */
export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
  token: z.string().min(1, 'Reset token is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

/**
 * TripKit access code redemption schema
 * Transforms input: trims whitespace and uppercases before validation
 * Returns object with code property for consistency
 */
export const accessCodeSchema = z.string()
  .min(1, 'Access code is required')
  .trim()
  .toUpperCase()
  .regex(/^TK-[A-Z0-9]{4}-[A-Z0-9]{4}$/, 'Invalid access code format')
  .transform((code) => ({ code }));

/**
 * Educator submission schema
 */
export const educatorSubmissionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: emailSchema,
  school: z.string().min(2, 'School name is required').max(200),
  grade: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().max(1000, 'Message must be less than 1000 characters').optional(),
});

/**
 * Contact form schema
 */
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: emailSchema,
  subject: z.string().min(3, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});

/**
 * Checkout metadata schema
 */
export const checkoutMetadataSchema = z.object({
  tripkitId: z.string().uuid('Invalid TripKit ID'),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  attribution: z.object({
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional(),
    referrer: z.string().optional(),
    landing_page: z.string().optional(),
  }).optional(),
});

/**
 * Helper function to validate data against a schema
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _error: 'Validation failed' } };
  }
}

/**
 * Helper function to validate email specifically
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  try {
    emailSchema.parse(email);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.issues[0]?.message };
    }
    return { valid: false, error: 'Invalid email' };
  }
}

/**
 * Helper function to validate password specifically
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  try {
    passwordSchema.parse(password);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.issues[0]?.message };
    }
    return { valid: false, error: 'Invalid password' };
  }
}

export default {
  emailSchema,
  passwordSchema,
  optionalPasswordSchema,
  welcomeModalSchema,
  signupSchema,
  loginSchema,
  resetPasswordRequestSchema,
  resetPasswordSchema,
  accessCodeSchema,
  educatorSubmissionSchema,
  contactFormSchema,
  checkoutMetadataSchema,
  validate,
  validateEmail,
  validatePassword,
};
