/**
 * Unit tests for validation schemas
 */

import {
  emailSchema,
  passwordSchema,
  signupSchema,
  loginSchema,
  accessCodeSchema,
  welcomeModalSchema,
} from '@/lib/validations';

describe('validations', () => {
  describe('emailSchema', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.com',
      ];

      validEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).not.toThrow();
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'user@',
        'user@domain',
        '',
      ];

      invalidEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).toThrow();
      });
    });

    it('should lowercase and trim email', () => {
      const result = emailSchema.parse('  TEST@EXAMPLE.COM  ');
      expect(result).toBe('test@example.com');
    });
  });

  describe('passwordSchema', () => {
    it('should validate strong passwords', () => {
      const validPasswords = [
        'Password123',
        'MyP@ssw0rd',
        'Test1234',
      ];

      validPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).not.toThrow();
      });
    });

    it('should reject weak passwords', () => {
      const invalidPasswords = [
        'short',           // too short
        'nouppercase123',  // no uppercase
        'NOLOWERCASE123',  // no lowercase
        'NoNumbers',       // no numbers
        '12345678',        // no letters
      ];

      invalidPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).toThrow();
      });
    });

    it('should require minimum 8 characters', () => {
      expect(() => passwordSchema.parse('Pass1')).toThrow();
      expect(() => passwordSchema.parse('Password1')).not.toThrow();
    });
  });

  describe('signupSchema', () => {
    it('should validate matching passwords', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      };

      expect(() => signupSchema.parse(validData)).not.toThrow();
    });

    it('should reject non-matching passwords', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Different123',
      };

      expect(() => signupSchema.parse(invalidData)).toThrow();
    });
  });

  describe('loginSchema', () => {
    it('should validate login credentials', () => {
      const validData = {
        email: 'test@example.com',
        password: 'anypassword',
      };

      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it('should require email and password', () => {
      expect(() => loginSchema.parse({ email: '', password: 'pass' })).toThrow();
      expect(() => loginSchema.parse({ email: 'test@example.com', password: '' })).toThrow();
    });
  });

  describe('accessCodeSchema', () => {
    it('should validate correct access code format', () => {
      const validCodes = [
        'TK-ABCD-1234',
        'TK-1234-ABCD',
        'TK-A1B2-C3D4',
      ];

      validCodes.forEach(code => {
        expect(() => accessCodeSchema.parse(code)).not.toThrow();
      });
    });

    it('should reject invalid access code formats', () => {
      const invalidCodes = [
        'TK-ABCD',
        'TK-ABCD-12345',
        'TK-abc-1234',
        'invalid',
        '',
      ];

      invalidCodes.forEach(code => {
        expect(() => accessCodeSchema.parse(code)).toThrow();
      });
    });

    it('should uppercase and trim codes', () => {
      const result = accessCodeSchema.parse('  tk-abcd-1234  ');
      expect(result.code).toBe('TK-ABCD-1234');
    });
  });

  describe('welcomeModalSchema', () => {
    it('should validate welcome modal data', () => {
      const validData = {
        email: 'test@example.com',
        visitorType: 'visitor' as const,
        preferences: ['tripkits', 'staykit'] as const,
      };

      expect(() => welcomeModalSchema.parse(validData)).not.toThrow();
    });

    it('should allow empty email', () => {
      const validData = {
        email: '',
        visitorType: 'local' as const,
        preferences: ['secrets'] as const,
      };

      expect(() => welcomeModalSchema.parse(validData)).not.toThrow();
    });

    it('should validate visitor types', () => {
      const invalidData = {
        email: '',
        visitorType: 'invalid' as any,
        preferences: ['tripkits'] as const,
      };

      expect(() => welcomeModalSchema.parse(invalidData)).toThrow();
    });
  });
});
