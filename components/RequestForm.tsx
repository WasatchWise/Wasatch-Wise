import React, { useState } from 'react';
import { UserIcon, ShoppingBagIcon, MapPinIcon, AtSymbolIcon, PhoneIcon, ShieldIcon } from './icons';

interface RequestFormProps {
  addRequest: (request: { displayName: string, need: string, city: string, contactMethod: 'text' | 'email', contactInfo: string }) => Promise<void>;
}

const COMMON_NEEDS = [
  "Groceries for family",
  "Baby essentials (diapers, formula)",
  "Medicine/pharmacy pickup",
  "Pet food",
  "Household basics (toilet paper, soap, etc.)"
];

export const RequestForm: React.FC<RequestFormProps> = ({ addRequest }) => {
  const [displayName, setDisplayName] = useState('');
  const [need, setNeed] = useState('');
  const [selectedCommonNeeds, setSelectedCommonNeeds] = useState<string[]>([]);
  const [customNeed, setCustomNeed] = useState('');
  const [city, setCity] = useState('');
  const [contactMethod, setContactMethod] = useState<'text' | 'email'>('text');
  const [contactInfo, setContactInfo] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCommonNeed = (needText: string) => {
    setSelectedCommonNeeds(prev =>
      prev.includes(needText)
        ? prev.filter(n => n !== needText)
        : [...prev, needText]
    );
  };

  const combinedNeed = () => {
    const parts = [];
    if (selectedCommonNeeds.length > 0) {
      parts.push(selectedCommonNeeds.join(', '));
    }
    if (customNeed.trim()) {
      parts.push(customNeed.trim());
    }
    return parts.join('. Also: ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalNeed = combinedNeed();

    if (!displayName || !finalNeed || !city || !contactInfo) {
      alert('Please fill out all fields and select or describe what you need.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addRequest({ displayName, need: finalNeed, city, contactMethod, contactInfo });
      setDisplayName('');
      setNeed('');
      setSelectedCommonNeeds([]);
      setCustomNeed('');
      setCity('');
      setContactInfo('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
        // Error is already alerted in App.tsx
    } finally {
        setIsSubmitting(false);
    }
  };

  const InputField = ({ id, label, value, onChange, placeholder, icon, type = 'text', helperText }: { id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string, icon: React.ReactNode, type?: string, helperText?: string }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-secure-slate">{label}</label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          type={type}
          name={id}
          id={id}
          className="focus:ring-dignity-purple focus:border-dignity-purple block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
        />
      </div>
       {helperText && <p className="mt-2 text-xs text-gray-500">{helperText}</p>}
    </div>
  );

  if (submitted) {
    return (
      <div className="text-center p-8 bg-surface-primary rounded-xl shadow-xl border border-surface-tertiary">
        <h2 className="text-3xl font-bold font-display text-sanctuary-green">Thank you!</h2>
        <p className="mt-2 text-gray-600">Your request has been submitted. A volunteer will contact you soon.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-primary p-8 rounded-xl shadow-xl border border-surface-tertiary">
      <h2 className="text-3xl font-bold font-display text-secure-slate mb-6">Request Assistance</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-start p-4 bg-shield-blue/10 rounded-lg text-shield-blue">
            <ShieldIcon className="w-8 h-8 mr-3 flex-shrink-0" />
            <p className="text-sm">
                <strong>Your Privacy Promise:</strong> Your contact info is never shared publicly. It is only visible to a confirmed volunteer after they claim your request.
            </p>
        </div>

        <InputField id="displayName" label="Username or First Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g., SunflowerMom" icon={<UserIcon className="w-5 h-5 text-gray-400" />} />

        {/* What do you need - checkboxes + custom field */}
        <div>
          <label className="block text-sm font-medium text-secure-slate mb-3">What do you need?</label>
          <div className="space-y-2 mb-3">
            {COMMON_NEEDS.map((commonNeed) => (
              <label key={commonNeed} className="flex items-start cursor-pointer hover:bg-surface-secondary p-2 rounded-md transition-colors">
                <input
                  type="checkbox"
                  checked={selectedCommonNeeds.includes(commonNeed)}
                  onChange={() => toggleCommonNeed(commonNeed)}
                  className="mt-0.5 h-4 w-4 text-dignity-purple focus:ring-dignity-purple border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">{commonNeed}</span>
              </label>
            ))}
          </div>

          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-start pt-3 pointer-events-none">
              <ShoppingBagIcon className="w-5 h-5 text-gray-400" />
            </div>
            <textarea
              id="customNeed"
              rows={2}
              className="focus:ring-dignity-purple focus:border-dignity-purple block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
              placeholder="Or describe something else you need..."
              value={customNeed}
              onChange={(e) => setCustomNeed(e.target.value)}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Check common items above or describe your specific need. We're here for immediate, practical help.
          </p>
        </div>

        <InputField id="city" label="What city do you live in?" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Longmont, CO" icon={<MapPinIcon className="w-5 h-5 text-gray-400" />} helperText="Just the city is enough to find helpers nearby."/>

        <div>
          <label className="block text-sm font-medium text-secure-slate">Preferred Contact Method</label>
          <fieldset className="mt-2">
            <div className="flex items-center space-x-4">
              {['text', 'email'].map((method) => (
                <div key={method} className="flex items-center">
                  <input
                    id={method}
                    name="contact-method"
                    type="radio"
                    checked={contactMethod === method}
                    onChange={() => setContactMethod(method as 'text' | 'email')}
                    className="focus:ring-dignity-purple h-4 w-4 text-dignity-purple border-gray-300"
                  />
                  <label htmlFor={method} className="ml-2 block text-sm text-gray-900 capitalize">{method}</label>
                </div>
              ))}
            </div>
          </fieldset>
        </div>

        <InputField
          id="contactInfo"
          label={contactMethod === 'text' ? 'Phone Number' : 'Email Address'}
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          placeholder={contactMethod === 'text' ? '(555) 123-4567' : 'jane.doe@example.com'}
          icon={contactMethod === 'text' ? <PhoneIcon className="w-5 h-5 text-gray-400" /> : <AtSymbolIcon className="w-5 h-5 text-gray-400" />}
          type={contactMethod === 'text' ? 'tel' : 'email'}
          helperText="This will only be shared with the volunteer who claims your request."
        />

        <button 
            type="submit" 
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sanctuary-green hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dignity-purple transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Securely'}
        </button>
      </form>
    </div>
  );
};
