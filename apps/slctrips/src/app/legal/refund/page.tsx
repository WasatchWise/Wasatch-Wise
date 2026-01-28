import { promises as fs } from 'fs';
import path from 'path';
import LegalDocument from '@/components/LegalDocument';

export const metadata = {
  title: 'Refund Policy | SLCTrips',
  description: 'Refund Policy for SLCTrips TripKit purchases',
};

async function getRefundContent() {
  try {
    const filePath = path.join(process.cwd(), 'legal', 'REFUND_POLICY.md');
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error('Error reading Refund Policy:', error);
    return '# Refund Policy\n\nError loading content. Please contact Dan@slctrips.com';
  }
}

export default async function RefundPolicyPage() {
  const content = await getRefundContent();

  return (
    <LegalDocument
      title="Refund Policy"
      content={content}
      lastUpdated="November 1, 2025"
    />
  );
}
