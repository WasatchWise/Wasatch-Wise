'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/shared/Button';
import { Form, FormField, Input } from '@/components/shared/Form';
import { CheckCircle, Loader2, ArrowRight, BookOpen, Search, FileCheck } from 'lucide-react';
import { submitAppRequest } from '@/app/actions/request-app';

export default function RequestReviewPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    organization: '',
    appName: '',
    appUrl: '',
    reason: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await submitAppRequest({
      name: formData.name,
      email: formData.email,
      role: formData.role || undefined,
      organization: formData.organization || undefined,
      appName: formData.appName,
      appUrl: formData.appUrl || undefined,
      reason: formData.reason || undefined,
    });

    setLoading(false);
    if (result.success) setSubmitted(true);
    else setError(result.error ?? 'Something went wrong. Please try again.');
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 sm:py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-8 sm:p-12">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Thank You!
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Your app suggestion has been received. We review community submissions to help prioritize 
              which apps get added to our resources and the SDPC Registry guidance.
            </p>
            
            <div className="bg-orange-50 rounded-xl p-6 mb-8 text-left">
              <h2 className="font-semibold text-gray-900 mb-3">While you wait, you can:</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    <Link href="/certification" className="text-orange-600 hover:text-orange-700 font-medium">
                      Take our free certification course
                    </Link>{' '}
                    to learn how to vet apps yourself
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Search className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    <a 
                      href="https://sdpc.a4l.org/search.php" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Search the SDPC Registry
                    </a>{' '}
                    to see if this app already has agreements in other states
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <FileCheck className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    <Link href="/ecosystem" className="text-orange-600 hover:text-orange-700 font-medium">
                      Explore your state's resources
                    </Link>{' '}
                    to find existing DPA agreements
                  </span>
                </li>
              </ul>
            </div>

            <Button href="/" variant="outline" size="lg">
              Return Home
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 sm:py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Suggest an App for Review
          </h1>
          <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Help the community by suggesting apps that need privacy review. We use these suggestions 
            to prioritize resources and guidance.
          </p>
        </header>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Info Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-[#005696] to-[#2b6cb0] rounded-2xl p-6 text-white">
              <h2 className="text-lg font-semibold mb-3">How This Helps</h2>
              <p className="text-blue-100 text-sm leading-relaxed mb-4">
                Community suggestions help us identify which apps educators need guidance on most. 
                We compile these into training materials and work with the SDPC to improve registry coverage.
              </p>
              <p className="text-blue-100 text-sm leading-relaxed">
                <strong className="text-white">This is not a paid review service.</strong> For immediate 
                needs, use our free certification course to learn how to vet apps yourself.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-orange-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Need Help Now?</h2>
              <ul className="space-y-4">
                <li>
                  <Link 
                    href="/certification" 
                    className="flex items-center gap-3 text-orange-600 hover:text-orange-700 font-medium group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block">Free Certification</span>
                      <span className="text-xs text-gray-500 font-normal">Learn to vet apps in 50 min</span>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <a 
                    href="https://sdpc.a4l.org/search.php" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-orange-600 hover:text-orange-700 font-medium group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <Search className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block">SDPC Registry</span>
                      <span className="text-xs text-gray-500 font-normal">Search existing agreements</span>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Suggestion Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-orange-100 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">App Details</h2>
            <Form onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Your Name" required>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Jane Smith"
                  />
                </FormField>

                <FormField label="Email Address" required>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="jane@school.edu"
                  />
                </FormField>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Your Role">
                  <Input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Tech Coordinator, Teacher, etc."
                  />
                </FormField>

                <FormField label="Organization/District">
                  <Input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Example School District"
                  />
                </FormField>
              </div>

              <FormField label="App Name" required>
                <Input
                  type="text"
                  value={formData.appName}
                  onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                  required
                  placeholder="Example: ClassDojo, Nearpod, etc."
                />
              </FormField>

              <FormField label="App URL or Store Link">
                <Input
                  type="url"
                  value={formData.appUrl}
                  onChange={(e) => setFormData({ ...formData, appUrl: e.target.value })}
                  placeholder="https://..."
                />
              </FormField>

              <FormField label="Why are you interested in this app?">
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Teacher requested it, evaluating for district-wide adoption, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  rows={3}
                />
              </FormField>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Suggestion'
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                This is a free community service. For urgent needs, use our{' '}
                <Link href="/certification" className="text-orange-600 hover:underline">
                  free certification course
                </Link>{' '}
                to learn app vetting skills.
              </p>
            </Form>
          </div>
        </div>
      </div>
    </main>
  );
}
