import { Header } from '@/components/layout/Header'
import { GodModeProvider } from '@/lib/context/GodModeContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <GodModeProvider>
      <div className="flex h-screen flex-col overflow-hidden safe-area-inset">
        {/* Header with Navigation */}
        <Header />
        
        {/* Main content - optimized for iPhone 14 Pro */}
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 ios-scroll">
          {children}
        </main>
      </div>
    </GodModeProvider>
  )
}
