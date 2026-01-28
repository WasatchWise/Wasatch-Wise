#!/usr/bin/env npx tsx

/**
 * Import ConstructionWire HotelMarketData CSV into Supabase.
 *
 * Usage:
 *   npx tsx scripts/import-constructionwire-hotels.ts <csv-path> [--dry-run]
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { parse } from 'csv-parse/sync'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface CWHotelRow {
  'Hotel ID'?: string
  ProjectId?: string
  'Hotel Name'?: string
  Title?: string
  Address?: string
  LocationInfo?: string
  City?: string
  State?: string
  Zip?: string
  PostalCode?: string
  'Room Count'?: string
  RoomCount?: string
  'Rate Low'?: string
  'Rate High'?: string
  Opened?: string
  OpeningDate?: string
  Chain?: string
  Scale?: string
  'Star Rating'?: string
  Franchise?: string
  Owner?: string
  'Property Manager'?: string
  Created?: string
  SubmittedDate?: string
  Updated?: string
  UpdatedDate?: string
  Owner01CompanyName?: string
  Owner01ContactName?: string
  Owner02CompanyName?: string
  Owner02ContactName?: string
  Owner03CompanyName?: string
  Owner03ContactName?: string
  PropertyManager01CompanyName?: string
  PropertyManager01ContactName?: string
  PropertyManager02CompanyName?: string
  PropertyManager02ContactName?: string
  PropertyManager03CompanyName?: string
  PropertyManager03ContactName?: string
  HotelContact01CompanyName?: string
  HotelContact01ContactName?: string
  HotelContact02CompanyName?: string
  HotelContact02ContactName?: string
  HotelContact03CompanyName?: string
  HotelContact03ContactName?: string
}

function parseCurrency(value?: string): number | null {
  if (!value) return null
  const cleaned = value.replace(/[$,]/g, '').trim()
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

function parseInteger(value?: string): number | null {
  if (!value) return null
  const parsed = parseInt(value.replace(/[^0-9]/g, ''), 10)
  return Number.isFinite(parsed) ? parsed : null
}

function parseDate(value?: string): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null

  // ISO format already
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed
  }

  // M/D/YYYY
  const mdY = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (mdY) {
    const [, month, day, year] = mdY
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  // M/YYYY
  const mY = trimmed.match(/^(\d{1,2})\/(\d{4})$/)
  if (mY) {
    const [, month, year] = mY
    return `${year}-${String(month).padStart(2, '0')}-01`
  }

  // Q#/YYYY
  const qY = trimmed.match(/^Q([1-4])\/(\d{4})$/i)
  if (qY) {
    const quarter = parseInt(qY[1], 10)
    const year = qY[2]
    const month = (quarter - 1) * 3 + 1
    return `${year}-${String(month).padStart(2, '0')}-01`
  }

  // YYYY
  const y = trimmed.match(/^(\d{4})$/)
  if (y) {
    return `${y[1]}-01-01`
  }

  return null
}

function getField(row: CWHotelRow, ...keys: Array<keyof CWHotelRow>): string | undefined {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'string' && value.trim().length) {
      return value
    }
  }
  return undefined
}

function splitContactInfo(contactInfo: string): { name: string | null; company: string | null } {
  const trimmed = contactInfo.trim()
  if (!trimmed) return { name: null, company: null }

  const parts = trimmed.split(' - ')
  if (parts.length >= 2) {
    return {
      name: parts[0]?.trim() || null,
      company: parts.slice(1).join(' - ').trim() || null
    }
  }

  return { name: null, company: trimmed }
}

function getContactEntries(
  row: CWHotelRow,
  prefix: 'Owner' | 'PropertyManager' | 'HotelContact',
  max: number
): Array<{ name: string | null; company: string | null }> {
  const entries: Array<{ name: string | null; company: string | null }> = []

  for (let index = 1; index <= max; index += 1) {
    const companyKey = `${prefix}${String(index).padStart(2, '0')}CompanyName` as keyof CWHotelRow
    const nameKey = `${prefix}${String(index).padStart(2, '0')}ContactName` as keyof CWHotelRow
    const company = row[companyKey]?.toString().trim() || null
    const name = row[nameKey]?.toString().trim() || null

    if (!company && !name) {
      continue
    }

    entries.push({ name, company })
  }

  return entries
}

async function upsertContact(
  hotelId: string,
  contactInfo: string,
  role: string,
  dryRun: boolean
) {
  const { name, company } = splitContactInfo(contactInfo)
  if (!name && !company) return

  if (dryRun) {
    return
  }

  const { data: contact, error: contactError } = await supabase
    .from('construction_contacts')
    .upsert(
      {
        name,
        company,
        role
      },
      { onConflict: 'name,company,role' }
    )
    .select('id')
    .single()

  if (contactError || !contact) {
    console.error(`Contact upsert error (${role}):`, contactError?.message || 'Unknown error')
    return
  }

  const { error: linkError } = await supabase
    .from('construction_hotel_contacts')
    .upsert({
      hotel_id: hotelId,
      contact_id: contact.id,
      role_on_hotel: role
    })

  if (linkError) {
    console.error(`Contact link error (${role}):`, linkError.message)
  }
}

async function importCWData(csvPath: string, dryRun: boolean) {
  console.log('═'.repeat(60))
  console.log('  IMPORTING CONSTRUCTIONWIRE HOTELS')
  console.log('═'.repeat(60))
  console.log('')
  console.log('File:', csvPath)
  console.log('Mode:', dryRun ? 'DRY RUN' : 'LIVE')
  console.log('')

  if (!existsSync(csvPath)) {
    console.error('File not found:', csvPath)
    process.exit(1)
  }

  const fileContent = readFileSync(csvPath, 'utf-8')
  const records: CWHotelRow[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  })

  let hotelsUpserted = 0
  let hotelErrors = 0
  let contactsProcessed = 0

  for (const row of records) {
    const cwHotelId = getField(row, 'Hotel ID', 'ProjectId')
    const hotelName = getField(row, 'Hotel Name', 'Title')

    if (!cwHotelId || !hotelName) {
      continue
    }

    const payload = {
      cw_hotel_id: cwHotelId,
      name: hotelName,
      address: getField(row, 'Address', 'LocationInfo') || null,
      city: row.City || null,
      state: row.State || null,
      zip: getField(row, 'Zip', 'PostalCode') || null,
      room_count: parseInteger(getField(row, 'Room Count', 'RoomCount')),
      rate_low: parseCurrency(getField(row, 'Rate Low')),
      rate_high: parseCurrency(getField(row, 'Rate High')),
      opened_date: parseDate(getField(row, 'Opened', 'OpeningDate')),
      chain: row.Chain || null,
      scale: row.Scale || null,
      star_rating: parseInteger(getField(row, 'Star Rating')),
      franchise: row.Franchise || null,
      cw_created_at: parseDate(getField(row, 'Created', 'SubmittedDate')),
      cw_updated_at: parseDate(getField(row, 'Updated', 'UpdatedDate')),
      updated_at: new Date().toISOString()
    }

    if (dryRun) {
      hotelsUpserted++
      continue
    }

    const { data: hotel, error: hotelError } = await supabase
      .from('construction_hotels')
      .upsert(payload, { onConflict: 'cw_hotel_id' })
      .select('id')
      .single()

    if (hotelError || !hotel) {
      console.error('Hotel upsert error:', hotelError?.message || 'Unknown error')
      hotelErrors++
      continue
    }

    hotelsUpserted++

    if (row.Owner) {
      contactsProcessed++
      await upsertContact(hotel.id, row.Owner, 'Owner', dryRun)
    }

    if (row['Property Manager']) {
      contactsProcessed++
      await upsertContact(hotel.id, row['Property Manager'], 'Property Manager', dryRun)
    }

    const ownerEntries = getContactEntries(row, 'Owner', 3)
    for (const entry of ownerEntries) {
      if (!entry.company && !entry.name) continue
      contactsProcessed++
      await upsertContact(
        hotel.id,
        [entry.name, entry.company].filter(Boolean).join(' - '),
        'Owner',
        dryRun
      )
    }

    const managerEntries = getContactEntries(row, 'PropertyManager', 3)
    for (const entry of managerEntries) {
      if (!entry.company && !entry.name) continue
      contactsProcessed++
      await upsertContact(
        hotel.id,
        [entry.name, entry.company].filter(Boolean).join(' - '),
        'Property Manager',
        dryRun
      )
    }

    const hotelContactEntries = getContactEntries(row, 'HotelContact', 3)
    for (const entry of hotelContactEntries) {
      if (!entry.company && !entry.name) continue
      contactsProcessed++
      await upsertContact(
        hotel.id,
        [entry.name, entry.company].filter(Boolean).join(' - '),
        'Hotel Contact',
        dryRun
      )
    }
  }

  console.log('')
  console.log('═'.repeat(60))
  console.log('IMPORT RESULTS')
  console.log('═'.repeat(60))
  console.log('')
  console.log('  Hotels upserted:', hotelsUpserted)
  console.log('  Hotel errors:', hotelErrors)
  console.log('  Contacts processed:', contactsProcessed)
  console.log('')
}

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const csvPath = args.find(arg => !arg.startsWith('--'))

if (!csvPath) {
  console.error('Usage: npx tsx scripts/import-constructionwire-hotels.ts <csv-path> [--dry-run]')
  process.exit(1)
}

importCWData(csvPath, dryRun).catch(error => {
  console.error('Import failed:', error)
  process.exit(1)
})
