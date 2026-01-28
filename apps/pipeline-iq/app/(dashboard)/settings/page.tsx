'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Shield,
  Zap,
  Mail,
  Brain,
  Database,
  Bell,
  User,
  Building2,
  CheckCircle,
  Crown,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface UserSettings {
  email: string
  fullName: string
  isGodMode: boolean
  organizationName: string
}

interface FeatureFlags {
  aiScoring: boolean
  aiEmails: boolean
  realTimeSync: boolean
  advancedAnalytics: boolean
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserSettings>({
    email: 'msartain@getgrooven.com',
    fullName: 'Mike Sartain',
    isGodMode: true,
    organizationName: 'Groove Technologies'
  })

  const [features, setFeatures] = useState<FeatureFlags>({
    aiScoring: true,
    aiEmails: true,
    realTimeSync: true,
    advancedAnalytics: true
  })

  const [loading, setLoading] = useState(false)

  const handleFeatureToggle = (feature: keyof FeatureFlags) => {
    if (!user.isGodMode) {
      toast.error('Upgrade to God Mode to enable this feature')
      return
    }
    setFeatures(prev => ({ ...prev, [feature]: !prev[feature] }))
    toast.success(`${feature} ${features[feature] ? 'disabled' : 'enabled'}`)
  }

  const handleSave = async () => {
    setLoading(true)
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Settings saved!')
    setLoading(false)
  }

  const featureList = [
    { key: 'aiScoring' as const, name: 'AI Project Scoring', description: 'Automatically score projects for Groove fit', icon: Brain, premium: false },
    { key: 'aiEmails' as const, name: 'AI Email Generation', description: 'Generate personalized NEPQ outreach emails', icon: Mail, premium: false },
    { key: 'realTimeSync' as const, name: 'Real-Time Sync', description: 'Live updates from Construction Wire', icon: Database, premium: false },
    { key: 'advancedAnalytics' as const, name: 'Email Analytics', description: 'Track email performance and engagement', icon: Bell, premium: false },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and feature preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* God Mode Banner */}
      {user.isGodMode && (
        <Card className="border-yellow-500 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-yellow-600" />
              <div>
                <h3 className="font-bold text-yellow-800 dark:text-yellow-200">God Mode Active</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  All premium features unlocked. Full system access enabled.
                </p>
              </div>
            </div>
            <Shield className="h-6 w-6 text-yellow-600" />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={user.fullName}
                onChange={(e) => setUser(prev => ({ ...prev, fullName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Email verified</span>
            </div>
          </CardContent>
        </Card>

        {/* Organization Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization
            </CardTitle>
            <CardDescription>Company settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                value={user.organizationName}
                onChange={(e) => setUser(prev => ({ ...prev, organizationName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Subscription</Label>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                  <Crown className="mr-1 h-4 w-4" />
                  God Mode
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Organization ID</Label>
              <code className="block rounded bg-muted p-2 text-xs break-all">
                34249404-774f-4b80-b346-a2d9e6322584
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Use this ID for API authentication
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Features
          </CardTitle>
          <CardDescription>
            Enable or disable platform features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {featureList.map((feature) => (
              <div
                key={feature.key}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <feature.icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{feature.name}</span>
                      {feature.premium && (
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
                <Switch
                  checked={features[feature.key]}
                  onCheckedChange={() => handleFeatureToggle(feature.key)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Integrations
          </CardTitle>
          <CardDescription>
            Connected services and data sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">CW</span>
                </div>
                <div>
                  <div className="font-medium">Construction Wire</div>
                  <p className="text-xs text-muted-foreground">Project data scraping</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const toastId = toast.loading('Triggering scraper...')
                    try {
                      const res = await fetch('/api/admin/trigger-scrape', {
                        method: 'POST',
                        body: JSON.stringify({ maxProjects: 50 })
                      })
                      const data = await res.json()
                      if (!res.ok) throw new Error(data.error || 'Failed to trigger')

                      toast.success('Scraper started!', {
                        description: 'It will run in the background via GitHub Actions.'
                      })
                    } catch (err: any) {
                      toast.error('Failed to start scraper', {
                        description: err.message
                      })
                    } finally {
                      toast.dismiss(toastId)
                    }
                  }}
                >
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Run Now
                </Button>
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Connected</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-green-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-green-600">OA</span>
                </div>
                <div>
                  <div className="font-medium">OpenAI</div>
                  <p className="text-xs text-muted-foreground">AI email generation</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Connected</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
