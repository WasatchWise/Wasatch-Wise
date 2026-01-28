import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer'
import crypto from 'crypto'

// Styles for the contract
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    width: '40%',
    color: '#666',
  },
  value: {
    width: '60%',
    fontWeight: 'bold',
  },
  paragraph: {
    marginBottom: 10,
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
  },
  signature: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBlock: {
    width: '45%',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 50,
    paddingTop: 5,
  },
  hash: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    fontSize: 8,
  },
})

export interface ContractData {
  // Band info
  bandName: string
  bandCity?: string
  bandState?: string

  // Venue info
  venueName: string
  venueCity?: string
  venueState?: string
  venueAddress?: string

  // Spider Rider details
  riderVersion: string
  guaranteeMin: number
  guaranteeMax?: number
  doorSplitPercentage?: number
  merchSplitToVenuePercentage?: number

  // Technical
  minStageWidth?: number
  minStageDepth?: number
  minInputChannels?: number
  requiresHouseDrums?: boolean

  // Hospitality
  mealBuyoutAmount?: number
  drinkTicketsCount?: number
  guestListAllocation?: number
  greenRoomRequirements?: string

  // Notes
  notesFinancial?: string
  notesTechnical?: string
  notesHospitality?: string
  venueNotes?: string

  // Meta
  acceptanceDate: string
  acceptanceId: string
  spiderRiderId: string
}

function formatCurrency(cents: number | undefined | null): string {
  if (!cents) return 'N/A'
  return `$${(cents / 100).toLocaleString()}`
}

function ContractDocument({ data, hash }: { data: ContractData; hash: string }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Performance Agreement</Text>
          <Text style={styles.subtitle}>Spider Rider Contract</Text>
          <Text style={{ fontSize: 10, color: '#666' }}>
            Generated via TheRockSalt.com
          </Text>
        </View>

        {/* Parties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parties</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Artist/Band:</Text>
            <Text style={styles.value}>{data.bandName}</Text>
          </View>
          {data.bandCity && (
            <View style={styles.row}>
              <Text style={styles.label}>Artist Location:</Text>
              <Text style={styles.value}>
                {data.bandCity}{data.bandState ? `, ${data.bandState}` : ''}
              </Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Venue:</Text>
            <Text style={styles.value}>{data.venueName}</Text>
          </View>
          {data.venueCity && (
            <View style={styles.row}>
              <Text style={styles.label}>Venue Location:</Text>
              <Text style={styles.value}>
                {data.venueCity}{data.venueState ? `, ${data.venueState}` : ''}
              </Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Agreement Date:</Text>
            <Text style={styles.value}>
              {new Date(data.acceptanceDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Spider Rider Version:</Text>
            <Text style={styles.value}>{data.riderVersion}</Text>
          </View>
        </View>

        {/* Financial Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Terms</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Guarantee:</Text>
            <Text style={styles.value}>
              {formatCurrency(data.guaranteeMin)}
              {data.guaranteeMax && data.guaranteeMax !== data.guaranteeMin
                ? ` - ${formatCurrency(data.guaranteeMax)}`
                : ''}
            </Text>
          </View>
          {data.doorSplitPercentage && (
            <View style={styles.row}>
              <Text style={styles.label}>Door Split:</Text>
              <Text style={styles.value}>{data.doorSplitPercentage}% to Artist</Text>
            </View>
          )}
          {data.merchSplitToVenuePercentage && (
            <View style={styles.row}>
              <Text style={styles.label}>Merch Commission:</Text>
              <Text style={styles.value}>{data.merchSplitToVenuePercentage}% to Venue</Text>
            </View>
          )}
          {data.notesFinancial && (
            <Text style={styles.paragraph}>{data.notesFinancial}</Text>
          )}
        </View>

        {/* Technical Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Requirements</Text>
          {(data.minStageWidth || data.minStageDepth) && (
            <View style={styles.row}>
              <Text style={styles.label}>Minimum Stage Size:</Text>
              <Text style={styles.value}>
                {data.minStageWidth || '?'}' x {data.minStageDepth || '?'}'
              </Text>
            </View>
          )}
          {data.minInputChannels && (
            <View style={styles.row}>
              <Text style={styles.label}>Minimum Input Channels:</Text>
              <Text style={styles.value}>{data.minInputChannels}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>House Drums Required:</Text>
            <Text style={styles.value}>{data.requiresHouseDrums ? 'Yes' : 'No'}</Text>
          </View>
          {data.notesTechnical && (
            <Text style={styles.paragraph}>{data.notesTechnical}</Text>
          )}
        </View>

        {/* Hospitality */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hospitality</Text>
          {data.mealBuyoutAmount && (
            <View style={styles.row}>
              <Text style={styles.label}>Meal Buyout:</Text>
              <Text style={styles.value}>{formatCurrency(data.mealBuyoutAmount)} per person</Text>
            </View>
          )}
          {data.drinkTicketsCount && (
            <View style={styles.row}>
              <Text style={styles.label}>Drink Tickets:</Text>
              <Text style={styles.value}>{data.drinkTicketsCount}</Text>
            </View>
          )}
          {data.guestListAllocation && (
            <View style={styles.row}>
              <Text style={styles.label}>Guest List:</Text>
              <Text style={styles.value}>{data.guestListAllocation} spots</Text>
            </View>
          )}
          {data.greenRoomRequirements && (
            <View style={styles.row}>
              <Text style={styles.label}>Green Room:</Text>
              <Text style={styles.value}>{data.greenRoomRequirements}</Text>
            </View>
          )}
          {data.notesHospitality && (
            <Text style={styles.paragraph}>{data.notesHospitality}</Text>
          )}
        </View>

        {/* Venue Notes */}
        {data.venueNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Venue Notes</Text>
            <Text style={styles.paragraph}>{data.venueNotes}</Text>
          </View>
        )}

        {/* Verification */}
        <View style={styles.hash}>
          <Text>Contract Hash (SHA-256): {hash}</Text>
          <Text>Acceptance ID: {data.acceptanceId}</Text>
          <Text>Spider Rider ID: {data.spiderRiderId}</Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This contract was generated by TheRockSalt.com Spider Rider system.
          Verify this document at therocksalt.com/verify/{data.acceptanceId}
        </Text>
      </Page>
    </Document>
  )
}

export async function generateContractPDF(data: ContractData): Promise<{
  buffer: Buffer
  hash: string
}> {
  // Create hash from contract data for verification
  const dataString = JSON.stringify(data)
  const hash = crypto.createHash('sha256').update(dataString).digest('hex')

  // Generate PDF
  const buffer = await renderToBuffer(
    <ContractDocument data={data} hash={hash} />
  )

  return {
    buffer: Buffer.from(buffer),
    hash,
  }
}

export function generateContractFilename(
  bandName: string,
  venueName: string,
  acceptanceId: string
): string {
  const sanitize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30)

  return `contract-${sanitize(bandName)}-${sanitize(venueName)}-${acceptanceId.slice(0, 8)}.pdf`
}
