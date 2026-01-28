import { promises as fs } from 'fs';
import path from 'path';
import LegalDocument from '@/components/LegalDocument';

export const metadata = {
  title: 'Terms of Service | SLCTrips',
  description: 'Terms of Service for SLCTrips - Utah travel planning and TripKit platform',
};

async function getTermsContent() {
  try {
    const filePath = path.join(process.cwd(), 'legal', 'TERMS_OF_SERVICE.md');
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error('Error reading Terms of Service:', error);
    return '# Terms of Service\n\nError loading content. Please contact Dan@slctrips.com';
  }
}

export default async function TermsOfServicePage() {
  const content = await getTermsContent();

  return (
    <LegalDocument
      title="Terms of Service"
      content={content}
      lastUpdated="November 1, 2025"
    />
  );
}
