'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Container from '@/components/Container'
import Button from '@/components/Button'
import SocialLogin from '@/components/SocialLogin'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
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
              We sent a confirmation link. Activate your account to continue.
            </p>
            <Button onClick={() => router.push('/auth/signin')}>
              Go to sign in
            </Button>
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
            Create account
          </h1>
          <p className="text-zinc-400">
            Access the network.
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-md p-8">
          <form onSubmit={handleSignUp} className="space-y-6">
            {error && (
              <div className="bg-zinc-950 border border-red-800 rounded-md p-4">
                <p className="text-sm text-red-300">{error}</p>
                {error.includes('confirmation email') && (
                  <p className="text-xs text-red-300 mt-2">
                    Note: This is often caused by temporary email rate limits. If you are the site owner, please ensure SMTP is configured in the Supabase dashboard.
                  </p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Email
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

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-zinc-800 rounded-md bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-zinc-800 rounded-md bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6">
            <SocialLogin />
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-400">
              Already have an account?{' '}
              <Link
                href="/auth/signin"
                className="text-amber-200 hover:underline font-medium"
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
