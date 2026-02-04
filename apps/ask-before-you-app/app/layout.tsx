import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';
import { WhoAreYouModal } from '@/components/WhoAreYouModal';

export const metadata: Metadata = {
  title: "Ask Before You App | Student Data Privacy Campaign",
  description:
    "Before you download that app—ask. National awareness campaign for K-12 student data privacy. Learn, get certified, and find your state's resources.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-white text-gray-900 antialiased">
        {children}
        <WhoAreYouModal />
        <Analytics mode={'production'} />
      </body>
    </html>
  );
}

