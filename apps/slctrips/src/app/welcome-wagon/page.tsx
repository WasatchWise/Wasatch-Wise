'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShareButton from '@/components/ShareButton';
import { showSuccess, showError } from '@/lib/toast';
import { captureEmail, sendWelcomeGuide, EmailCaptureSource } from '@/lib/emailCapture';
import { getAttributionForStripe } from '@/lib/attribution';

// Modal state types for better UX
type EmailModalState =
  | 'form' // Initial form view
  | 'sending' // While sending
  | 'success' // Email sent successfully
  | 'partial_success' // Captured but email failed (with retry option)
  | 'error'; // Complete failure

interface EmailModalData {
  email: string;
  name: string;
  correlationId?: string;
  errorMessage?: string;
}

export default function WelcomeWagonPage() {
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Enhanced email modal state
  const [emailModalState, setEmailModalState] = useState<EmailModalState>('form');
  const [emailModalData, setEmailModalData] = useState<EmailModalData>({ email: '', name: '' });
  const [retryCount, setRetryCount] = useState(0);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset modal state when closing
  const closeEmailModal = () => {
    setEmailModalOpen(false);
    setEmailModalState('form');
    setEmailModalData({ email: '', name: '' });
    setRetryCount(0);
  };

  // Focus trap for accessibility
  useEffect(() => {
    if (emailModalOpen && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [emailModalOpen]);

  // Handle email retry
  const handleRetryEmail = async () => {
    if (!emailModalData.email) return;

    setEmailModalState('sending');
    const result = await sendWelcomeGuide(emailModalData.email, emailModalData.name);

    if (result.success) {
      setEmailModalState('success');
      showSuccess('Email sent! Check your inbox.');
    } else {
      setRetryCount(prev => prev + 1);
      setEmailModalData(prev => ({
        ...prev,
        errorMessage: result.error,
        correlationId: result.correlationId,
      }));
      setEmailModalState('partial_success');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    setEmailModalState('sending');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;

    setEmailModalData({ email, name });

    try {
      // Step 1: Capture email with attribution
      const captureResult = await captureEmail({
        email,
        source: 'welcome_wagon_free_guide',
        visitorType: 'relocating',
        name,
      });

      if (!captureResult.success) {
        setEmailModalData(prev => ({
          ...prev,
          errorMessage: captureResult.error,
          correlationId: captureResult.correlationId,
        }));
        setEmailModalState('error');
        setFormLoading(false);
        return;
      }

      // Step 2: Send the guide email
      const sendResult = await sendWelcomeGuide(email, name);

      if (sendResult.success) {
        setEmailModalState('success');
        showSuccess('Check your email for the Week 1 Survival Guide!');
      } else {
        // Email captured but send failed - offer retry
        setEmailModalData(prev => ({
          ...prev,
          errorMessage: sendResult.error,
          correlationId: sendResult.correlationId,
        }));
        setEmailModalState('partial_success');
      }
    } catch (err) {
      console.error('Error:', err);
      setEmailModalData(prev => ({
        ...prev,
        errorMessage: 'An unexpected error occurred. Please try again.',
      }));
      setEmailModalState('error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const company = formData.get('company') as string;
    const employees = formData.get('employees') as string;

    try {
      const { error } = await supabase
        .from('email_captures')
        .insert([
          {
            email,
            source: 'welcome_wagon_corporate',
            visitor_type: 'relocating',
            notes: `Company: ${company}${employees ? `, Employees: ${employees}` : ''}`
          }
        ]);

      if (error) {
        console.error('Error saving contact:', error);
        showError('Something went wrong. Please try again.');
        return;
      }

      showSuccess("Thank you! We'll be in touch within 24 hours.");
      setContactModalOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error('Error:', err);
      showError('Something went wrong. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Welcome Wagon checkout
  const handleCheckout = async (productId: string = 'welcome-wagon-90-day') => {
    setCheckoutLoading(true);

    try {
      const attribution = getAttributionForStripe();

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productType: 'welcome-wagon',
          productId: productId,
          attribution: attribution,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      showError(error.message || 'Sorry, there was an error starting checkout. Please try again.');
      setCheckoutLoading(false);
    }
  };

  const handleReservationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;

    try {
      const { error } = await supabase
        .from('email_captures')
        .insert([
          {
            email,
            source: 'reservation_welcome-wagon',
            visitor_type: 'relocating',
            preferences: ['welcome-wagon-90-day'],
            notes: name ? `Name: ${name}, Reservation: 90-Day Welcome Wagon ($49)` : 'Reservation: 90-Day Welcome Wagon ($49)'
          }
        ]);

      if (error) {
        console.error('Error saving reservation:', error);
        showError('Something went wrong. Please try again.');
        return;
      }

      showSuccess(`Success! We'll email you at ${email} when the 90-Day Welcome Wagon is available for purchase.`);
      setReservationModalOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error('Error:', err);
      showError('Something went wrong. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="bg-gray-900 text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-blue-600/20 to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <Image
            src="/images/Favicons-Optimized/png/favicon_2-192x192.png"
            alt="SLCTrips Welcome Wagon badge with orange ring"
            width={192}
            height={192}
            className="w-32 h-32 mx-auto mb-8 animate-bounce-slow"
            priority
          />
          <div className="text-sm font-semibold uppercase tracking-wider text-yellow-400 mb-4">
            Welcome to Utah
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-yellow-400 bg-clip-text text-transparent">
            Your 90-Day Relocation Guide
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            From moving day to feeling like a local - we've got you covered. Meet Dan, your friendly SLCTrips guide, here to help you navigate your new home with confidence.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">Choose Your Adventure</h2>
            <p className="text-gray-400 text-lg">
              Whether you're just arriving or planning ahead, we have the perfect guide for your Utah journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Tier 1: Free Week 1 Guide */}
            <div className="bg-gray-800/60 border-2 border-gray-700 rounded-xl p-8 hover:border-blue-500 hover:-translate-y-2 transition-all duration-300 backdrop-blur-sm hover:shadow-xl animate-slideUp">
              <div className="text-sm font-semibold uppercase tracking-wider text-blue-400 mb-2">
                Starter Guide
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Week 1 Survival Guide</h3>
              <div className="text-4xl font-bold text-green-400 mb-4">FREE</div>
              <p className="text-gray-400 mb-6 min-h-[60px]">
                Essential checklist for your first 7 days in Utah
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  'Moving day checklist',
                  'First 24-hour essentials',
                  'DMV & utilities setup guide',
                  'Grocery, banking & healthcare',
                  'Utah quirks you need to know',
                  'Top 5 must-visit spots'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300 border-b border-gray-700/50 pb-3">
                    <span className="text-green-400 font-bold text-xl flex-shrink-0">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setEmailModalOpen(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:-translate-y-1 hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/50"
              >
                Get Free Guide
              </button>
            </div>

            {/* Tier 2: Complete 90-Day Guide (Featured) */}
            <div className="bg-gray-800/60 border-3 border-yellow-400 rounded-xl p-8 hover:border-yellow-300 hover:-translate-y-2 transition-all duration-300 backdrop-blur-sm relative transform scale-105 hover:shadow-2xl hover:shadow-yellow-400/20 animate-slideUp">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-float">
                Most Popular
              </div>

              <div className="text-sm font-semibold uppercase tracking-wider text-yellow-400 mb-2">
                Complete Package
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">90-Day Welcome Wagon</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-xl text-gray-400">$</span>
                <span className="text-5xl font-bold">49</span>
              </div>
              <p className="text-gray-400 mb-6 min-h-[60px]">
                Your complete roadmap from newcomer to local
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Week 1 Guide',
                  'Full 90-day relocation timeline',
                  'Neighborhood comparison guide',
                  'Essential services directory',
                  'Utah culture & quirks deep dive',
                  'Interactive checklist tracker',
                  '"New in Town" Mt. Olympian quest',
                  'Lifetime updates & support'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300 border-b border-gray-700/50 pb-3">
                    <span className="text-green-400 font-bold text-xl flex-shrink-0">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout('welcome-wagon-90-day')}
                disabled={checkoutLoading}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:from-yellow-300 hover:to-orange-400 transition-all duration-200 hover:-translate-y-1 hover:scale-105 active:scale-95 shadow-lg hover:shadow-yellow-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkoutLoading ? 'Loading...' : 'Buy Now - $49'}
              </button>
            </div>

            {/* Tier 3: Corporate Edition */}
            <div className="bg-gray-800/60 border-2 border-gray-700 rounded-xl p-8 hover:border-blue-500 hover:-translate-y-2 transition-all duration-300 backdrop-blur-sm hover:shadow-xl animate-slideUp">
              <div className="text-sm font-semibold uppercase tracking-wider text-blue-400 mb-2">
                Business Solution
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Corporate/HR Edition</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-xl text-gray-400">$</span>
                <span className="text-5xl font-bold">299</span>
              </div>
              <p className="text-gray-400 mb-6 min-h-[60px]">
                Perfect for companies relocating employees to Utah
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  'Everything in 90-Day Guide',
                  'Bulk access (up to 25 employees)',
                  'Customizable with company branding',
                  'HR dashboard & tracking',
                  'Priority email support',
                  'Onboarding integration toolkit',
                  'Quarterly content updates'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300 border-b border-gray-700/50 pb-3">
                    <span className="text-green-400 font-bold text-xl flex-shrink-0">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setContactModalOpen(true)}
                className="w-full bg-transparent text-blue-400 border-2 border-blue-400 py-3 px-6 rounded-lg font-semibold hover:bg-blue-400/10 hover:border-blue-300 hover:text-blue-300 transition-all duration-200"
              >
                Contact for Corporate Pricing
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">What Makes Welcome Wagon Special?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🏘️',
                title: 'Neighborhood Insights',
                description: 'Explore 10+ Salt Lake area neighborhoods with detailed profiles including housing costs, school ratings, walkability scores, and nearby attractions.'
              },
              {
                icon: '🗺️',
                title: 'Mt. Olympian-Led Exploration',
                description: 'Follow Dan\'s curated "New in Town" quest featuring hidden gems and local favorites you won\'t find in typical relocation guides.'
              },
              {
                icon: '📋',
                title: 'Interactive Checklists',
                description: 'Track your progress through 90 days of relocation tasks with our smart checklist that saves your progress and sends helpful reminders.'
              },
              {
                icon: '🎿',
                title: 'Utah Culture Guide',
                description: 'Navigate liquor laws, altitude adjustment, LDS culture, air quality alerts, and other Utah-specific quirks with confidence and respect.'
              },
              {
                icon: '🏔️',
                title: 'Outdoor Adventure Primer',
                description: 'Access to SLCTrips\' database of 1,634+ destinations organized by drive time - start exploring from day one.'
              },
              {
                icon: '🤝',
                title: 'Local Expert Support',
                description: 'Created by Utah locals who\'ve helped hundreds of families successfully relocate. Real advice from people who\'ve been there.'
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-gray-800/40 border border-gray-700 rounded-lg p-6 hover:border-blue-500 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-blue-400">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-blue-900/5">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Join Happy Utah Newcomers</h2>
          <p className="text-center text-gray-400 mb-12 text-lg">Real stories from people who've made Utah home</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "The Week 1 guide was a lifesaver. I had everything set up - utilities, DMV appointment, groceries - within 3 days. The liquor law explanation alone was worth it!",
                author: "Sarah M., moved from California"
              },
              {
                quote: "As an HR manager relocating 15 employees, the Corporate Edition saved me countless hours. Everyone got the same quality information and we tracked their progress.",
                author: "James T., Tech Company HR"
              },
              {
                quote: "The neighborhood comparison helped us find Sugarhouse - perfect for our family. Walking distance to parks, great schools, and amazing local restaurants.",
                author: "The Martinez Family, moved from Texas"
              }
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-gray-800/60 border border-gray-700 rounded-lg p-6 italic text-gray-300"
              >
                <p className="mb-4">"{testimonial.quote}"</p>
                <div className="text-yellow-400 font-semibold not-italic">
                  — {testimonial.author}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {[
              {
                question: "What's included in the free Week 1 guide?",
                answer: "The Week 1 Survival Guide includes a detailed moving day checklist, first 24-hour essentials (where to eat, sleep, get groceries), utility provider information, DMV appointment scheduling, banking and healthcare setup guides, Utah-specific quirks (liquor laws, altitude tips, air quality), and our top 5 must-visit destinations from the SLCTrips database."
              },
              {
                question: "How is the 90-day guide delivered?",
                answer: "After purchase, you'll receive immediate access to our online portal with downloadable PDFs, interactive checklists, and neighborhood comparison tools. You can access it from any device and track your progress as you complete each milestone."
              },
              {
                question: "Can I upgrade from the free guide to the full 90-day version?",
                answer: "Absolutely! You'll receive an email on Day 7 with a special upgrade offer. Or you can purchase the complete guide anytime from this page."
              },
              {
                question: "What makes this different from free online resources?",
                answer: "While there's plenty of Utah information online, it's scattered across dozens of sites and often outdated. Welcome Wagon consolidates everything into a single, organized timeline with Utah-specific insights you won't find elsewhere - like navigating LDS culture respectfully, understanding air quality alerts, and local insider tips from our Mt. Olympian-led exploration quests."
              },
              {
                question: "Is the Corporate Edition customizable?",
                answer: "Yes! We can add your company branding, integrate your internal resources, and customize the checklist to match your onboarding process. Contact us for a demo and pricing discussion."
              },
              {
                question: "Do you offer refunds?",
                answer: "We offer a 30-day money-back guarantee on the 90-Day Guide. If you're not completely satisfied, just email us for a full refund - no questions asked."
              }
            ].map((faq, i) => (
              <div
                key={i}
                className="bg-gray-800/40 border border-gray-700 rounded-lg p-6"
              >
                <div className="font-semibold text-blue-400 text-lg mb-2">
                  {faq.question}
                </div>
                <div className="text-gray-400 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-900/20 to-yellow-900/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">Ready to Make Utah Home?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Start with our free Week 1 Survival Guide and see why hundreds of newcomers trust Welcome Wagon for their Utah relocation.
          </p>

          <div className="flex flex-wrap gap-4 justify-center items-center">
            <button
              onClick={() => setEmailModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-8 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:-translate-y-1 hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/50 min-w-[250px]"
            >
              Get Free Week 1 Guide
            </button>
            <button
              onClick={() => handleCheckout('welcome-wagon-90-day')}
              disabled={checkoutLoading}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 py-4 px-8 rounded-lg font-semibold hover:from-yellow-300 hover:to-orange-400 transition-all duration-200 hover:-translate-y-1 hover:scale-105 active:scale-95 shadow-lg hover:shadow-yellow-400/50 min-w-[250px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkoutLoading ? 'Loading...' : 'Buy 90-Day Guide - $49'}
            </button>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <ShareButton
                url={typeof window !== 'undefined' ? window.location.href : ''}
                title="Welcome Wagon - Your 90-Day Utah Relocation Guide"
                description="From moving day to feeling like a local - comprehensive relocation guide for new Utah residents"
                variant="icon"
                className="bg-gray-800/60 border border-gray-700 rounded-lg p-3 hover:border-blue-500 hover:bg-gray-800 transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Email Capture Modal - Enhanced with inline states */}
      {emailModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={closeEmailModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="email-modal-title"
        >
          <div
            ref={modalRef}
            className="bg-gray-800 border-2 border-blue-500 rounded-xl p-8 max-w-md w-full relative animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeEmailModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-yellow-400 text-3xl leading-none p-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
              aria-label="Close modal"
            >
              ×
            </button>

            {/* Form State */}
            {emailModalState === 'form' && (
              <>
                <h3 id="email-modal-title" className="text-2xl font-bold text-blue-400 mb-2">
                  Get Your Free Week 1 Survival Guide
                </h3>
                <p className="text-gray-400 mb-6">
                  Enter your email and we'll send you the complete guide instantly. No spam, we promise.
                </p>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block mb-2 text-gray-400 font-medium">
                      Email Address
                    </label>
                    <input
                      ref={emailInputRef}
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="you@email.com"
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="name" className="block mb-2 text-gray-400 font-medium">
                      First Name (optional)
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Your name"
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    Send Me the Free Guide
                  </button>
                </form>
              </>
            )}

            {/* Sending State */}
            {emailModalState === 'sending' && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                <h3 className="text-xl font-bold text-blue-400 mb-2">Sending Your Guide...</h3>
                <p className="text-gray-400">This should only take a moment.</p>
              </div>
            )}

            {/* Success State */}
            {emailModalState === 'success' && (
              <div className="text-center py-4">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-green-400 mb-2">You're All Set!</h3>
                <p className="text-gray-300 mb-6">
                  Check your inbox at <strong className="text-white">{emailModalData.email}</strong> for your Week 1 Survival Guide.
                </p>

                {/* Next steps stepper */}
                <div className="bg-gray-900/50 rounded-lg p-4 text-left mb-6">
                  <h4 className="font-semibold text-blue-400 mb-3">What's Next?</h4>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 font-bold">1.</span>
                      <span className="text-gray-300">Check your email (including spam/promotions folder)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 font-bold">2.</span>
                      <span className="text-gray-300">Download the PDF or save the email</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">3.</span>
                      <span className="text-gray-300">Start checking off your first tasks!</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={closeEmailModal}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200"
                >
                  Got It!
                </button>
              </div>
            )}

            {/* Partial Success State - Captured but email failed */}
            {emailModalState === 'partial_success' && (
              <div className="text-center py-4">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-2">Almost There!</h3>
                <p className="text-gray-300 mb-4">
                  We saved your information, but had trouble sending the email to{' '}
                  <strong className="text-white">{emailModalData.email}</strong>.
                </p>

                {emailModalData.errorMessage && (
                  <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4 text-left">
                    <p className="text-red-300 text-sm">{emailModalData.errorMessage}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={handleRetryEmail}
                    disabled={retryCount >= 3}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {retryCount >= 3 ? 'Max Retries Reached' : `Retry Send (${3 - retryCount} attempts left)`}
                  </button>

                  <button
                    onClick={() => {
                      setEmailModalState('form');
                      setRetryCount(0);
                    }}
                    className="w-full text-blue-400 hover:text-blue-300 py-2 underline"
                  >
                    Try a Different Email
                  </button>

                  <button
                    onClick={closeEmailModal}
                    className="w-full text-gray-400 hover:text-gray-300 py-2"
                  >
                    Continue Anyway - We'll Follow Up
                  </button>
                </div>

                {emailModalData.correlationId && (
                  <p className="text-xs text-gray-500 mt-4">
                    Support ID: {emailModalData.correlationId}
                  </p>
                )}
              </div>
            )}

            {/* Error State - Complete failure */}
            {emailModalState === 'error' && (
              <div className="text-center py-4">
                <div className="text-6xl mb-4">❌</div>
                <h3 className="text-2xl font-bold text-red-400 mb-2">Oops! Something Went Wrong</h3>

                {emailModalData.errorMessage && (
                  <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4">
                    <p className="text-red-300">{emailModalData.errorMessage}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={() => setEmailModalState('form')}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                  >
                    Try Again
                  </button>

                  <button
                    onClick={closeEmailModal}
                    className="w-full text-gray-400 hover:text-gray-300 py-2"
                  >
                    Close
                  </button>
                </div>

                {emailModalData.correlationId && (
                  <p className="text-xs text-gray-500 mt-4">
                    Support ID: {emailModalData.correlationId}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {contactModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setContactModalOpen(false)}
        >
          <div
            className="bg-gray-800 border-2 border-blue-500 rounded-xl p-8 max-w-md w-full relative animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setContactModalOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-yellow-400 text-2xl leading-none min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-700/50 transition-colors"
              aria-label="Close modal"
            >
              ×
            </button>

            <h3 className="text-2xl font-bold text-blue-400 mb-2">
              Corporate Edition Inquiry
            </h3>
            <p className="text-gray-400 mb-6">
              Let us know about your needs and we'll get back to you within 24 hours.
            </p>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label htmlFor="contact-email" className="block mb-2 text-gray-400 font-medium">
                  Work Email
                </label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  required
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="company" className="block mb-2 text-gray-400 font-medium">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  required
                  placeholder="Your company"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="employees" className="block mb-2 text-gray-400 font-medium">
                  Number of Employees
                </label>
                <input
                  type="number"
                  id="employees"
                  name="employees"
                  placeholder="How many employees relocating?"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? 'Sending...' : 'Request Corporate Pricing'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reservation Modal */}
      {reservationModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setReservationModalOpen(false)}
        >
          <div
            className="bg-gray-800 border-2 border-yellow-400 rounded-xl p-8 max-w-md w-full relative animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setReservationModalOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-yellow-400 text-2xl leading-none min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-700/50 transition-colors"
              aria-label="Close modal"
            >
              ×
            </button>

            <h3 className="text-2xl font-bold text-yellow-400 mb-2">
              Reserve: 90-Day Welcome Wagon
            </h3>
            <p className="text-gray-300 mb-6">
              We're putting the finishing touches on the 90-Day Welcome Wagon! Enter your email and we'll notify you the moment it's available for purchase. No payment required now!
            </p>

            <form onSubmit={handleReservationSubmit} className="space-y-4">
              <div>
                <label htmlFor="reserve-email" className="block mb-2 text-gray-300 font-medium">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="reserve-email"
                  name="email"
                  required
                  placeholder="you@email.com"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="reserve-name" className="block mb-2 text-gray-300 font-medium">
                  First Name (optional)
                </label>
                <input
                  type="text"
                  id="reserve-name"
                  name="name"
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:from-yellow-300 hover:to-orange-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? 'Reserving...' : 'Reserve My Spot'}
              </button>

              <p className="text-xs text-gray-400 text-center">
                We'll only email you about the 90-Day Welcome Wagon launch. No spam, promise.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Back to Home Link */}
      <div className="py-8 text-center pb-24 md:pb-8">
        <Link href="/" className="text-blue-400 hover:text-blue-300 hover:underline">
          ← Back to SLCTrips
        </Link>
      </div>
    </main>
    <Footer />

    {/* Mobile Sticky Bottom CTA */}
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 p-4 md:hidden z-40">
      <div className="flex gap-3 max-w-md mx-auto">
        <button
          onClick={() => setEmailModalOpen(true)}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-sm min-h-[44px]"
        >
          Free Guide
        </button>
        <button
          onClick={() => setReservationModalOpen(true)}
          className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 py-3 px-4 rounded-lg font-semibold text-sm min-h-[44px]"
        >
          Reserve $49
        </button>
      </div>
    </div>
    </>
  );
}
