'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Container from '@/components/Container'
import Button from '@/components/Button'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validToken, setValidToken] = useState(false)

  useEffect(() => {
    // Check if we have a valid session from the password reset email
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        setValidToken(true)
      } else {
        setError('Invalid or expired reset link. Please request a new password reset.')
      }
    }

    checkSession()
  }, [])

  const handlePasswordReset = async (e: React.FormEvent) => {
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
    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)

      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        router.push('/auth/signin')
      }, 3000)
    }
  }

  if (success) {
    return (
      <Container className="py-20">
        <div className="max-w-md mx-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-md p-8 text-center">
            <h2 className="text-2xl font-semibold text-zinc-100 mb-2">
              Password reset successful
            </h2>
            <p className="text-zinc-400 mb-6">
              Your password has been updated.
            </p>
            <p className="text-sm text-zinc-500">
              Redirecting to sign in.
            </p>
          </div>
        </div>
      </Container>
    )
  }

  if (!validToken && error) {
    return (
      <Container className="py-20">
        <div className="max-w-md mx-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-md p-8 text-center">
            <h2 className="text-2xl font-semibold text-zinc-100 mb-2">
              Invalid reset link
            </h2>
            <p className="text-zinc-400 mb-6">
              {error}
            </p>
            <Link href="/auth/forgot-password">
              <Button className="w-full">
                Request new reset link
              </Button>
            </Link>
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
            Reset your password
          </h1>
          <p className="text-zinc-400">
            Enter your new password.
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-md p-8">
          <form onSubmit={handlePasswordReset} className="space-y-6">
            {error && (
              <div className="bg-zinc-950 border border-red-800 rounded-md p-4">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-zinc-800 rounded-md bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Must be at least 6 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-zinc-800 rounded-md bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !validToken}
            >
              {loading ? 'Resetting password...' : 'Reset Password'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/signin"
              className="text-sm text-amber-200 hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </Container>
  )
}
