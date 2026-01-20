import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { generateMetadata as genMeta } from '@/lib/utils/seo';

export const metadata = genMeta({
  title: 'AI Governance for School Districts',
  description:
    'Stop worrying about AI compliance. Start building trust with parents, protecting student data, and empowering teachers—all in 90 days.',
});

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

