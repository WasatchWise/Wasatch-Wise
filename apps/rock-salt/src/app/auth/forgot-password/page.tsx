'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Container from '@/components/Container'
import Button from '@/components/Button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Container className="py-20">
        <div className="max-w-md mx-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-md p-8 text-center">
            <h2 className="text-2xl font-semibold text-zinc-100 mb-2">
              Check your email
            </h2>
            <p className="text-zinc-400 mb-6">
              We've sent reset instructions to <strong className="text-zinc-200">{email}</strong>.
            </p>
            <div className="space-y-3">
              <Button onClick={() => setSuccess(false)} variant="outline" className="w-full">
                Send another email
              </Button>
              <Link
                href="/auth/signin"
                className="block text-sm text-amber-200 hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-20">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-zinc-100 mb-2">
            Forgot password
          </h1>
          <p className="text-zinc-400">
            Enter your email to receive reset instructions.
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-md p-8">
          <form onSubmit={handleResetRequest} className="space-y-6">
            {error && (
              <div className="bg-zinc-950 border border-red-800 rounded-md p-4">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-zinc-800 rounded-md bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="you@example.com"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{' '}
              <Link
                href="/auth/signin"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Container>
  )
}
