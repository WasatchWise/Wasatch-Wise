import React from 'react';

export const CommunityGuidelines: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-surface-primary rounded-xl shadow-lg p-8 mb-6">
        <h2 className="text-3xl font-bold font-display text-secure-slate mb-6">Community Guidelines & Safety</h2>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 mb-6">
            The Help List works because neighbors trust neighbors. These guidelines help everyone stay safe and make the most of our community.
          </p>

          {/* For Helpers */}
          <div className="bg-sanctuary-green/10 rounded-lg p-6 mb-6 border-l-4 border-sanctuary-green">
            <h3 className="text-xl font-bold text-sanctuary-green mb-4 flex items-center gap-2">
              🤝 Guidelines for Helpers
            </h3>

            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-bold text-secure-slate mb-2">✓ DO:</h4>
                <ul className="space-y-2 ml-5 list-disc">
                  <li>Communicate clearly about timing and availability</li>
                  <li>Keep receipts and discuss payment method upfront</li>
                  <li>Respect privacy - don't share requester info with others</li>
                  <li>Follow through on commitments or give advance notice if you can't</li>
                  <li>Meet in well-lit public areas when coordinating pickup/delivery</li>
                  <li>Trust your instincts - if something feels off, it's okay to decline</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-secure-slate mb-2">✗ DON'T:</h4>
                <ul className="space-y-2 ml-5 list-disc">
                  <li>Enter someone's home if you feel uncomfortable</li>
                  <li>Share personal banking info - use Venmo, Zelle, or cash</li>
                  <li>Take on more requests than you can handle</li>
                  <li>Make assumptions about what "similar items" are okay</li>
                </ul>
              </div>
            </div>
          </div>

          {/* For Requesters */}
          <div className="bg-trust-teal/10 rounded-lg p-6 mb-6 border-l-4 border-trust-teal">
            <h3 className="text-xl font-bold text-trust-teal mb-4 flex items-center gap-2">
              🏠 Guidelines for Requesters
            </h3>

            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-bold text-secure-slate mb-2">✓ DO:</h4>
                <ul className="space-y-2 ml-5 list-disc">
                  <li>Be specific about what you need (brands, sizes, quantities)</li>
                  <li>Respond quickly when a helper reaches out</li>
                  <li>Have payment ready (Venmo, Zelle, cash, etc.)</li>
                  <li>Be flexible if exact items aren't available</li>
                  <li>Thank your helper - a little gratitude goes a long way</li>
                  <li>Consider contactless delivery if you're immunocompromised</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-secure-slate mb-2">✗ DON'T:</h4>
                <ul className="space-y-2 ml-5 list-disc">
                  <li>Post requests for non-essentials or commercial purposes</li>
                  <li>Share your request with identifying details beyond what's needed</li>
                  <li>Expect helpers to cover costs without clear reimbursement plans</li>
                  <li>Ghost your helper after they've claimed your request</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Safety Best Practices */}
          <div className="bg-shield-blue/10 rounded-lg p-6 mb-6 border-l-4 border-shield-blue">
            <h3 className="text-xl font-bold text-shield-blue mb-4 flex items-center gap-2">
              🛡️ Safety Best Practices
            </h3>

            <div className="space-y-3 text-gray-700">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <h4 className="font-bold text-secure-slate">Communicate Through the Platform First</h4>
                  <p className="text-sm">Exchange a few messages before sharing phone numbers. Get a sense of who you're working with.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <h4 className="font-bold text-secure-slate">Choose Safe Meeting Spots</h4>
                  <p className="text-sm">Public parking lots, apartment lobbies, or doorstep delivery are great options. Avoid isolated areas.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <h4 className="font-bold text-secure-slate">Use Secure Payment Methods</h4>
                  <p className="text-sm">Venmo, Zelle, Cash App, or cash work well. Never share bank account or credit card details directly.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">👂</span>
                <div>
                  <h4 className="font-bold text-secure-slate">Trust Your Gut</h4>
                  <p className="text-sm">If something feels wrong, it's okay to cancel or ask someone to go with you. Your safety comes first.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <h4 className="font-bold text-secure-slate">Tell Someone Where You're Going</h4>
                  <p className="text-sm">Let a friend or family member know when you're making a delivery or expecting one.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Commitment */}
          <div className="bg-dignity-purple/10 rounded-lg p-6 mb-6 border-l-4 border-dignity-purple">
            <h3 className="text-xl font-bold text-dignity-purple mb-4 flex items-center gap-2">
              🔒 Our Privacy Commitment
            </h3>

            <div className="space-y-3 text-gray-700 text-sm">
              <p>
                <strong>We don't sell your data.</strong> Ever. Your contact information is only shared with helpers who claim your request.
              </p>
              <p>
                <strong>Auto-deletion:</strong> Completed requests and contact info are automatically deleted after 30 days.
              </p>
              <p>
                <strong>Anonymous mode available:</strong> You can use display names instead of real names if you prefer.
              </p>
              <p>
                <strong>No tracking:</strong> We don't use invasive analytics or third-party tracking cookies.
              </p>
            </div>
          </div>

          {/* Red Flags */}
          <div className="bg-red-50 rounded-lg p-6 mb-6 border-l-4 border-red-500">
            <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
              🚨 Red Flags - When to Report
            </h3>

            <div className="space-y-2 text-gray-700">
              <p className="font-bold text-red-700 mb-3">Contact us immediately if:</p>
              <ul className="space-y-2 ml-5 list-disc">
                <li>Someone asks for your bank account or credit card details</li>
                <li>A helper or requester becomes aggressive or threatening</li>
                <li>Someone tries to scam you or misrepresent what they need</li>
                <li>You feel unsafe during a delivery or pickup</li>
                <li>Someone is using the platform for commercial/business purposes</li>
                <li>You notice fake requests or suspicious patterns</li>
              </ul>

              <div className="mt-4 p-4 bg-white rounded border border-red-200">
                <p className="font-bold text-secure-slate mb-2">How to Report:</p>
                <p className="text-sm mb-2">Email us at: <a href="mailto:help@thehelplist.co" className="text-trust-teal font-mono underline">help@thehelplist.co</a></p>
                <p className="text-sm text-gray-600">Include the requester/helper name, date, and what happened. We take all reports seriously.</p>
              </div>
            </div>
          </div>

          {/* Community Standards */}
          <div className="bg-caution-amber/10 rounded-lg p-6 border-l-4 border-caution-amber">
            <h3 className="text-xl font-bold text-caution-amber mb-4 flex items-center gap-2">
              ⭐ Our Community Standards
            </h3>

            <div className="space-y-3 text-gray-700">
              <p>
                The Help List works best when everyone treats each other with dignity and respect. We're building a community where:
              </p>
              <ul className="space-y-2 ml-5 list-disc">
                <li><strong>No judgment.</strong> Life happens to everyone. You shouldn't have to prove you "deserve" help.</li>
                <li><strong>No discrimination.</strong> Everyone is welcome regardless of background, identity, or circumstances.</li>
                <li><strong>No exploitation.</strong> This is neighbor-to-neighbor help, not a business opportunity.</li>
                <li><strong>Communication matters.</strong> Be honest, be kind, follow through.</li>
                <li><strong>Privacy is sacred.</strong> What you learn about someone's situation stays private.</li>
              </ul>

              <p className="mt-4 text-sm italic text-gray-600">
                Violations of these standards may result in removal from the platform. Let's keep this space safe and supportive for everyone.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
