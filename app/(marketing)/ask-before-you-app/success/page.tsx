import Link from 'next/link';
import { Button } from '@/components/shared/Button';
import { CheckCircle } from 'lucide-react';

export default async function ReviewSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 sm:py-16 md:py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-8 sm:p-10">
          <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
            Your app review request has been received and payment confirmed. 
            Our team will begin your review within 24-48 hours.
          </p>

          {sessionId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Order ID:</span> {sessionId.substring(0, 20)}...
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-900 mb-2">What happens next?</p>
            <div className="text-left space-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">1.</span>
                <span>You'll receive a confirmation email with your review details</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">2.</span>
                <span>Our team will analyze the app within 24-48 hours</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">3.</span>
                <span>You'll receive your comprehensive review report via email</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/ask-before-you-app" variant="primary" size="lg">
              Back to App Reviews
            </Button>
            <Button href="/" variant="outline" size="lg">
              Return Home
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
