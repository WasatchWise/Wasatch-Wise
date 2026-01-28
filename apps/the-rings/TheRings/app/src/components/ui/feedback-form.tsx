'use client'

import { useState, FormEvent } from 'react'

interface FeedbackFormProps {
  className?: string
}

export function FeedbackForm({ className = '' }: FeedbackFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('general')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          category,
          message,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback')
      }

      setStatus('success')
      // Reset form
      setName('')
      setEmail('')
      setCategory('general')
      setMessage('')
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus('idle')
      }, 5000)
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="feedback-name" className="block text-sm font-[family-name:var(--font-oswald)] uppercase tracking-wider mb-2" style={{ color: 'var(--boxing-cream)' }}>
              Name
            </label>
            <input
              type="text"
              id="feedback-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--boxing-gold)]"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderColor: 'var(--boxing-gold)',
                color: 'var(--boxing-cream)',
              }}
              disabled={status === 'submitting'}
            />
          </div>
          <div>
            <label htmlFor="feedback-email" className="block text-sm font-[family-name:var(--font-oswald)] uppercase tracking-wider mb-2" style={{ color: 'var(--boxing-cream)' }}>
              Email
            </label>
            <input
              type="email"
              id="feedback-email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--boxing-gold)]"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderColor: 'var(--boxing-gold)',
                color: 'var(--boxing-cream)',
              }}
              disabled={status === 'submitting'}
            />
          </div>
        </div>
        <div>
          <label htmlFor="feedback-category" className="block text-sm font-[family-name:var(--font-oswald)] uppercase tracking-wider mb-2" style={{ color: 'var(--boxing-cream)' }}>
            Category
          </label>
          <select
            id="feedback-category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--boxing-gold)]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderColor: 'var(--boxing-gold)',
              color: 'var(--boxing-cream)',
            }}
            disabled={status === 'submitting'}
          >
            <option value="general" style={{ backgroundColor: 'var(--boxing-brown)', color: 'var(--boxing-cream)' }}>General Feedback</option>
            <option value="question" style={{ backgroundColor: 'var(--boxing-brown)', color: 'var(--boxing-cream)' }}>Question</option>
            <option value="suggestion" style={{ backgroundColor: 'var(--boxing-brown)', color: 'var(--boxing-cream)' }}>Suggestion</option>
            <option value="board" style={{ backgroundColor: 'var(--boxing-brown)', color: 'var(--boxing-cream)' }}>Board Member Feedback</option>
            <option value="partnership" style={{ backgroundColor: 'var(--boxing-brown)', color: 'var(--boxing-cream)' }}>Partnership Inquiry</option>
            <option value="other" style={{ backgroundColor: 'var(--boxing-brown)', color: 'var(--boxing-cream)' }}>Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="feedback-message" className="block text-sm font-[family-name:var(--font-oswald)] uppercase tracking-wider mb-2" style={{ color: 'var(--boxing-cream)' }}>
            Message
          </label>
          <textarea
            id="feedback-message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--boxing-gold)] resize-none"
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderColor: 'var(--boxing-gold)',
              color: 'var(--boxing-cream)',
            }}
            disabled={status === 'submitting'}
            placeholder="Share your thoughts, questions, or suggestions..."
          />
        </div>
        {status === 'error' && errorMessage && (
          <div className="p-4 border-2" style={{ borderColor: 'var(--boxing-red)', backgroundColor: 'rgba(139, 38, 53, 0.2)', color: 'var(--boxing-cream)' }}>
            <p className="font-[family-name:var(--font-playfair)] text-sm">{errorMessage}</p>
          </div>
        )}
        {status === 'success' && (
          <div className="p-4 border-2" style={{ borderColor: '#4a7c59', backgroundColor: 'rgba(74, 124, 89, 0.2)', color: 'var(--boxing-cream)' }}>
            <p className="font-[family-name:var(--font-playfair)] text-sm font-medium">
              Thank you! Your feedback has been submitted. We'll review it and get back to you soon.
            </p>
          </div>
        )}
        <button
          type="submit"
          disabled={status === 'submitting' || status === 'success'}
          className="w-full font-[family-name:var(--font-oswald)] px-8 py-4 text-lg uppercase tracking-widest transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            backgroundColor: status === 'success' ? '#4a7c59' : 'var(--boxing-gold)',
            color: 'var(--boxing-brown)'
          }}
        >
          {status === 'submitting' ? 'Submitting...' : status === 'success' ? 'Submitted!' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  )
}

