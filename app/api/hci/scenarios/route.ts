import { NextResponse } from 'next/server';
import {
  allScenarios,
  getCriticalPathScenarios,
  getAccessibilityScenarios,
} from '@/lib/hci/scenarios';

export async function GET() {
  return NextResponse.json({
    version: '1.0',
    generatedAt: new Date().toISOString(),
    scenarios: allScenarios,
    criticalPath: getCriticalPathScenarios(),
    accessibility: getAccessibilityScenarios(),
  });
}
