'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/Button';
import { Form, FormField, Input } from '@/components/shared/Form';
import { CheckCircle, Loader2 } from 'lucide-react';

const REVIEW_TIERS = [
  {
    id: 'basic',
    name: 'Basic Review',
    price: 49,
    description: 'Quick safety check for a single app',
    features: [
      'Privacy policy review',
      'Basic compliance check',
      'Summary report',
    ],
  },
  {
    id: 'standard',
    name: 'Standard Review',
    price: 149,
    description: 'Comprehensive analysis with AI detection',
    features: [
      'Full privacy audit',
      'AI functionality analysis',
      'Detailed report with recommendations',
    ],
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium Review',
    price: 299,
    description: 'Complete audit with bias assessment',
    features: [
      'Everything in Standard',
      'Bias and fairness evaluation',
      'Consultation call included',
    ],
  },
];

export default function RequestReviewPage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    appName: '',
    appUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) {
      setError('Please select a review tier');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/ask-before-you-app/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier,
          ...formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { checkoutUrl } = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 sm:py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Request an App Review
          </h1>
          <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Get a professional safety assessment for any educational app. Reviews are delivered within 24-48 hours.
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Review Tier Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Review Tier</h2>
            {REVIEW_TIERS.map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => setSelectedTier(tier.id)}
                className={`w-full text-left p-4 sm:p-6 rounded-lg border-2 transition-all ${
                  selectedTier === tier.id
                    ? 'border-orange-500 bg-orange-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-orange-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {tier.name}
                      {tier.popular && (
                        <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                          Most Popular
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{tier.description}</p>
                  </div>
                  <div className="text-2xl font-bold text-orange-500">
                    ${tier.price}
                  </div>
                </div>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          {/* Request Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Details</h2>
            <Form onSubmit={handleSubmit}>
              <FormField label="Your Name" required>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="John Doe"
                />
              </FormField>

              <FormField label="Email Address" required>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="john@example.com"
                />
              </FormField>

              <FormField label="Your Role">
                <Input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Parent, Teacher, Tech Coordinator"
                />
              </FormField>

              <FormField label="App Name" required>
                <Input
                  type="text"
                  value={formData.appName}
                  onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                  required
                  placeholder="Example: Khan Academy Kids"
                />
              </FormField>

              <FormField label="App URL (if available)">
                <Input
                  type="url"
                  value={formData.appUrl}
                  onChange={(e) => setFormData({ ...formData, appUrl: e.target.value })}
                  placeholder="https://..."
                />
              </FormField>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!selectedTier || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Proceed to Payment - $${REVIEW_TIERS.find(t => t.id === selectedTier)?.price || 0}`
                )}
              </Button>

              {!selectedTier && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Please select a review tier above
                </p>
              )}
            </Form>
          </div>
        </div>
      </div>
    </main>
  );
}
