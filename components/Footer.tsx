import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-primary border-t border-surface-tertiary mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-secure-slate mb-3">About The Help List</h3>
            <p className="text-sm text-gray-600">
              Privacy-first platform connecting neighbors who need help with those ready to help.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-secure-slate mb-3">Privacy First</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-sanctuary-green">🛡️</span>
                <span>Anonymous by default</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-sanctuary-green">🔒</span>
                <span>Data auto-deletes after 30 days</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-sanctuary-green">📍</span>
                <span>Graduated location disclosure</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-secure-slate mb-3">Get in Touch</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a
                  href="mailto:wasatch@thehelplist.org"
                  className="hover:text-dignity-purple transition-colors"
                >
                  wasatch@thehelplist.org
                </a>
              </li>
              <li className="text-xs text-gray-500 mt-4">
                Longmont, Colorado
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-surface-tertiary text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} The Help List. Built with privacy, dignity, and kindness.</p>
        </div>
      </div>
    </footer>
  );
};
