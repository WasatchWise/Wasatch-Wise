import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PWAInstall from "@/components/PWAInstall";
import InstallPrompt from "@/components/InstallPrompt";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import FloatingPlayer from "@/components/FloatingPlayer";
import WelcomeModal from "@/components/WelcomeModal";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "The Rock Salt | Utah Music Index",
    template: "%s | The Rock Salt"
  },
  description: "Utah music index and gig guide. Documenting bands, venues, and shows since 2002.",
  keywords: ["Utah music", "Salt Lake City music", "SLC bands", "local artists", "Utah music scene", "independent music", "live music", "regional music"],
  authors: [{ name: "The Rock Salt" }],
  creator: "The Rock Salt",
  publisher: "The Rock Salt",
  metadataBase: new URL('https://www.therocksalt.com'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Rock Salt',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.therocksalt.com',
    title: "The Rock Salt | Utah Music Index",
    description: "Utah music index and gig guide. Bands, venues, shows, and stream.",
    siteName: 'The Rock Salt',
  },
  twitter: {
    card: 'summary_large_image',
    title: "The Rock Salt | Utah Music Index",
    description: "Utah music index and gig guide.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icon-512.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-zinc-900 focus:text-white focus:rounded-md focus:font-bold focus:shadow-lg"
        >
          Skip to main content
        </a>
        <AudioPlayerProvider>
          <PWAInstall />
          <InstallPrompt />
          <WelcomeModal />

          <Header />
          <main id="main-content" className="flex-1 pb-32" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <FloatingPlayer />
        </AudioPlayerProvider>
        <GoogleAnalytics />
        <Script src="/sticky-header.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
