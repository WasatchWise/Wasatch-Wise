import { promises as fs } from 'fs';
import path from 'path';
import LegalDocument from '@/components/LegalDocument';

export const metadata = {
  title: 'Privacy Policy | SLCTrips',
  description: 'Privacy Policy for SLCTrips - How we protect and use your data',
};

async function getPrivacyContent() {
  try {
    const filePath = path.join(process.cwd(), 'legal', 'PRIVACY_POLICY.md');
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error('Error reading Privacy Policy:', error);
    return '# Privacy Policy\n\nError loading content. Please contact Dan@slctrips.com';
  }
}

export default async function PrivacyPolicyPage() {
  const content = await getPrivacyContent();

  return (
    <LegalDocument
      title="Privacy Policy"
      content={content}
      lastUpdated="November 1, 2025"
    />
  );
}
