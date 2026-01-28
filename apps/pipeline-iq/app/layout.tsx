import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt'
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration'
import { IOSOptimizer } from '@/components/ios/IOSOptimizer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GrooveLeads - Construction Project Intelligence',
  description: 'Discover and qualify high-value construction projects',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GrooveLeads',
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover' as const,
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GrooveLeads" />
      </head>
      <body className={inter.className}>
        {children}
        <PWAInstallPrompt />
        <ServiceWorkerRegistration />
        <IOSOptimizer />
      </body>
    </html>
  )
}

