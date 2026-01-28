'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import VenueProfileEditor from '@/components/VenueProfileEditor'
import UploadVenuePhotoForm from '@/components/UploadVenuePhotoForm'
import VenueSlotManager from '@/components/VenueSlotManager'
import ShowSubmissionsList from '@/components/ShowSubmissionsList'
import Link from 'next/link'

interface VenueDashboardTabsProps {
    venue: any
    slots: any[]
    submissions: any[]
    acceptances: any[]
    bookingRequests: any[]
    contracts: any[]
    photos: any[]
    saltRocksBalance: number
    transactions: any[]
    initialTab: string
}

type TabKey = 'overview' | 'profile' | 'slots' | 'submissions' | 'bookings' | 'wallet'

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
    },
    {
        key: 'slots',
        label: 'Open Slots',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        key: 'submissions',
        label: 'Submissions',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        ),
    },
    {
        key: 'bookings',
        label: 'Bookings',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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

export default function VenueDashboardTabs({
    venue,
    slots,
    submissions,
    acceptances,
    bookingRequests,
    contracts,
    photos,
    saltRocksBalance,
    transactions,
    initialTab,
}: VenueDashboardTabsProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<TabKey>(initialTab as TabKey || 'overview')

    const handleTabChange = (tab: TabKey) => {
        setActiveTab(tab)
        window.history.replaceState(null, '', `?tab=${tab}`)
    }

    const pendingSubmissions = submissions.filter(s => s.status === 'pending').length
    const pendingRequests = bookingRequests.filter(b => b.status === 'pending').length

    return (
        <div>
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
                <nav className="-mb-px flex overflow-x-auto">
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.key
                        const badgeCount =
                            tab.key === 'submissions' ? pendingSubmissions :
                                tab.key === 'bookings' ? pendingRequests :
                                    0

                        return (
                            <button
                                key={tab.key}
                                onClick={() => handleTabChange(tab.key)}
                                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${isActive
                                        ? 'border-amber-600 text-amber-600 dark:text-amber-400 dark:border-amber-400'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                                {badgeCount > 0 && (
                                    <span className="ml-2 bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">
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
                                icon={<PhotoIcon />}
                                label="Photos"
                                value={photos.length}
                                color="amber"
                            />
                            <StatCard
                                icon={<CalendarIcon />}
                                label="Open Slots"
                                value={slots.length}
                                color="green"
                            />
                            <StatCard
                                icon={<InboxIcon />}
                                label="Incoming"
                                value={submissions.length}
                                color="blue"
                            />
                            <StatCard
                                icon={<TokenIcon />}
                                label="Salt Rocks"
                                value={saltRocksBalance}
                                color="purple"
                            />
                        </div>

                        {/* Recent Activity */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Recent Submissions */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Show Submissions
                                    </h3>
                                    {submissions.length > 0 && (
                                        <button
                                            onClick={() => handleTabChange('submissions')}
                                            className="text-sm text-amber-600 dark:text-amber-400 hover:underline"
                                        >
                                            View All
                                        </button>
                                    )}
                                </div>
                                {submissions.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        No show submissions yet.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {submissions.slice(0, 3).map((sub: any) => (
                                            <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        {sub.bands?.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {sub.proposed_date ? new Date(sub.proposed_date).toLocaleDateString() : 'TBD'}
                                                    </p>
                                                </div>
                                                <span className={`text-xs font-semibold px-2 py-1 rounded ${sub.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        sub.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-gray-100'
                                                    }`}>
                                                    {sub.status.toUpperCase()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Booking Requests */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Outgoing Requests
                                    </h3>
                                    {bookingRequests.length > 0 && (
                                        <button
                                            onClick={() => handleTabChange('bookings')}
                                            className="text-sm text-amber-600 dark:text-amber-400 hover:underline"
                                        >
                                            View All
                                        </button>
                                    )}
                                </div>
                                {bookingRequests.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        No outgoing booking requests.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {bookingRequests.slice(0, 3).map((req: any) => (
                                            <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        {req.bands?.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(req.requested_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className={`text-xs font-semibold px-2 py-1 rounded ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                                    }`}>
                                                    {req.status.toUpperCase()}
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
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <VenueProfileEditor venue={venue} />
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                Photo Gallery
                            </h2>
                            <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                                <UploadVenuePhotoForm venueId={venue.id} />
                            </div>
                            {photos.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No photos uploaded yet.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {photos.map((photo: any) => (
                                        <div key={photo.id} className="group relative aspect-square">
                                            <img
                                                src={photo.url}
                                                alt={photo.caption || venue.name}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                            {photo.is_primary && (
                                                <div className="absolute top-2 right-2 bg-amber-600 text-white text-xs px-2 py-1 rounded">
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

                {/* Slots Tab */}
                {activeTab === 'slots' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <VenueSlotManager
                            venueId={venue.id}
                            venueName={venue.name}
                            slots={slots}
                        />
                    </div>
                )}

                {/* Submissions Tab */}
                {activeTab === 'submissions' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Incoming Submissions
                        </h2>
                        <ShowSubmissionsList submissions={submissions} type="venue" />
                    </div>
                )}

                {/* Bookings Tab */}
                {activeTab === 'bookings' && (
                    <div className="space-y-8">
                        {/* Accepted Spider Riders */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                Accepted Spider Riders
                            </h2>
                            {acceptances.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400">
                                    You haven't accepted any band's Spider Riders yet.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {acceptances.map((acc: any) => (
                                        <div key={acc.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">
                                                    {acc.spider_riders?.bands?.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Accepted on {new Date(acc.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Link
                                                href={`/bands/${acc.spider_riders?.bands?.slug}`}
                                                className="px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700"
                                            >
                                                Request Date
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Outgoing Requests */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                Date Requests
                            </h2>
                            {bookingRequests.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400">
                                    No date requests sent yet.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {bookingRequests.map((req: any) => (
                                        <div key={req.id} className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                            <div className="flex justify-between mb-2">
                                                <h4 className="font-bold">{req.bands?.name}</h4>
                                                <span className={`text-xs px-2 py-1 rounded font-bold ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        req.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {req.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Requested Date: {new Date(req.requested_date).toLocaleDateString()}
                                            </p>
                                            {req.notes && (
                                                <p className="text-xs text-gray-500 mt-2 italic">"{req.notes}"</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Contracts */}
                        {contracts.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                    Contracts
                                </h2>
                                <div className="space-y-4">
                                    {contracts.map((contract: any) => (
                                        <div key={contract.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">
                                                    {contract.bands?.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(contract.event_date).toLocaleDateString()} - ${contract.agreed_guarantee}
                                                </p>
                                            </div>
                                            <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded">
                                                {contract.status.toUpperCase()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Wallet Tab */}
                {activeTab === 'wallet' && (
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Salt Rocks Wallet
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Your current balance for bookings and promotions.
                            </p>
                            <div className="flex items-center gap-4 p-8 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800">
                                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                                    <TokenIcon className="w-10 h-10 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-4xl font-black text-gray-900 dark:text-white">
                                        {saltRocksBalance}
                                    </p>
                                    <p className="text-amber-600 dark:text-amber-400 font-bold">
                                        Salt Rocks Available
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                Recent Transactions
                            </h2>
                            {transactions.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400">No transactions yet.</p>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {transactions.map((tx: any) => (
                                        <div key={tx.id} className="py-4 flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white capitalize">
                                                    {tx.transaction_type.replace('_', ' ')}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(tx.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
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

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: number | string, color: string }) {
    const colors: any = {
        amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {value}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {label}
                    </p>
                </div>
            </div>
        </div>
    )
}

function PhotoIcon() {
    return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    )
}

function CalendarIcon() {
    return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    )
}

function InboxIcon() {
    return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
    )
}

function TokenIcon({ className = 'w-6 h-6' }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
}
