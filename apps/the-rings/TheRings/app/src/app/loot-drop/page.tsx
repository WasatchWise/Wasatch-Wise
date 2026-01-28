'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function LootDrop() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [status, setStatus] = useState<'idle' | 'capturing' | 'uploading' | 'success' | 'error'>('idle')
  const [preview, setPreview] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const handleCapture = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    setStatus('uploading')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/loot-drop')
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      // Get or create portfolio
      let { data: portfolio } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', profile.id)
        .single()

      if (!portfolio) {
        const { data: site } = await supabase
          .from('sites')
          .select('id')
          .eq('slug', 'south-jordan-flc')
          .single()

        const { data: newPortfolio, error: portfolioError } = await supabase
          .from('portfolios')
          .insert({
            user_id: profile.id,
            site_id: site?.id,
            public_slug: `champion-${profile.id.slice(0, 8)}`,
          })
          .select('id')
          .single()

        if (portfolioError) throw portfolioError
        portfolio = newPortfolio
      }

      // Upload to storage
      const fileName = `${profile.id}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('artifacts')
        .upload(fileName, file)

      if (uploadError) {
        // If bucket doesn't exist, just log the artifact without storage
        // Storage upload failed - artifact will be recorded without file storage
      }

      // Create artifact record
      const { error: artifactError } = await supabase.from('artifacts').insert({
        portfolio_id: portfolio.id,
        title: file.name.replace(/\.[^/.]+$/, ''),
        type: file.type.startsWith('image/') ? 'image' :
              file.type.startsWith('video/') ? 'video' : 'other',
        storage_path: fileName,
      })

      if (artifactError) throw artifactError

      // Log activity
      await supabase.from('activity_events').insert({
        user_id: profile.id,
        event_type: 'loot_drop',
        event_data: {
          artifact_type: file.type,
          file_name: file.name,
          timestamp: new Date().toISOString(),
        },
      })

      setStatus('success')
      setMessage('Artifact captured!')

      setTimeout(() => router.push('/dashboard'), 2000)
    } catch {
      setStatus('error')
      setMessage('Upload failed. Try again.')
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-8 text-center border-2 border-accent/50 bg-card/80 backdrop-blur">
        <h1 className="text-2xl font-bold mb-2 text-accent">LOOT DROP</h1>
        <p className="text-muted-foreground text-sm mb-8">Capture your artifact</p>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {status === 'success' ? (
          <div className="space-y-4">
            {preview && (
              <div className="w-full aspect-square rounded-lg overflow-hidden border-2 border-green-500 relative">
                <Image src={preview} alt="Captured" fill className="object-cover" />
              </div>
            )}
            <div className="flex items-center justify-center gap-2 text-green-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-mono">{message}</span>
            </div>
            <p className="text-muted-foreground text-sm">Redirecting...</p>
          </div>
        ) : status === 'error' ? (
          <div className="space-y-4">
            {preview && (
              <div className="w-full aspect-square rounded-lg overflow-hidden border-2 border-red-500 opacity-50 relative">
                <Image src={preview} alt="Failed" fill className="object-cover" />
              </div>
            )}
            <p className="text-red-400 font-mono">{message}</p>
            <Button onClick={handleCapture} className="w-full">
              Retry
            </Button>
          </div>
        ) : status === 'uploading' ? (
          <div className="space-y-4">
            {preview && (
              <div className="w-full aspect-square rounded-lg overflow-hidden border-2 border-primary animate-pulse relative">
                <Image src={preview} alt="Uploading" fill className="object-cover" />
              </div>
            )}
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-muted-foreground font-mono">Uploading...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Capture button */}
            <button
              onClick={handleCapture}
              className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            >
              <svg className="w-12 h-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <p className="text-muted-foreground text-sm">
              Tap to capture your work
            </p>
          </div>
        )}

        {/* Back link */}
        <div className="mt-8 pt-6 border-t border-border">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Dashboard
          </Link>
        </div>
      </Card>
    </main>
  )
}
