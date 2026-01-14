'use client';

import { useState } from 'react';
import { submitContactForm } from '@/app/actions/contact';
import { Form, FormField, Input, Textarea } from '@/components/shared/Form';
import { Button } from '@/components/shared/Button';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await submitContactForm(formData);

    if (result.success) {
      setSuccess(true);
      e.currentTarget.reset();
    } else {
      setError(result.error || 'Failed to submit form');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
          <p className="text-gray-600 mb-8">
            Have questions? Want to book a Cognitive Audit? We'd love to hear from you.
          </p>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <p className="text-green-800 font-semibold mb-2">
                ✓ Message sent successfully!
              </p>
              <p className="text-green-700">
                We'll get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <FormField label="Name" error={error}>
                <Input type="text" name="name" required />
              </FormField>
              <FormField label="Email">
                <Input type="email" name="email" required />
              </FormField>
              <FormField label="Organization">
                <Input type="text" name="organization" required />
              </FormField>
              <FormField label="Your Role (Optional)">
                <Input type="text" name="role" />
              </FormField>
              <FormField label="Message">
                <Textarea name="message" rows={6} required />
              </FormField>
              <Button type="submit" variant="primary" size="lg" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}

