import React from 'react';
import { FutureVision } from './FutureVision';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-secure-slate font-display mb-4">
            About The Help List
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're building the world's first privacy-first platform for neighbors helping neighbors.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-secure-slate font-display mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-4">
            The Help List makes it simple for neighbors to help neighbors with groceries and essentials,
            while preserving dignity through anonymity and privacy-first design.
          </p>
          <p className="text-gray-700">
            We believe that asking for help shouldn't require explaining your entire life story.
            Sometimes people just need groceries, and their neighbors are ready to help.
          </p>
        </div>

        {/* How We're Different */}
        <div className="bg-gradient-to-br from-dignity-purple/5 to-trust-teal/5 rounded-2xl shadow-lg p-8 mb-8 max-w-4xl mx-auto border border-dignity-purple/20">
          <h2 className="text-2xl font-bold text-secure-slate font-display mb-4">How We're Different</h2>
          <p className="text-gray-700 mb-6">
            You might wonder: "Isn't this just GoFundMe for groceries?" Not quite. Here's the difference:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-400 text-sm mb-3">Crowdfunding Platforms</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>Money changes hands (fundraising)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>Campaigns take weeks or months</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>Requires vulnerability & storytelling</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>Public appeals to strangers nationwide</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>Success = enough money raised</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border-2 border-sanctuary-green">
              <h3 className="font-bold text-sanctuary-green text-sm mb-3">The Help List</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-sanctuary-green mt-0.5">✓</span>
                  <span>Direct action (someone physically helps)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sanctuary-green mt-0.5">✓</span>
                  <span>Happens TODAY or tomorrow</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sanctuary-green mt-0.5">✓</span>
                  <span>No explanations needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sanctuary-green mt-0.5">✓</span>
                  <span>Private, hyperlocal neighbors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sanctuary-green mt-0.5">✓</span>
                  <span>Success = groceries in your hands</span>
                </li>
              </ul>
            </div>
          </div>

          <p className="mt-6 text-center text-sm font-semibold text-dignity-purple">
            When you need groceries today, not money next week.
          </p>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-secure-slate font-display mb-6">How It Works</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-l-4 border-kindness-coral pl-4">
              <h3 className="text-lg font-semibold text-secure-slate mb-2">Need Help?</h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li>1. List what you need</li>
                <li>2. Set your privacy level</li>
                <li>3. Wait for a helper to claim it</li>
                <li>4. Receive your groceries</li>
              </ol>
            </div>

            <div className="border-l-4 border-trust-teal pl-4">
              <h3 className="text-lg font-semibold text-secure-slate mb-2">Want to Help?</h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li>1. Browse nearby requests</li>
                <li>2. Claim one you can fulfill</li>
                <li>3. Shop and deliver</li>
                <li>4. Make someone's day better</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Privacy Commitment */}
        <div className="bg-dignity-purple/5 rounded-2xl shadow-lg p-8 mb-8 max-w-4xl mx-auto border border-dignity-purple/20">
          <h2 className="text-2xl font-bold text-secure-slate font-display mb-4 flex items-center gap-2">
            <span>🛡️</span>
            <span>Privacy Commitment</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-sanctuary-green mt-1">✓</span>
              <span>No real names required - use any username you like</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sanctuary-green mt-1">✓</span>
              <span>Your exact address is only shared when you're ready</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sanctuary-green mt-1">✓</span>
              <span>All data automatically deletes after 30 days</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sanctuary-green mt-1">✓</span>
              <span>No one needs to explain why they need help</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sanctuary-green mt-1">✓</span>
              <span>Contact info stays encrypted and private</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sanctuary-green mt-1">✓</span>
              <span>You control what helpers see about you</span>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-secure-slate font-display mb-4">Current Status</h2>
          <p className="text-gray-700 mb-4">
            We're currently in <span className="font-semibold text-dignity-purple">beta</span> and
            serving the <span className="font-semibold">Longmont, Colorado</span> community.
          </p>
          <p className="text-gray-700">
            Interested in bringing The Help List to your community?
            Email us at <a href="mailto:wasatch@thehelplist.org" className="text-dignity-purple hover:underline">wasatch@thehelplist.org</a>
          </p>
        </div>

        {/* The Vision - Full Blueprint */}
        <FutureVision />
      </div>
    </div>
  );
};
