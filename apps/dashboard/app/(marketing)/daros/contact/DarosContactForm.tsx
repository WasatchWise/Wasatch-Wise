'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function DarosContactForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = {
      name: formData.get('name'),
      email: formData.get('email'),
      districtName: formData.get('districtName'),
      role: formData.get('role'),
    };

    try {
      const res = await fetch('/api/daros/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      router.push('/daros/thank-you');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
        />
      </div>
      <div>
        <label htmlFor="districtName" className="block text-sm font-medium text-gray-700 mb-1">
          District Name
        </label>
        <input
          id="districtName"
          name="districtName"
          type="text"
          required
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
        />
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <input
          id="role"
          name="role"
          type="text"
          placeholder="e.g. Superintendent, Director of Technology"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600"
      >
        {loading ? 'Submitting...' : 'Get the Proposal'}
      </Button>
    </form>
  );
}
