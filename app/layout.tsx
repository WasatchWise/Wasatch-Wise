import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WasatchWise | AI Governance for School Districts",
  description:
    "Stop worrying about AI compliance. Start building trust with parents, protecting student data, and empowering teachers—all in 90 days.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}

