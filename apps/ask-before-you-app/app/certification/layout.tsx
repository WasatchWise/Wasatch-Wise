import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NDPA Certification | Ask Before You App',
  description: 'Master the National Data Privacy Agreement in 50 minutes. Earn your SDPC certification.',
}

export default function CertificationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
