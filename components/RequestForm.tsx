import React, { useState } from 'react';
import { UserIcon, ShoppingBagIcon, MapPinIcon, AtSymbolIcon, PhoneIcon, ShieldIcon } from './icons';

interface RequestFormProps {
  addRequest: (request: { displayName: string, need: string, city: string, contactMethod: 'text' | 'email', contactInfo: string }) => Promise<void>;
}

export const RequestForm: React.FC<RequestFormProps> = ({ addRequest }) => {
  const [displayName, setDisplayName] = useState('');
  const [need, setNeed] = useState('');
  const [city, setCity] = useState('');
  const [contactMethod, setContactMethod] = useState<'text' | 'email'>('text');
  const [contactInfo, setContactInfo] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !need || !city || !contactInfo) {
      alert('Please fill out all fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addRequest({ displayName, need, city, contactMethod, contactInfo });
      setDisplayName('');
      setNeed('');
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
        <InputField id="need" label="What do you need?" value={need} onChange={(e) => setNeed(e.target.value)} placeholder="Groceries for a family of 4" icon={<ShoppingBagIcon className="w-5 h-5 text-gray-400" />} />
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
