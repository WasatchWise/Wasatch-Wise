'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { submitContactForm } from '@/app/actions/contact';
import { Form, FormField, Input, Textarea } from '@/components/shared/Form';
import { Button } from '@/components/shared/Button';
import { BookingCTA } from '@/components/shared/BookingCTA';
import { trackEvent } from '@/lib/utils/analytics';

function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const service = searchParams.get('service');

  useEffect(() => {
    trackEvent.contactFormViewed();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await submitContactForm(formData);

    if (result.success) {
      setSuccess(true);
      trackEvent.contactFormSubmitted(service || undefined);
      e.currentTarget.reset();
    } else {
      setError(result.error || 'Failed to submit form');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Quick Booking Option */}
        <div className="mb-8">
          <BookingCTA
            source="contact_page"
            heading="Prefer to Schedule Directly?"
            description="Skip the form — book a free 30-minute AI governance consultation now."
            buttonText="Book Free Consultation"
          />
        </div>

        <div className="text-center text-gray-500 text-sm mb-8">
          — or send us a message below —
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-2">Let&apos;s Talk</h1>
          <p className="text-gray-600 mb-8">
            If you&apos;re seeing shadow AI, training gaps, or parent concerns, you&apos;re not
            alone. We&apos;ll help you map the real risks and the fastest path forward.
          </p>

          {success ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <p className="text-green-800 font-semibold mb-2">
                  Message sent successfully!
                </p>
                <p className="text-green-700 mb-4">
                  We&apos;ll get back to you within 24 hours.
                </p>
                <p className="text-green-600 text-sm">
                  Want faster? Book a consultation slot directly:
                </p>
              </div>
              <div className="text-center">
                <BookingCTA
                  source="contact_success"
                  compact
                  buttonText="Book a Time Now"
                />
              </div>
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
              {service && (
                <FormField label="Service Interest">
                  <Input type="text" name="service" defaultValue={service} readOnly className="bg-gray-50" />
                </FormField>
              )}
              <FormField label="Message">
                <Textarea
                  name="message"
                  rows={6}
                  required
                  defaultValue={
                    service
                      ? `I'm interested in learning more about the ${service} service for my district.`
                      : ''
                  }
                />
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

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 py-12" />}>
      <ContactForm />
    </Suspense>
  );
}
