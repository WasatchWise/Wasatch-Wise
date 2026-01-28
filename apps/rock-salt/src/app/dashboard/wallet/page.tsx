import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import WalletBalance from '@/components/wallet/WalletBalance'
import PurchaseTokensButton from '@/components/wallet/PurchaseTokensButton'
import TransactionHistory from '@/components/wallet/TransactionHistory'

export const metadata = {
  title: 'Salt Rocks Wallet | The Rock Salt',
  description: 'Manage your Salt Rocks tokens',
}

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin?redirect=/dashboard/wallet')
  }

  const params = await searchParams
  const showSuccess = params.success === 'true'
  const showCanceled = params.canceled === 'true'

  // Get user's primary wallet (fan wallet for now)
  let { data: fanWallet } = await supabase
    .from('fan_wallets')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Create fan wallet if doesn't exist
  if (!fanWallet) {
    const { data: newWallet } = await supabase
      .from('fan_wallets')
      .insert({ user_id: user.id })
      .select()
      .single()
    fanWallet = newWallet
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Salt Rocks Wallet
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Buy, spend, and manage your Salt Rocks tokens
        </p>
      </div>

      {/* Success/Canceled Messages */}
      {showSuccess && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-semibold text-green-800 dark:text-green-200">
                Purchase successful!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your Salt Rocks have been added to your wallet.
              </p>
            </div>
          </div>
        </div>
      )}

      {showCanceled && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <p className="text-amber-800 dark:text-amber-200">
            Purchase was canceled. No charges were made.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - Balances & Purchase */}
        <div className="space-y-6">
          <Suspense fallback={<WalletSkeleton />}>
            <WalletBalance />
          </Suspense>

          {fanWallet && (
            <PurchaseTokensButton
              entityType="fan"
              entityId={fanWallet.id}
              entityName="My Fan Wallet"
            />
          )}

          {/* What can you do section */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
              What can you do with Salt Rocks?
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span>🚀</span>
                <span className="text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-white">Boost bands</strong> - Help your favorite bands climb the leaderboard
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>⭐</span>
                <span className="text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-white">Featured listings</strong> - Get your band featured on the homepage
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>🎵</span>
                <span className="text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-white">Unlock features</strong> - Add more songs, photos, and profile upgrades
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>📋</span>
                <span className="text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-white">Generate contracts</strong> - Create official booking contracts
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column - Transactions */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          {fanWallet ? (
            <TransactionHistory entityType="fan" entityId={fanWallet.id} />
          ) : (
            <p className="text-gray-500 text-center py-8">
              Setting up your wallet...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function WalletSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-32"></div>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-20"></div>
    </div>
  )
}
