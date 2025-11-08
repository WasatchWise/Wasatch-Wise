import React from 'react';

interface WelcomeModalProps {
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-dignity-purple text-white p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold font-display flex items-center gap-2">
            <span>🤝</span>
            <span>Welcome to The Help List</span>
          </h2>
          <p className="text-purple-100 mt-2">
            Privacy-first platform connecting neighbors who need help with those ready to help.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Two Paths */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Need Help */}
            <div className="border-2 border-kindness-coral rounded-xl p-4 bg-orange-50">
              <h3 className="text-lg font-bold text-secure-slate mb-3 flex items-center gap-2">
                <span>🙏</span>
                <span>Need Help?</span>
              </h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="font-semibold text-kindness-coral">1.</span>
                  <span>Click "I Need Help" and fill out the request form</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-kindness-coral">2.</span>
                  <span>Choose your privacy level (we protect your info)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-kindness-coral">3.</span>
                  <span>Wait for a helper to claim your request</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-kindness-coral">4.</span>
                  <span>They'll contact you to arrange delivery</span>
                </li>
              </ol>
            </div>

            {/* Want to Help */}
            <div className="border-2 border-trust-teal rounded-xl p-4 bg-teal-50">
              <h3 className="text-lg font-bold text-secure-slate mb-3 flex items-center gap-2">
                <span>💚</span>
                <span>Want to Help?</span>
              </h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="font-semibold text-trust-teal">1.</span>
                  <span>Browse requests below - see what neighbors need</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-trust-teal">2.</span>
                  <span>Click "Claim Request" on one you can fulfill</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-trust-teal">3.</span>
                  <span>You'll see their contact info to arrange details</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-trust-teal">4.</span>
                  <span>Shop, deliver, and mark as complete. That's it!</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Privacy Promise */}
          <div className="bg-dignity-purple/5 rounded-xl p-4 border border-dignity-purple/20">
            <h3 className="text-base font-bold text-secure-slate mb-2 flex items-center gap-2">
              <span>🛡️</span>
              <span>Your Privacy is Protected</span>
            </h3>
            <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-sanctuary-green">✓</span>
                <span>No real names required</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-sanctuary-green">✓</span>
                <span>Contact info only shared when claimed</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-sanctuary-green">✓</span>
                <span>Data auto-deletes after 30 days</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-sanctuary-green">✓</span>
                <span>You control your location privacy</span>
              </li>
            </ul>
          </div>

          {/* Current Status */}
          <div className="text-center text-sm text-gray-600">
            <p>
              Currently serving <span className="font-semibold text-dignity-purple">Longmont, Colorado</span>
              {' '}• Beta Release
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-surface-secondary rounded-b-2xl flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-dignity-purple text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md"
          >
            Got it! Let's Go
          </button>
        </div>
      </div>
    </div>
  );
};
