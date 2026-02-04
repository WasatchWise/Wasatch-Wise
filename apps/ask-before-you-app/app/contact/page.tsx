'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
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

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const result = await submitContactForm(formData);

    if (result.success) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } else {
      setError(result.error || 'Failed to submit form');
    }

    setLoading(false);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 sm:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <p className="text-sm text-gray-500 mb-4">
            <Link href="/" className="text-orange-600 hover:underline">Ask Before You App</Link>
            {' '}/ Contact
          </p>
          <div className="bg-white rounded-xl border border-orange-100 shadow-sm p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Let&apos;s Talk</h1>
            <p className="text-gray-600 mb-8">
              Questions about student data privacy, NDPA certification, or how we work with the SDPC? 
              We&apos;ll help you map the real risks and the fastest path forward.
            </p>

            {success ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <p className="text-green-800 font-semibold mb-2">Message sent successfully.</p>
                <p className="text-green-700">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <Form onSubmit={handleSubmit}>
                <FormField label="Name" error={error} required>
                  <Input type="text" name="name" required />
                </FormField>
                <FormField label="Email" required>
                  <Input type="email" name="email" required />
                </FormField>
                <FormField label="Organization" required>
                  <Input type="text" name="organization" required />
                </FormField>
                <FormField label="Your role (optional)">
                  <Input type="text" name="role" />
                </FormField>
                <FormField label="Message" required>
                  <Textarea name="message" rows={6} required />
                </FormField>
                <Button type="submit" variant="primary" size="lg" disabled={loading}>
                  {loading ? 'Sending...' : 'Send message'}
                </Button>
              </Form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
