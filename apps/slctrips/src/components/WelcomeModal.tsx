'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { validateEmail } from '@/lib/validations';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { logger } from '@/lib/logger';
import './WelcomeModal.css';

// Response messages for each visitor type
const RESPONSES = {
  visitor: {
    title: "Perfect for explorers!",
    message: "SLCTrips helps you discover <strong>1000+ destinations</strong> within 12 hours of Salt Lake City. From 30-minute quick trips to full weekend adventures.",
    suggestions: "Start with our curated destinations, check out TripKits, or browse by drive time.",
    cta: "Start exploring now"
  },
  local: {
    title: "A local! Welcome home.",
    message: "Then you know the obvious spots. We specialize in the <strong>hidden mysteries</strong> and locations only 1% of Utahns know about.",
    suggestions: "Try our Hidden Mysteries collection, explore destinations 6-12hr away, or discover local secrets.",
    cta: "Show me the secrets"
  },
  relocating: {
    title: "Welcome to the neighborhood!",
    message: "Dan the Sasquatch has a <strong>90-day onboarding guide</strong> to help you survive (and thrive) in your first three months in Salt Lake City.",
    suggestions: "Check out The Welcome Wagon, grab the free Week 1 survival checklist.",
    cta: "Tell me more"
  }
};

export default function WelcomeModal() {
  const [isActive, setIsActive] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResponse, setShowResponse] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState({
    tripkits: true,
    staykit: false,
    secrets: false,
    offers: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Check if user has already seen the modal
    const hasSeenModal = localStorage.getItem('slctrips_welcomed') === 'true';

    if (!hasSeenModal) {
      // Show modal after 1 second delay
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsActive(false);
    localStorage.setItem('slctrips_welcomed', 'true');
    localStorage.setItem('slctrips_welcome_date', new Date().toISOString());
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setShowResponse(true);
    setShowEmailCapture(true);

    // Pre-check relevant checkbox based on selection
    if (option === 'relocating') {
      setPreferences(prev => ({ ...prev, staykit: true }));
    } else if (option === 'local') {
      setPreferences(prev => ({ ...prev, secrets: true }));
    }

    // Track analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'modal_option_selected', { option });
    }
  };

  const handleSubmit = async () => {
    if (!selectedOption) return;

    // Clear previous messages
    setErrorMessage(null);
    setSuccessMessage(null);

    // If no email provided, just close
    if (!email.trim()) {
      handleClose();
      return;
    }

    // Validate email with Zod
    const emailValidation = validateEmail(email.trim());
    if (!emailValidation.valid) {
      setErrorMessage(emailValidation.error || 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get selected preferences as array
      const selectedPrefs = Object.entries(preferences)
        .filter(([_, checked]) => checked)
        .map(([key, _]) => key);

      // Save to Supabase
      const { error } = await supabase
        .from('email_captures')
        .insert({
          email: email.trim(),
          source: 'welcome-modal',
          visitor_type: selectedOption,
          preferences: selectedPrefs,
          created_at: new Date().toISOString()
        });

      if (error) {
        logger.error('Error saving email', { error: error.message });
        setErrorMessage('Unable to save your email. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Track analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'modal_email_submitted', {
          option: selectedOption,
          preferences: selectedPrefs.join(',')
        });
      }

      // Show success message
      setSuccessMessage('Thanks! We\'ll be in touch.');

      // Success - close modal
      setTimeout(() => {
        handleClose();
      }, 1200);

    } catch (err) {
      logger.error('Error submitting email', { error: err });
      setErrorMessage('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Focus trap for accessibility
  const focusTrapRef = useFocusTrap(isActive);

  // Listen for escape key from focus trap
  useEffect(() => {
    const handleEscape = () => handleClose();
    const container = focusTrapRef.current;
    if (container) {
      container.addEventListener('focustrap:escape', handleEscape);
      return () => container.removeEventListener('focustrap:escape', handleEscape);
    }
  }, [isActive]);

  if (!isActive) return null;

  const response = selectedOption ? RESPONSES[selectedOption as keyof typeof RESPONSES] : null;

  return (
    <div
      className="slc-modal-overlay active"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-labelledby="modalTitle"
      aria-modal="true"
    >
      <div className="slc-modal-card" ref={focusTrapRef}>
        {/* Header */}
        <div className="slc-modal-header">
          <button
            className="slc-modal-close"
            onClick={handleClose}
            aria-label="Close modal"
            type="button"
          >
            ×
          </button>
          <h2 id="modalTitle">Welcome to SLC! Quick question...</h2>
          <p>Help us show you the most relevant content</p>
        </div>

        {/* Body */}
        <div className="slc-modal-body">
          <p className="slc-modal-question">What brings you here?</p>

          {/* Options */}
          <div className="slc-modal-options">
            <button
              className={`slc-option-btn ${selectedOption === 'visitor' ? 'selected' : ''}`}
              onClick={() => handleOptionSelect('visitor')}
              type="button"
            >
              <span className="slc-option-icon">🗺️</span>
              <div className="slc-option-text">
                <h3>I'm visiting/exploring</h3>
                <p>Planning trips and adventures from SLC</p>
              </div>
            </button>

            <button
              className={`slc-option-btn ${selectedOption === 'local' ? 'selected' : ''}`}
              onClick={() => handleOptionSelect('local')}
              type="button"
            >
              <span className="slc-option-icon">🏔️</span>
              <div className="slc-option-text">
                <h3>I'm a local</h3>
                <p>Looking for hidden gems and secret spots</p>
              </div>
            </button>

            <button
              className={`slc-option-btn ${selectedOption === 'relocating' ? 'selected' : ''}`}
              onClick={() => handleOptionSelect('relocating')}
              type="button"
            >
              <span className="slc-option-icon">📦</span>
              <div className="slc-option-text">
                <h3>I'm moving here</h3>
                <p>Need help settling into Salt Lake City</p>
              </div>
            </button>
          </div>

          {/* Response Message */}
          {showResponse && response && (
            <div className="slc-modal-response active">
              <p><strong>{response.title}</strong></p>
              <p>
                {response.message.split(/(<strong>.*?<\/strong>)/g).map((part, index) => {
                  if (part.startsWith('<strong>') && part.endsWith('</strong>')) {
                    const text = part.replace(/<\/?strong>/g, '');
                    return <strong key={index}>{text}</strong>;
                  }
                  return part;
                })}
              </p>
              <p>{response.suggestions}</p>
            </div>
          )}

          {/* Email Capture */}
          {showEmailCapture && (
            <div className="slc-email-capture active">
              <h4>Want to stay updated? (Optional)</h4>
              <input
                type="email"
                className="slc-email-input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
              />

              <div className="slc-checkbox-group">
                <label className="slc-checkbox-label">
                  <input
                    type="checkbox"
                    checked={preferences.tripkits}
                    onChange={(e) => setPreferences(prev => ({ ...prev, tripkits: e.target.checked }))}
                  />
                  <span>Day trips & weekend adventures (TripKits)</span>
                </label>
                <label className="slc-checkbox-label">
                  <input
                    type="checkbox"
                    checked={preferences.staykit}
                    onChange={(e) => setPreferences(prev => ({ ...prev, staykit: e.target.checked }))}
                  />
                  <span>Relocating/new to the area (StayKit)</span>
                </label>
                <label className="slc-checkbox-label">
                  <input
                    type="checkbox"
                    checked={preferences.secrets}
                    onChange={(e) => setPreferences(prev => ({ ...prev, secrets: e.target.checked }))}
                  />
                  <span>Hidden local secrets & mysteries</span>
                </label>
                <label className="slc-checkbox-label">
                  <input
                    type="checkbox"
                    checked={preferences.offers}
                    onChange={(e) => setPreferences(prev => ({ ...prev, offers: e.target.checked }))}
                  />
                  <span>Special offers & new products</span>
                </label>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {errorMessage && (
            <div className="slc-status-message slc-status-error" role="alert">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="slc-status-message slc-status-success" role="status">
              {successMessage}
            </div>
          )}

          {/* Action Buttons */}
          {selectedOption && (
            <div className="slc-modal-actions">
              <button
                className="slc-btn slc-btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
                type="button"
              >
                {isSubmitting ? 'Saving...' : (email ? response?.cta : 'Get started')}
              </button>
              <button
                className="slc-btn slc-btn-secondary"
                onClick={handleClose}
                type="button"
              >
                Just browsing
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="slc-modal-footer">
            <p>No spam. One email when we have something worth sharing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
