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

// Styles matching contract-generator.tsx
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
  hash: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    fontSize: 8,
  },
})

export interface RiderPDFData {
  bandName: string
  bandCity?: string
  bandState?: string
  riderCode: string
  riderVersion: string
  publishedAt: string

  // Financial (cents)
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
  mealBuyoutAmount?: number // cents
  drinkTicketsCount?: number
  guestListAllocation?: number
  greenRoomRequirements?: string

  // Notes
  notesFinancial?: string
  notesTechnical?: string
  notesHospitality?: string
  notesBusiness?: string

  ageRestriction?: string

  // Meta
  riderId: string
}

function formatCurrency(cents: number | undefined | null): string {
  if (cents === undefined || cents === null) return 'N/A'
  return `$${(cents / 100).toLocaleString()}`
}

function RiderDocument({ data, hash }: { data: RiderPDFData; hash: string }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Spider Rider</Text>
          <Text style={styles.subtitle}>Master Tour Rider Agreement</Text>
          <Text style={{ fontSize: 10, color: '#666' }}>
            Generated via TheRockSalt.com · Protocol SPIDER-v2.1
          </Text>
        </View>

        {/* Band & Rider Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Artist / Rider</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Band:</Text>
            <Text style={styles.value}>{data.bandName}</Text>
          </View>
          {(data.bandCity || data.bandState) && (
            <View style={styles.row}>
              <Text style={styles.label}>Location:</Text>
              <Text style={styles.value}>
                {[data.bandCity, data.bandState].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Rider Code:</Text>
            <Text style={styles.value}>{data.riderCode}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Version:</Text>
            <Text style={styles.value}>{data.riderVersion}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Published:</Text>
            <Text style={styles.value}>
              {new Date(data.publishedAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Financial Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Terms</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Guarantee Range:</Text>
            <Text style={styles.value}>
              {formatCurrency(data.guaranteeMin)}
              {data.guaranteeMax && data.guaranteeMax !== data.guaranteeMin
                ? ` - ${formatCurrency(data.guaranteeMax)}`
                : ''}
            </Text>
          </View>
          {data.doorSplitPercentage != null && (
            <View style={styles.row}>
              <Text style={styles.label}>Door Split:</Text>
              <Text style={styles.value}>{data.doorSplitPercentage}% to Artist</Text>
            </View>
          )}
          {data.merchSplitToVenuePercentage != null && (
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
          {data.minInputChannels != null && (
            <View style={styles.row}>
              <Text style={styles.label}>Minimum Input Channels:</Text>
              <Text style={styles.value}>{data.minInputChannels}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>House Drums Required:</Text>
            <Text style={styles.value}>{data.requiresHouseDrums ? 'Yes' : 'No'}</Text>
          </View>
          {data.ageRestriction && (
            <View style={styles.row}>
              <Text style={styles.label}>Age Restriction:</Text>
              <Text style={styles.value}>{data.ageRestriction}</Text>
            </View>
          )}
          {data.notesTechnical && (
            <Text style={styles.paragraph}>{data.notesTechnical}</Text>
          )}
        </View>

        {/* Hospitality */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hospitality</Text>
          {data.mealBuyoutAmount != null && (
            <View style={styles.row}>
              <Text style={styles.label}>Meal Buyout:</Text>
              <Text style={styles.value}>{formatCurrency(data.mealBuyoutAmount)} per person</Text>
            </View>
          )}
          {data.drinkTicketsCount != null && (
            <View style={styles.row}>
              <Text style={styles.label}>Drink Tickets:</Text>
              <Text style={styles.value}>{data.drinkTicketsCount}</Text>
            </View>
          )}
          {data.guestListAllocation != null && (
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

        {data.notesBusiness && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Terms</Text>
            <Text style={styles.paragraph}>{data.notesBusiness}</Text>
          </View>
        )}

        {/* Verification Hash */}
        <View style={styles.hash}>
          <Text>Rider Hash (SHA-256): {hash}</Text>
          <Text>Rider ID: {data.riderId}</Text>
          <Text>Rider Code: {data.riderCode}</Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This Spider Rider was generated by TheRockSalt.com Spider Network.
          View and accept at therocksalt.com/book/spider-riders/{data.riderId}
        </Text>
      </Page>
    </Document>
  )
}

export async function generateRiderPDF(data: RiderPDFData): Promise<{
  buffer: Buffer
  hash: string
}> {
  // Hash before including hash in document (hash of data + placeholder)
  const dataString = JSON.stringify({ ...data, hash: 'PLACEHOLDER' })
  const hash = crypto.createHash('sha256').update(dataString).digest('hex')

  const buffer = await renderToBuffer(
    <RiderDocument data={data} hash={hash} />
  )

  return {
    buffer: Buffer.from(buffer),
    hash,
  }
}

export function generateRiderFilename(riderCode: string, riderId: string): string {
  const sanitize = (str: string) =>
    str
      .replace(/[^a-zA-Z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30)
  return `spider-rider-${sanitize(riderCode)}-${riderId.slice(0, 8)}.pdf`
}
