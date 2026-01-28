import { promises as fs } from 'fs';
import path from 'path';
import LegalDocument from '@/components/LegalDocument';

export const metadata = {
  title: 'Contact & Support | SLCTrips',
  description: 'Contact information and support resources for SLCTrips',
};

async function getContactContent() {
  try {
    const filePath = path.join(process.cwd(), 'legal', 'CONTACT_SUPPORT.md');
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error('Error reading Contact & Support:', error);
    return '# Contact & Support\n\nError loading content. Please email Dan@slctrips.com';
  }
}

export default async function ContactSupportPage() {
  const content = await getContactContent();

  return (
    <LegalDocument
      title="Contact & Support"
      content={content}
      lastUpdated="November 1, 2025"
    />
  );
}
