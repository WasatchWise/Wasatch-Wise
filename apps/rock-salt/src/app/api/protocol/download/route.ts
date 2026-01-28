import { NextRequest, NextResponse } from 'next/server'
import { generateContractPDF, ContractData } from '@/lib/pdf/contract-generator'

export async function GET(request: NextRequest) {
  try {
    const blankData: ContractData = {
      bandName: '[ARTIST NAME]',
      bandCity: '[CITY]',
      bandState: '[STATE]',
      venueName: '[VENUE NAME]',
      venueCity: '[CITY]',
      venueState: '[STATE]',
      venueAddress: '[ADDRESS]',
      riderVersion: 'v2.1',
      guaranteeMin: 0,
      acceptanceDate: new Date().toISOString(),
      acceptanceId: 'TEMPLATE-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      spiderRiderId: 'TEMPLATE',
      notesFinancial: 'Standard Tiered Compensation per Section 4 applies.',
      notesTechnical: 'Subject to Exhibit A specifications.',
      notesHospitality: 'Subject to Exhibit B specifications.',
    }

    const { buffer } = await generateContractPDF(blankData)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="spider-rider-protocol-v2.1-template.pdf"',
      },
    })
  } catch (error) {
    console.error('Download template error:', error)
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    )
  }
}
