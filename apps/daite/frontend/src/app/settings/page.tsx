'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { Navigation } from '@/components/Navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Bell, Lock, User, Palette, Shield, UserCheck, TrendingUp } from 'lucide-react'
import { ConciergeServiceModal } from '@/components/ConciergeServiceModal'
import { ConnectionTypesSelector } from '@/components/ConnectionTypesSelector'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  const router = useRouter()
  const client = useSupabaseClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showProfileReview, setShowProfileReview] = useState(false)
  const [showProfileOptimization, setShowProfileOptimization] = useState(false)
  const [connectionTypes, setConnectionTypes] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!client) return

    const loadUserData = async () => {
      try {
        const { data: { user: authUser } } = await client.auth.getUser()
        if (!authUser) {
          router.push('/')
          return
        }
        setUser(authUser)

        const { data: userData } = await client
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        const { data: profileData } = await client
          .from('user_profiles')
          .select('*')
          .eq('user_id', authUser.id)
          .single()

        setProfile(profileData || {})
        setConnectionTypes((profileData?.looking_for as string[]) || [])
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [client, router])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-safe mb-20 md:mb-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Settings
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-colors
                        ${activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 border border-purple-500/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                        }
                      `}
                    >
                      <Icon size={18} />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Manage your personal information and CYRAiNO profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Concierge Services */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => setShowProfileReview(true)}
                      className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg hover:border-purple-500/50 transition-all text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <UserCheck className="w-5 h-5 text-purple-400" />
                        <span className="font-semibold">Profile Review</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">Get AI feedback on your profile</p>
                      <Badge variant="primary" className="text-xs">5 tokens</Badge>
                    </button>
                    
                    <button
                      onClick={() => setShowProfileOptimization(true)}
                      className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg hover:border-blue-500/50 transition-all text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        <span className="font-semibold">Profile Optimization</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">Get specific improvement suggestions</p>
                      <Badge variant="primary" className="text-xs">5 tokens</Badge>
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Pseudonym</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="Your display name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="Tell us about yourself..."
                      defaultValue={profile?.bio || ''}
                    />
                  </div>

                  {/* Connection Types */}
                  <div>
                    <ConnectionTypesSelector
                      selected={connectionTypes}
                      onChange={setConnectionTypes}
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Select all the types of connections you&apos;re open to. You can have romantic relationships AND friends AND music partners—all at the same time!
                    </p>
                  </div>
                  
                  <Button 
                    variant="primary"
                    onClick={async () => {
                      if (!client || !user) return
                      setSaving(true)
                      try {
                        // Update or create profile
                        const profileData = {
                          user_id: user.id,
                          looking_for: connectionTypes,
                          bio: (document.querySelector('textarea[placeholder*="Tell us about yourself"]') as HTMLTextAreaElement)?.value || profile?.bio
                        }

                        if (profile?.id) {
                          await client
                            .from('user_profiles')
                            .update(profileData)
                            .eq('user_id', user.id)
                        } else {
                          await client
                            .from('user_profiles')
                            .insert(profileData)
                        }

                        // Reload profile
                        const { data: updatedProfile } = await client
                          .from('user_profiles')
                          .select('*')
                          .eq('user_id', user.id)
                          .single()

                        setProfile(updatedProfile)
                        alert('Profile saved!')
                      } catch (error) {
                        console.error('Error saving profile:', error)
                        alert('Failed to save profile')
                      } finally {
                        setSaving(false)
                      }
                    }}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Control how and when you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div>
                      <p className="font-medium">New Matches</p>
                      <p className="text-sm text-slate-400">Get notified when CYRAiNO finds a new match</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div>
                      <p className="font-medium">Messages</p>
                      <p className="text-sm text-slate-400">Receive notifications for new messages</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div>
                      <p className="font-medium">Date Reminders</p>
                      <p className="text-sm text-slate-400">Get reminded about upcoming dates</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </div>
                  
                  <Button variant="primary">Save Preferences</Button>
                </CardContent>
              </Card>
            )}

            {activeTab === 'privacy' && (
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Control your privacy and visibility</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div>
                      <p className="font-medium">Profile Visibility</p>
                      <p className="text-sm text-slate-400">Who can see your profile</p>
                    </div>
                    <select className="px-3 py-2 bg-slate-700 rounded-lg outline-none">
                      <option>Everyone</option>
                      <option>Matched users only</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div>
                      <p className="font-medium">Photo Reveal</p>
                      <p className="text-sm text-slate-400">Require mutual match to see photos</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </div>
                  
                  <Button variant="primary">Save Privacy Settings</Button>
                </CardContent>
              </Card>
            )}

            {activeTab === 'appearance' && (
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize your app experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Theme</label>
                    <div className="grid grid-cols-3 gap-4">
                      <button className="p-4 border-2 border-purple-500 rounded-lg bg-slate-800">
                        <div className="text-center">
                          <div className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded mb-2"></div>
                          <p className="text-sm font-medium">Dark</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Change Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none mb-2"
                      placeholder="New password"
                    />
                    <input
                      type="password"
                      className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="Confirm new password"
                    />
                  </div>
                  
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <p className="font-medium mb-2">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-400 mb-4">Add an extra layer of security to your account</p>
                    <Button variant="secondary">Enable 2FA</Button>
                  </div>
                  
                  <div className="p-4 bg-red-600/20 border border-red-500/30 rounded-lg">
                    <p className="font-medium mb-2 text-red-400">Danger Zone</p>
                    <p className="text-sm text-slate-400 mb-4">Permanently delete your account and all data</p>
                    <Button variant="danger">Delete Account</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Concierge Service Modals */}
        <ConciergeServiceModal
          serviceType="profile_review"
          isOpen={showProfileReview}
          onClose={() => setShowProfileReview(false)}
          contextData={{ user, profile }}
        />
        
        <ConciergeServiceModal
          serviceType="profile_optimization"
          isOpen={showProfileOptimization}
          onClose={() => setShowProfileOptimization(false)}
          contextData={{ user, profile }}
        />
      </div>
      </div>
    </ProtectedRoute>
  )
}

