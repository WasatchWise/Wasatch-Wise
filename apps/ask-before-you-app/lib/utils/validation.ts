import { z } from 'zod';

// Contact form validation
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  organization: z.string().min(2, 'Organization name is required'),
  role: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// Quiz submission validation
export const quizSubmissionSchema = z.object({
  email: z.string().email('Invalid email address'),
  organizationName: z.string().optional(),
  role: z.string().optional(),
  answers: z.record(z.string()),
});

// Audit scheduling validation
export const auditScheduleSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  organization: z.string().min(2),
  auditDate: z.string(),
  preferredTime: z.string().optional(),
});

// Email capture validation
export const emailCaptureSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  organization: z.string().optional(),
  role: z.string().optional(),
  source: z.string(),
  leadMagnet: z.string().optional(),
});

// App request (suggest an app for review) validation
export const appRequestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.string().optional(),
  organization: z.string().optional(),
  appName: z.string().min(2, 'App name is required'),
  appUrl: z.string().optional(),
  reason: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type QuizSubmissionData = z.infer<typeof quizSubmissionSchema>;
export type AuditScheduleData = z.infer<typeof auditScheduleSchema>;
export type EmailCaptureData = z.infer<typeof emailCaptureSchema>;

