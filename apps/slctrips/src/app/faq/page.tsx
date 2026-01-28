import { promises as fs } from 'fs';
import path from 'path';
import LegalDocument from '@/components/LegalDocument';

export const metadata = {
  title: 'Frequently Asked Questions (FAQ) | SLCTrips',
  description: 'Common questions about SLCTrips, TripKits, purchases, access codes, and more. Find answers to your questions here.',
};

async function getFAQContent() {
  try {
    const filePath = path.join(process.cwd(), 'legal', 'FAQ.md');
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error('Error reading FAQ:', error);
    return '# Frequently Asked Questions\n\nError loading content. Please email Dan@slctrips.com for assistance.';
  }
}

export default async function FAQPage() {
  const content = await getFAQContent();

  return (
    <LegalDocument
      title="Frequently Asked Questions"
      content={content}
      lastUpdated="November 2025"
    />
  );
}

