import React from 'react';

export const FutureVision: React.FC = () => {
  return (
    <section className="mt-12 rounded-2xl bg-gradient-to-br from-dignity-purple/5 to-trust-teal/5 p-8 border border-dignity-purple/20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1 bg-dignity-purple/10 text-dignity-purple rounded-full text-sm font-semibold mb-3">
            Future Vision
          </span>
          <h2 className="text-3xl font-bold text-secure-slate font-display mb-3">
            Where We're Heading
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The Help List started with one simple delivery in Longmont. Here's what we're building toward.
          </p>
        </div>

        {/* Core Features We're Building */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-secure-slate mb-3 flex items-center gap-2">
              <span>🛒</span>
              <span>Smarter Fulfillment</span>
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              We're working on integrating with grocery delivery services like Instacart,
              so if no neighbor can help in time, the request still gets fulfilled.
            </p>
            <p className="text-xs text-gray-500">
              Goal: Zero unfulfilled requests
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-secure-slate mb-3 flex items-center gap-2">
              <span>🤖</span>
              <span>Better Matching</span>
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              AI that predicts what people might need before they ask, and matches
              helpers with requests they're perfect for.
            </p>
            <p className="text-xs text-gray-500">
              Goal: 95% match satisfaction
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-secure-slate mb-3 flex items-center gap-2">
              <span>💚</span>
              <span>Community Sponsorship</span>
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              Local businesses and organizations can sponsor requests, ensuring everyone
              gets help regardless of ability to pay.
            </p>
            <p className="text-xs text-gray-500">
              Goal: Fully funded community care
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-secure-slate mb-3 flex items-center gap-2">
              <span>🌍</span>
              <span>Expand to More Cities</span>
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              Once we prove the model works in Longmont, we'll bring The Help List to
              communities across Colorado and beyond.
            </p>
            <p className="text-xs text-gray-500">
              Goal: Nationwide coverage
            </p>
          </div>
        </div>

        {/* The Big Picture */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-dignity-purple">
          <h3 className="text-xl font-semibold text-secure-slate mb-3">The Big Picture</h3>
          <p className="text-gray-700 mb-4">
            We believe neighbors helping neighbors is how communities thrive. The Help List
            is just technology that makes it easier, safer, and more private.
          </p>
          <p className="text-gray-700 mb-4">
            Our north star: <span className="font-semibold text-dignity-purple">Make asking for help
            as normal as ordering pizza.</span>
          </p>
          <p className="text-sm text-gray-600 italic">
            No shame. No explanation needed. Just good people helping each other.
          </p>
        </div>

        {/* Get Involved */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-secure-slate mb-3">Want to Help Build This?</h3>
          <p className="text-gray-600 mb-4">
            We're looking for partners, sponsors, and collaborators who believe in this vision.
          </p>
          <a
            href="mailto:wasatch@thehelplist.org"
            className="inline-block px-6 py-3 bg-dignity-purple text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  );
};
