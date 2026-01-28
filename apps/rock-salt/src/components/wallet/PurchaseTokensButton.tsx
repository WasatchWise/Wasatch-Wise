'use client'

import { useState } from 'react'
import { TOKEN_PACKAGES, TokenPackage } from '@/lib/validations/wallet'

interface PurchaseTokensButtonProps {
  entityType: 'band' | 'venue' | 'fan'
  entityId: string
  entityName: string
  onSuccess?: () => void
}

export default function PurchaseTokensButton({
  entityType,
  entityId,
  entityName,
  onSuccess,
}: PurchaseTokensButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(null)

  const handlePurchase = async () => {
    if (!selectedPackage) return

    setLoading(true)
    try {
      const response = await fetch('/api/salt-rocks/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          entityType,
          entityId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create checkout')
      }

      const { url } = await response.json()

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Failed to start purchase. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        Buy Salt Rocks
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Buy Salt Rocks
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Adding Salt Rocks to: <strong>{entityName}</strong>
              </p>
            </div>

            {/* Packages */}
            <div className="p-6 space-y-3">
              {TOKEN_PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedPackage?.id === pkg.id
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">
                        {pkg.tokens} Salt Rocks
                      </p>
                      {pkg.bonusPercentage > 0 && (
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                          +{pkg.bonusPercentage}% bonus!
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-gray-900 dark:text-white">
                        ${(pkg.priceInCents / 100).toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-500">
                        ${((pkg.priceInCents / 100) / pkg.tokens * 100).toFixed(1)}¢/rock
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handlePurchase}
                disabled={!selectedPackage || loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : selectedPackage
                  ? `Buy ${selectedPackage.tokens} Salt Rocks for $${(selectedPackage.priceInCents / 100).toFixed(0)}`
                  : 'Select a package'}
              </button>
              <p className="text-xs text-center text-gray-500 mt-3">
                Secure checkout powered by Stripe
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
