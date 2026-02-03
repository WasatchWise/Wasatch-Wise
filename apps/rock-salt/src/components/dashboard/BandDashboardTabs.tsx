'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import BandProfileEditor from '@/components/BandProfileEditor'
import BandMemberEditor from '@/components/BandMemberEditor'
import UploadTrackForm from '@/components/UploadTrackForm'
import UploadPhotoForm from '@/components/UploadPhotoForm'
import SpiderRiderWizard from '@/components/spider-rider/SpiderRiderWizard'
import { CompatibleVenuesSection } from '@/components/compatibility'
import Link from 'next/link'

interface BandDashboardTabsProps {
  band: any
  genres: { id: string; name: string }[]
  spiderRiders: any[]
  acceptances: any[]
  bookingRequests: any[]
  contracts: any[]
  submissions: any[]
  allVenues: any[]
  tracks: any[]
  photos: any[]
  saltRocksBalance: number
  transactions: any[]
  initialTab: string
}

type TabKey = 'overview' | 'profile' | 'members' | 'spider-rider' | 'acceptances' | 'bookings' | 'wallet'

const TABS: { key: TabKey; label: string; icon: JSX.Element }[] = [
  {
    key: 'overview',
    label: 'Overview',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    key: 'profile',
    label: 'Profile & Media',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    key: 'members',
    label: 'Members',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    key: 'spider-rider',
    label: 'Spider Rider',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    key: 'acceptances',
    label: 'Acceptances',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'bookings',
    label: 'Bookings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: 'wallet',
    label: 'Wallet',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
]

export default function BandDashboardTabs({
  band,
  genres,
  spiderRiders,
  acceptances,
  bookingRequests,
  contracts,
  submissions,
  allVenues,
  tracks,
  photos,
  saltRocksBalance,
  transactions,
  initialTab,
}: BandDashboardTabsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab as TabKey || 'overview')
  const [showWizard, setShowWizard] = useState(false)

  const publishedRider = spiderRiders.find(r => r.status === 'published')
  const draftRider = spiderRiders.find(r => r.status === 'draft')

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab)
    // Update URL without navigation
    window.history.replaceState(null, '', `?tab=${tab}`)
  }

  const totalPlays = tracks.reduce((sum: number, track: any) => sum + (track.play_count || 0), 0)

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex overflow-x-auto">
          {TABS.map(tab => {
            const isActive = activeTab === tab.key
            const badgeCount =
              tab.key === 'acceptances' ? acceptances.length :
              tab.key === 'bookings' ? bookingRequests.filter(b => b.status === 'pending').length :
              0

            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
                {badgeCount > 0 && (
                  <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-2 py-0.5 rounded-full">
                    {badgeCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <StatCard
                icon={<MusicIcon />}
                label="Tracks"
                value={tracks.length}
                color="indigo"
              />
              <StatCard
                icon={<PhotoIcon />}
                label="Photos"
                value={photos.length}
                color="purple"
              />
              <StatCard
                icon={<PlayIcon />}
                label="Total Plays"
                value={totalPlays}
                color="green"
              />
              <StatCard
                icon={<TokenIcon />}
                label="Salt Rocks"
                value={saltRocksBalance}
                color="amber"
              />
            </div>

            {/* Spider Rider Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Spider Rider Status
              </h3>
              {publishedRider ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      Published &amp; Active
                    </span>
                    <span className="text-sm text-gray-500">
                      {publishedRider.version} - Published {new Date(publishedRider.published_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleTabChange('spider-rider')}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View Details
                  </button>
                </div>
              ) : draftRider ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-amber-500 rounded-full" />
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      Draft - Not Published
                    </span>
                  </div>
                  <button
                    onClick={() => handleTabChange('spider-rider')}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700"
                  >
                    Complete &amp; Publish
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                    <span className="text-gray-600 dark:text-gray-400">
                      No Spider Rider created yet
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowWizard(true)
                      handleTabChange('spider-rider')
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700"
                  >
                    Create Spider Rider
                  </button>
                </div>
              )}
            </div>

            {/* Compatible Venues (when rider published) */}
            {publishedRider && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Compatible Venues
                </h3>
                <CompatibleVenuesSection riderId={publishedRider.id} />
              </div>
            )}

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Acceptances */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Recent Acceptances
                  </h3>
                  {acceptances.length > 0 && (
                    <button
                      onClick={() => handleTabChange('acceptances')}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View All
                    </button>
                  )}
                </div>
                {acceptances.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {publishedRider
                      ? 'No venues have accepted your rider yet.'
                      : 'Publish your Spider Rider to start receiving acceptances.'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {acceptances.slice(0, 3).map((acc: any) => (
                      <div key={acc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {acc.venues?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {acc.venues?.city}, {acc.venues?.state}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(acc.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Bookings */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Pending Bookings
                  </h3>
                  {bookingRequests.length > 0 && (
                    <button
                      onClick={() => handleTabChange('bookings')}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View All
                    </button>
                  )}
                </div>
                {bookingRequests.filter(b => b.status === 'pending').length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No pending booking requests.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {bookingRequests
                      .filter(b => b.status === 'pending')
                      .slice(0, 3)
                      .map((booking: any) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {booking.venues?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(booking.requested_date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded">
                            Pending
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            {/* Profile Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <BandProfileEditor band={band} availableGenres={genres} />
            </div>

            {/* Tracks Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Tracks & Demos
              </h2>
              <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                <UploadTrackForm bandId={band.id} />
              </div>
              {tracks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No tracks uploaded yet. Upload your first track above!
                </div>
              ) : (
                <div className="space-y-4">
                  {tracks
                    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((track: any) => (
                      <div
                        key={track.id}
                        className="flex items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {track.title}
                            </h3>
                            {track.is_featured && (
                              <span className="text-yellow-500 text-sm" title="Featured">★</span>
                            )}
                          </div>
                          {track.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {track.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            {track.track_type && (
                              <span className="capitalize">{track.track_type.replace('_', ' ')}</span>
                            )}
                            <span>{track.play_count || 0} plays</span>
                          </div>
                        </div>
                        <audio src={track.file_url} controls className="h-10" style={{ maxWidth: '300px' }} />
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Photos Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Photo Gallery
              </h2>
              <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                <UploadPhotoForm bandId={band.id} />
              </div>
              {photos.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No photos uploaded yet. Upload your first photo above!
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos
                    .sort((a: any, b: any) => (a.photo_order || 0) - (b.photo_order || 0))
                    .map((photo: any) => (
                      <div key={photo.id} className="group relative aspect-square">
                        <img
                          src={photo.url}
                          alt={photo.caption || band.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {photo.is_primary && (
                          <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <BandMemberEditor
              bandId={band.id}
              bandName={band.name}
              isOwner={true}
            />
          </div>
        )}

        {/* Spider Rider Tab */}
        {activeTab === 'spider-rider' && (
          <div>
            {/* Existing riders list */}
            {!showWizard && spiderRiders.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Your Spider Riders
                  </h2>
                  <button
                    onClick={() => setShowWizard(true)}
                    className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                  >
                    + New Version
                  </button>
                </div>

                <div className="space-y-4">
                  {spiderRiders.map((rider: any) => (
                    <div
                      key={rider.id}
                      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 ${
                        rider.status === 'published'
                          ? 'border-green-500'
                          : rider.status === 'draft'
                            ? 'border-amber-500'
                            : 'border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-black text-gray-900 dark:text-white">
                            {rider.version || 'v1'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            rider.status === 'published'
                              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                              : rider.status === 'draft'
                                ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {rider.status.charAt(0).toUpperCase() + rider.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {rider.status === 'draft' && (
                            <button
                              onClick={() => setShowWizard(true)}
                              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700"
                            >
                              Edit & Publish
                            </button>
                          )}
                          {rider.status === 'published' && (
                            <span className="text-sm text-gray-500">
                              Published {new Date(rider.published_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Guarantee</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ${rider.guarantee_min?.toLocaleString()}
                            {rider.guarantee_max && ` - $${rider.guarantee_max.toLocaleString()}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Door Split</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {rider.door_split_percentage ? `${rider.door_split_percentage}%` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Stage Size</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {rider.min_stage_width_feet && rider.min_stage_depth_feet
                              ? `${rider.min_stage_width_feet}' x ${rider.min_stage_depth_feet}'`
                              : 'Flexible'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Merch Split</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {rider.merch_split_to_venue_percentage
                              ? `${rider.merch_split_to_venue_percentage}% to venue`
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wizard */}
            {(showWizard || spiderRiders.length === 0) && (
              <div>
                {spiderRiders.length > 0 && (
                  <button
                    onClick={() => setShowWizard(false)}
                    className="mb-6 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    ← Back to Riders List
                  </button>
                )}
                <SpiderRiderWizard
                  bandId={band.id}
                  bandName={band.name}
                  existingRider={draftRider || undefined}
                />
              </div>
            )}
          </div>
        )}

        {/* Acceptances Tab */}
        {activeTab === 'acceptances' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Venue Acceptances
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Venues that have accepted your Spider Rider terms
                </p>
              </div>
            </div>

            {!publishedRider ? (
              <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-8 text-center">
                <p className="text-amber-800 dark:text-amber-200 mb-4">
                  You need to publish a Spider Rider before venues can accept your terms.
                </p>
                <button
                  onClick={() => handleTabChange('spider-rider')}
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                >
                  Create Spider Rider
                </button>
              </div>
            ) : acceptances.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No Acceptances Yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Your Spider Rider is live! Venues can browse and accept your terms at any time.
                </p>
                <Link
                  href="/book/spider-riders"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
                >
                  View how venues see your rider →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {acceptances.map((acc: any) => (
                  <div
                    key={acc.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {acc.venues?.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {acc.venues?.city}, {acc.venues?.state}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm font-semibold rounded-full">
                          Accepted
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(acc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {acc.notes && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Venue Notes:</strong> {acc.notes}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Link
                        href={`/venues/${acc.venues?.slug}`}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        View Venue
                      </Link>
                      <Link
                        href={`/dashboard/messages?venue=${acc.venue_id}`}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                      >
                        Message Venue
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Booking Requests
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Manage date requests and contracts
                </p>
              </div>
            </div>

            {/* Contracts Section */}
            {contracts.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Generated Contracts
                </h3>
                <div className="space-y-4">
                  {contracts.map((contract: any) => (
                    <div
                      key={contract.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-indigo-600"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            {(contract.venues as any)?.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {new Date(contract.event_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                            ${contract.agreed_guarantee?.toLocaleString()} guarantee
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                            contract.status === 'fully_signed'
                              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                              : contract.status === 'band_signed' || contract.status === 'venue_signed'
                                ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {contract.status.replace('_', ' ').charAt(0).toUpperCase() +
                             contract.status.replace('_', ' ').slice(1)}
                          </span>
                          <Link
                            href={`/verify/${contract.id}`}
                            className="block mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            View Contract
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Requests */}
            {bookingRequests.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No Booking Requests
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  When venues request specific dates, they'll appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookingRequests.map((booking: any) => (
                  <div
                    key={booking.id}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 ${
                      booking.status === 'pending'
                        ? 'border-amber-500'
                        : booking.status === 'confirmed'
                          ? 'border-green-500'
                          : 'border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          {booking.venues?.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {booking.venues?.city}, {booking.venues?.state}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        booking.status === 'pending'
                          ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                          : booking.status === 'confirmed'
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {new Date(booking.requested_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      {booking.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {booking.notes}
                        </p>
                      )}
                    </div>
                    {booking.status === 'pending' && (
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
                          Confirm Date
                        </button>
                        <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">
                          Decline
                        </button>
                        <Link
                          href={`/dashboard/messages?venue=${booking.venue_id}`}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          Message
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wallet Tab */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Balance Card */}
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white">
                <p className="text-amber-100 text-sm font-medium mb-1">Salt Rocks Balance</p>
                <p className="text-4xl font-black mb-4">{saltRocksBalance.toLocaleString()}</p>
                <Link
                  href="/dashboard/wallet"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors"
                >
                  Purchase More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>

              {/* Usage Info */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  What can you spend Salt Rocks on?
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">💎</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      <strong className="text-gray-900 dark:text-white">Featured listings</strong> - Get priority placement (100 rocks/week)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">📋</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      <strong className="text-gray-900 dark:text-white">Contract generation</strong> - Create official PDF contracts (25 rocks)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">🎵</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      <strong className="text-gray-900 dark:text-white">Extra song slots</strong> - Upload more tracks (10 rocks each)
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Recent Transactions
              </h3>
              {transactions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No transactions yet
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx: any) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {tx.description || tx.transaction_type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`font-bold ${
                        tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ icon, label, value, color }: {
  icon: JSX.Element
  label: string
  value: number
  color: 'indigo' | 'purple' | 'green' | 'amber'
}) {
  const colors = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    amber: 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {label}
          </p>
        </div>
      </div>
    </div>
  )
}

// Icons
function MusicIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  )
}

function PhotoIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function TokenIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
