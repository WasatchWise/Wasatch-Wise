'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { captureEmail } from '@/app/actions/email-capture';
import { Users, BookOpen, Shield, Smartphone, GraduationCap } from 'lucide-react';
import { setStoredPersona } from '@/lib/persona';

const STORAGE_KEY = 'abya_welcome_seen';

const PERSONAS = [
  { id: 'parent', label: 'Parent', icon: Users },
  { id: 'educator', label: 'Educator', icon: BookOpen },
  { id: 'administrator', label: 'Administrator', icon: Shield },
  { id: 'student', label: 'Student', icon: GraduationCap },
  { id: 'just_learning', label: 'Just learning', icon: Smartphone },
] as const;

const HELP_OPTIONS = [
  { id: 'apps', label: 'Understand apps & vetting' },
  { id: 'state_laws', label: 'State laws & procedures' },
  { id: 'certification', label: 'Get certified (educators)' },
  { id: 'browsing', label: 'Just browsing' },
] as const;

const PERSONA_HASH: Record<string, string> = {
  parent: '/learn?who=parent#apps',
  educator: '/learn?who=educator#apps',
  administrator: '/learn?who=administrator#state-laws',
  student: '/learn?who=student#apps',
  just_learning: '/learn?who=just_learning#apps',
};

export function WhoAreYouModal() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [persona, setPersona] = useState<string | null>(null);
  const [howHelp, setHowHelp] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [subscribe, setSubscribe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const open = () => setIsOpen(true);
    window.addEventListener('abya-open-who-modal', open);
    return () => window.removeEventListener('abya-open-who-modal', open);
  }, []);

  const handleContinue = async () => {
    localStorage.setItem(STORAGE_KEY, persona || 'skipped');
    if (persona) setStoredPersona(persona);
    const goToHub = () => {
      if (persona && PERSONA_HASH[persona]) router.push(PERSONA_HASH[persona]);
    };

    if (subscribe && email.trim()) {
      setLoading(true);
      setMessage('idle');
      const result = await captureEmail({
        email: email.trim(),
        role: persona || undefined,
        organization: howHelp || undefined,
        source: 'abya_welcome_modal',
      });
      setLoading(false);
      setMessage(result.success ? 'success' : 'error');
      if (result.success) {
        setTimeout(() => {
          setIsOpen(false);
          goToHub();
        }, 1200);
      }
    } else {
      setIsOpen(false);
      goToHub();
    }
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'skipped');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleSkip}
        aria-hidden
      />
      <div
        role="dialog"
        aria-labelledby="who-are-you-title"
        aria-describedby="who-are-you-desc"
        className="relative bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-gray-200"
      >
        <div className="p-6">
          <h2 id="who-are-you-title" className="text-xl font-bold text-gray-900 mb-1">
            Who are you?
          </h2>
          <p id="who-are-you-desc" className="text-sm text-gray-600 mb-4">
            We’ll point you to the right stuff. Optional: tell us how we can help and stay in the loop.
          </p>

          {/* Persona */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">I’m a…</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PERSONAS.map((p) => {
                const Icon = p.icon;
                const selected = persona === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPersona(p.id)}
                    className={`
                      flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left text-sm font-medium transition-colors
                      ${selected
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'}
                    `}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* How can we help */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">How can we help? (optional)</p>
            <select
              value={howHelp || ''}
              onChange={(e) => setHowHelp(e.target.value || null)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Choose one…</option>
              {HELP_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Newsletter */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={subscribe}
                onChange={(e) => setSubscribe(e.target.checked)}
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              Get updates (optional)
            </label>
            {subscribe && (
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            )}
          </div>

          {message === 'success' && (
            <p className="text-sm text-green-600 mb-4">You’re on the list. We’ll be in touch.</p>
          )}
          {message === 'error' && (
            <p className="text-sm text-red-600 mb-4">Something went wrong. You can try again later.</p>
          )}

          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
