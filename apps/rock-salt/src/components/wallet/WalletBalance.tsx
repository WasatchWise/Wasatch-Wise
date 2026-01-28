'use client'

import { useState, useEffect } from 'react'

interface Wallet {
  entityType: 'band' | 'venue' | 'fan'
  entityId: string
  entityName: string
  balance: number
}

interface WalletBalanceProps {
  onSelectWallet?: (wallet: Wallet) => void
  selectedWalletId?: string
}

export default function WalletBalance({ onSelectWallet, selectedWalletId }: WalletBalanceProps) {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [totalBalance, setTotalBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWallets()
  }, [])

  const fetchWallets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/salt-rocks/balance')

      if (!response.ok) {
        throw new Error('Failed to fetch wallets')
      }

      const data = await response.json()
      setWallets(data.wallets || [])
      setTotalBalance(data.totalBalance || 0)
    } catch (err) {
      console.error('Error fetching wallets:', err)
      setError('Failed to load wallets')
    } finally {
      setLoading(false)
    }
  }

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'band':
        return '🎸'
      case 'venue':
        return '🏛️'
      case 'fan':
        return '🤘'
      default:
        return '💰'
    }
  }

  const getEntityLabel = (type: string) => {
    switch (type) {
      case 'band':
        return 'Band'
      case 'venue':
        return 'Venue'
      case 'fan':
        return 'Fan Wallet'
      default:
        return 'Wallet'
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <p className="text-red-800 dark:text-red-200">{error}</p>
        <button
          onClick={fetchWallets}
          className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Total Balance Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl p-6">
        <p className="text-sm opacity-90 mb-1">Total Salt Rocks</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black">{totalBalance.toLocaleString()}</span>
          <span className="text-2xl">🧂</span>
        </div>
      </div>

      {/* Individual Wallets */}
      {wallets.length > 0 ? (
        <div className="grid gap-3">
          {wallets.map((wallet) => (
            <button
              key={wallet.entityId}
              onClick={() => onSelectWallet?.(wallet)}
              className={`w-full text-left bg-white dark:bg-gray-800 border rounded-xl p-4 transition-all hover:shadow-md ${
                selectedWalletId === wallet.entityId
                  ? 'border-amber-500 ring-2 ring-amber-500/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getEntityIcon(wallet.entityType)}</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {wallet.entityName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getEntityLabel(wallet.entityType)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {wallet.balance.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Salt Rocks</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No wallets found.</p>
          <p className="text-sm mt-1">Claim a band or venue to get started!</p>
        </div>
      )}
    </div>
  )
}
