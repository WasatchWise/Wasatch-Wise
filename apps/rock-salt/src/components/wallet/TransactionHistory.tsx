'use client'

import { useState, useEffect } from 'react'

interface Transaction {
  id: string
  amount: number
  balance_after: number
  transaction_type: string
  description: string | null
  created_at: string
}

interface TransactionHistoryProps {
  entityType: 'band' | 'venue' | 'fan'
  entityId: string
}

export default function TransactionHistory({ entityType, entityId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [entityType, entityId])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/salt-rocks/balance?entityType=${entityType}&entityId=${entityId}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }

      const data = await response.json()
      setTransactions(data.recentTransactions || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTransactionType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .replace(/^spend /, '')
      .replace(/^earn /, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getTransactionIcon = (type: string, amount: number) => {
    if (amount > 0) {
      return '🟢'
    }
    if (type.includes('boost')) return '🚀'
    if (type.includes('upgrade')) return '⬆️'
    if (type.includes('featured')) return '⭐'
    return '🔴'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No transactions yet.</p>
        <p className="text-sm mt-1">Your transaction history will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        Recent Transactions
      </h3>
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">
              {getTransactionIcon(tx.transaction_type, tx.amount)}
            </span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {tx.description || formatTransactionType(tx.transaction_type)}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(tx.created_at)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-bold ${
              tx.amount > 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {tx.amount > 0 ? '+' : ''}{tx.amount}
            </p>
            <p className="text-xs text-gray-500">
              Bal: {tx.balance_after}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
