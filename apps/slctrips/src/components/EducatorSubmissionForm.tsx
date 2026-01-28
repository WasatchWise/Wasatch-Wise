'use client';

import { useState } from 'react';

export default function EducatorSubmissionForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    description: '',
    gradeLevel: '4th Grade',
    duration: '',
    category: 'Other'
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/educator-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit');
      }

      setStatus('success');
      setFormData({
        name: '',
        email: '',
        title: '',
        description: '',
        gradeLevel: '4th Grade',
        duration: '',
        category: 'Other'
      });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
      {status === 'success' ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-3xl font-bold text-green-600 mb-3">Thank You!</h3>
          <p className="text-lg text-gray-700 mb-6">
            Your implementation idea has been submitted. We'll review it and may feature it on this page to help other educators!
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Submit Another Idea
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Share Your Implementation</h3>
            <p className="text-gray-600">
              Help fellow educators by sharing how you're using TK-000 in your classroom.
            </p>
          </div>

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Your Name (Optional)
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="Jane Smith"
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="teacher@school.edu"
            />
            <p className="text-xs text-gray-500 mt-1">
              We'll only use this to contact you if we have questions about your submission
            </p>
          </div>

          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Implementation Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="e.g., Guardian Trading Card Station Rotation"
            />
          </div>

          {/* Category and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white"
              >
                <option value="Full Unit">Full Unit</option>
                <option value="Quick Activity">Quick Activity</option>
                <option value="Weekly Routine">Weekly Routine</option>
                <option value="Project">Project</option>
                <option value="Assessment">Assessment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="gradeLevel" className="block text-sm font-semibold text-gray-700 mb-2">
                Grade Level
              </label>
              <select
                id="gradeLevel"
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white"
              >
                <option value="3rd Grade">3rd Grade</option>
                <option value="4th Grade">4th Grade</option>
                <option value="5th Grade">5th Grade</option>
                <option value="Multi-Grade">Multi-Grade</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-2">
                Duration
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="e.g., 2 weeks"
              />
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Implementation Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={8}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
              placeholder="Describe how you used TK-000 in your classroom. Include:&#10;• What you did&#10;• How students responded&#10;• Tips for other teachers&#10;• Any modifications you made&#10;• What worked well / what you'd change"
            />
            <p className="text-xs text-gray-500 mt-1">
              Be specific! Other teachers will appreciate concrete details they can adapt.
            </p>
          </div>

          {/* Error Message */}
          {status === 'error' && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
              <p className="text-red-800 font-semibold">
                Error: {errorMessage || 'Failed to submit. Please try again.'}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'submitting' ? 'Submitting...' : 'Submit Your Implementation'}
            </button>
          </div>

          {/* Privacy Note */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600">
              <strong>Privacy Note:</strong> Your submission will be reviewed before being featured.
              We'll only share your first name and general teaching context (e.g., "4th grade teacher in Utah").
              Your email will never be published or shared with third parties.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
