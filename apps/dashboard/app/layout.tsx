import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { getOrganizationSchema } from '@/lib/utils/seo';

export const metadata: Metadata = {
  title: {
    default: "WasatchWise | AI Governance for K-12 School Districts",
    template: "%s | WasatchWise",
  },
  description:
    "Stop worrying about AI compliance. Start building trust with parents, protecting student data, and empowering teachers—all in 90 days. Expert AI governance consulting for K-12 districts.",
  keywords: [
    "AI governance",
    "K-12",
    "school district AI policy",
    "FERPA compliance",
    "student data privacy",
    "teacher AI training",
    "shadow AI",
    "education technology compliance",
    "AI readiness assessment",
    "school AI governance consultant",
  ],
  authors: [{ name: "John Lyman", url: "https://www.wasatchwise.com" }],
  creator: "WasatchWise",
  publisher: "WasatchWise",
  metadataBase: new URL("https://www.wasatchwise.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.wasatchwise.com",
    siteName: "WasatchWise",
    title: "WasatchWise | AI Governance for K-12 School Districts",
    description:
      "Expert AI governance consulting for K-12 districts. Policy, training, and compliance in 90 days.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WasatchWise - AI Governance for School Districts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WasatchWise | AI Governance for K-12 School Districts",
    description:
      "Expert AI governance consulting for K-12 districts. Policy, training, and compliance in 90 days.",
    creator: "@wasatchwise",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = getOrganizationSchema();

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body className="font-sans bg-white text-gray-900 antialiased">
        {children}
        <GoogleAnalytics />
        <Analytics mode={'production'} />
      </body>
    </html>
  );
}

