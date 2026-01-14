/**
 * USPA Agreement Hub Data Import
 * 
 * Imports vendor/product data from USPA Agreement Hub CSV files:
 * - Dynamic Menu: Vendor/product agreements with districts
 * - Negotiation Tracker: Active negotiations
 */

import { createClient } from '@supabase/supabase-js';
import { findOrCreateVendor } from './vdfm';
import { normalizeDistrictName } from './district-normalizer';

/**
 * Create Supabase client for CLI scripts (direct connection, no cookies)
 */
function createDirectClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  // Try multiple possible env var names for service key
  const supabaseKey = 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE; // From your .env.local
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      `Missing Supabase credentials. Need:\n` +
      `  - SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL\n` +
      `  - SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY or SUPABASE_SERVICE\n` +
      `Found: URL=${!!supabaseUrl}, KEY=${!!supabaseKey}`
    );
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

interface USPAVendorRow {
  Company: string;
  Product: string;
  Originator: string;
  Type: string;
  Status: string;
  'Expiration Notes': string;
  'Date Approved': string;
  'Expires on': string;
}

interface NegotiationRow {
  'Your District/Charter': string;
  'Vendor/Company Name': string;
  'Product Name': string;
  'Current Agreement Status': string;
  'Negotiation Status': string;
  'Date Vendor Contacted': string;
  'Notes:': string;
  'Most Recent Update': string;
}

/**
 * Parse CSV file and return rows
 */
function parseCSV(content: string): string[][] {
  const lines = content.split('\n').filter(line => line.trim());
  const rows: string[][] = [];
  
  for (const line of lines) {
    // Handle quoted fields with commas
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          currentField += '"';
          i++;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        fields.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    
    // Add last field
    fields.push(currentField.trim());
    rows.push(fields);
  }
  
  return rows;
}

// normalizeDistrictName is now imported from district-normalizer

/**
 * Find or create district by name
 */
async function findOrCreateDistrict(
  supabase: ReturnType<typeof createDirectClient>,
  districtName: string,
  state: string = 'UT'
): Promise<string | null> {
  // Try exact match first
  let { data, error } = await supabase
    .from('districts')
    .select('id')
    .eq('name', districtName)
    .eq('state', state)
    .single();
  
  if (data && !error) {
    return data.id;
  }
  
  // Try case-insensitive match
  const { data: caseInsensitive } = await supabase
    .from('districts')
    .select('id')
    .ilike('name', districtName)
    .eq('state', state)
    .limit(1)
    .single();
  
  if (caseInsensitive) {
    return caseInsensitive.id;
  }
  
  // Create new district (shouldn't happen if all LEAs are seeded)
  const { data: newDistrict, error: createError } = await supabase
    .from('districts')
    .insert({
      name: districtName,
      state,
      size_band: 'medium', // Default, can be updated later
      contacts: {},
      metadata: {
        imported_from: 'uspa_agreement_hub',
        original_name: districtName,
      },
    })
    .select('id')
    .single();
  
  if (createError || !newDistrict) {
    console.error(`Failed to create district ${districtName}:`, createError);
    return null;
  }
  
  return newDistrict.id;
}

/**
 * Determine risk level from agreement status
 */
function calculateRiskFromStatus(status: string, expirationNotes: string): 'low' | 'medium' | 'high' | 'critical' {
  const statusLower = status.toLowerCase();
  const notesLower = expirationNotes.toLowerCase();
  
  if (statusLower === 'inactive' || notesLower.includes('seek new agreement')) {
    return 'high';
  }
  
  if (statusLower === 'needs attention' || notesLower.includes('date error')) {
    return 'medium';
  }
  
  if (statusLower === 'active') {
    return 'low';
  }
  
  return 'medium';
}

/**
 * Determine AI usage level from product type
 */
function inferAIUsageLevel(productName: string, companyName: string): 'none' | 'embedded' | 'teacher_used' | 'student_facing' {
  const combined = `${productName} ${companyName}`.toLowerCase();
  
  // Keywords that suggest AI
  const aiKeywords = [
    'ai', 'artificial intelligence', 'machine learning', 'ml',
    'adaptive', 'personalized', 'recommendation', 'chatbot',
    'claude', 'gpt', 'openai', 'anthropic'
  ];
  
  const hasAI = aiKeywords.some(keyword => combined.includes(keyword));
  
  if (!hasAI) {
    return 'none';
  }
  
  // Student-facing AI tools
  if (combined.includes('student') || combined.includes('learner')) {
    return 'student_facing';
  }
  
  // Teacher tools
  if (combined.includes('teacher') || combined.includes('educator')) {
    return 'teacher_used';
  }
  
  // Default to embedded
  return 'embedded';
}

/**
 * Parse date string (handles various formats)
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === 'None' || dateStr.trim() === '') {
    return null;
  }
  
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Import Dynamic Menu CSV
 */
export async function importDynamicMenu(
  csvContent: string,
  supabaseClient?: ReturnType<typeof createDirectClient>
): Promise<{
  vendorsCreated: number;
  districtVendorsCreated: number;
  errors: string[];
}> {
  const supabase = supabaseClient || createDirectClient();
  const rows = parseCSV(csvContent);
  
  if (rows.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }
  
  const headers = rows[0];
  const dataRows = rows.slice(1);
  
  // Map headers to indices
  const headerMap: Record<string, number> = {};
  headers.forEach((header, index) => {
    headerMap[header.trim()] = index;
  });
  
  const vendorsCreated = new Set<string>();
  const districtVendorsCreated: string[] = [];
  const errors: string[] = [];
  
  let processed = 0;
  const totalRows = dataRows.length;
  
  for (const row of dataRows) {
    processed++;
    if (processed % 50 === 0) {
      console.log(`Processing row ${processed}/${totalRows}...`);
    }
    
    try {
      if (row.length < headers.length) {
        continue; // Skip incomplete rows
      }
      
      const company = row[headerMap['Company']]?.trim();
      const product = row[headerMap['Product']]?.trim();
      const originator = row[headerMap['Originator']]?.trim();
      const type = row[headerMap['Type']]?.trim();
      const status = row[headerMap['Status']]?.trim();
      const expirationNotes = row[headerMap['Expiration Notes']]?.trim() || '';
      const dateApproved = row[headerMap['Date Approved']]?.trim();
      const expiresOn = row[headerMap['Expires on']]?.trim();
      
      if (!company || !product) {
        continue; // Skip rows without essential data
      }
      
      // Skip statewide/system agreements (handled separately)
      if (originator === 'USBE STATEWIDE' || 
          originator === 'UEN Statewide' || 
          originator === 'STEM Action Center') {
        continue;
      }
      
      // Find or create vendor (using direct client)
      const vendor = await findOrCreateVendorDirect(supabase, company, inferCategoryFromType(type) || undefined);
      const vendorId = vendor.id;
      
      if (!vendorId) {
        errors.push(`Failed to create vendor: ${company}`);
        continue;
      }
      
      vendorsCreated.add(vendorId);
      
      // Normalize district name to official LEA name
      const officialDistrictName = normalizeDistrictName(originator);
      if (!officialDistrictName) {
        // Skip if we can't normalize (e.g., statewide agreements)
        continue;
      }
      
      // Find or create district
      const districtId = await findOrCreateDistrict(supabase, officialDistrictName);
      
      if (!districtId) {
        errors.push(`Failed to find/create district: ${originator}`);
        continue;
      }
      
      // Check if district-vendor relationship already exists
      const { data: existing } = await supabase
        .from('district_vendors')
        .select('id')
        .eq('district_id', districtId)
        .eq('vendor_id', vendorId)
        .single();
      
      if (existing) {
        // Update existing relationship
        const riskLevel = calculateRiskFromStatus(status, expirationNotes);
        const aiUsageLevel = inferAIUsageLevel(product, company);
        
        await supabase
          .from('district_vendors')
          .update({
            risk_level: riskLevel,
            ai_usage_level: aiUsageLevel,
            notes: `Product: ${product}\nStatus: ${status}\nType: ${type}\n${expirationNotes ? `Notes: ${expirationNotes}` : ''}`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        
        districtVendorsCreated.push(existing.id);
      } else {
        // Create new relationship
        const riskLevel = calculateRiskFromStatus(status, expirationNotes);
        const aiUsageLevel = inferAIUsageLevel(product, company);
        
        const { data: newRel, error: relError } = await supabase
          .from('district_vendors')
          .insert({
            district_id: districtId,
            vendor_id: vendorId,
            data_types: [], // Would need to parse from Exhibit B
            ai_usage_level: aiUsageLevel,
            risk_level: riskLevel,
            notes: `Product: ${product}\nStatus: ${status}\nType: ${type}\nOriginator: ${originator}\n${expirationNotes ? `Notes: ${expirationNotes}` : ''}`,
          })
          .select('id')
          .single();
        
        if (relError || !newRel) {
          errors.push(`Failed to create district-vendor relationship: ${company} - ${originator}`);
          continue;
        }
        
        districtVendorsCreated.push(newRel.id);
      }
    } catch (error) {
      errors.push(`Error processing row: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return {
    vendorsCreated: vendorsCreated.size,
    districtVendorsCreated: districtVendorsCreated.length,
    errors,
  };
}

/**
 * Find or create vendor (direct client version for CLI)
 */
async function findOrCreateVendorDirect(
  supabase: ReturnType<typeof createDirectClient>,
  name: string,
  category?: string
): Promise<{ id: string; name: string; category: string | null }> {
  // Try to find existing
  const { data: existing } = await supabase
    .from('vendors')
    .select('*')
    .eq('name', name)
    .single();
  
  if (existing) return existing;
  
  // Create new
  const { data: created, error } = await supabase
    .from('vendors')
    .insert({
      name,
      category: category || null,
      metadata: {
        imported_from: 'uspa_agreement_hub',
      },
    })
    .select()
    .single();
  
  if (error) throw error;
  return created;
}

/**
 * Infer category from agreement type
 */
function inferCategoryFromType(type: string): string | null {
  const typeLower = type.toLowerCase();
  
  if (typeLower.includes('statewide') || typeLower.includes('usbe') || typeLower.includes('uen')) {
    return 'Statewide Agreement';
  }
  
  if (typeLower.includes('vendor specific')) {
    return 'Vendor-Specific Agreement';
  }
  
  if (typeLower.includes('exhibit e')) {
    return 'Subscribable Agreement';
  }
  
  return 'Other';
}

/**
 * Import Negotiation Tracker CSV
 */
export async function importNegotiationTracker(
  csvContent: string,
  supabaseClient?: ReturnType<typeof createDirectClient>
): Promise<{
  negotiationsTracked: number;
  errors: string[];
}> {
  const supabase = supabaseClient || createDirectClient();
  const rows = parseCSV(csvContent);
  
  if (rows.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }
  
  const headers = rows[0];
  const dataRows = rows.slice(1);
  
  // Find header row (skip metadata rows)
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    if (rows[i].includes('Your District/Charter') || rows[i].includes('District/Charter')) {
      headerRowIndex = i;
      break;
    }
  }
  
  const headerRow = rows[headerRowIndex];
  const headerMap: Record<string, number> = {};
  headerRow.forEach((header, index) => {
    headerMap[header.trim()] = index;
  });
  
  const negotiationsTracked = 0;
  const errors: string[] = [];
  
  // Note: We don't have a negotiations table yet
  // This could be stored as metadata on district_vendors or in a new table
  // For now, we'll log what we found
  
  for (const row of rows.slice(headerRowIndex + 1)) {
    try {
      if (row.length < headerRow.length) {
        continue;
      }
      
      const districtName = row[headerMap['Your District/Charter']]?.trim();
      const vendorName = row[headerMap['Vendor/Company Name']]?.trim();
      const productName = row[headerMap['Product Name']]?.trim();
      const negotiationStatus = row[headerMap['Negotiation Status']]?.trim();
      const notes = row[headerMap['Notes:']]?.trim();
      
      if (!districtName || !vendorName) {
        continue;
      }
      
      // Find district and vendor
      const districtId = await findOrCreateDistrict(supabase, districtName);
      if (!districtId) {
        errors.push(`District not found: ${districtName}`);
        continue;
      }
      
      const vendor = await findOrCreateVendorDirect(supabase, vendorName);
      const vendorId = vendor.id;
      
      // Update district_vendors with negotiation info
      const { data: existing } = await supabase
        .from('district_vendors')
        .select('id, notes')
        .eq('district_id', districtId)
        .eq('vendor_id', vendorId)
        .single();
      
      if (existing) {
        const updatedNotes = `${existing.notes || ''}\n\n[Negotiation] ${negotiationStatus || 'Unknown'}\n${notes || ''}`;
        await supabase
          .from('district_vendors')
          .update({
            notes: updatedNotes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        // Create new relationship with negotiation status
        await supabase
          .from('district_vendors')
          .insert({
            district_id: districtId,
            vendor_id: vendorId,
            risk_level: 'high', // Negotiations typically indicate risk
            notes: `[Negotiation] ${negotiationStatus || 'Unknown'}\nProduct: ${productName || 'N/A'}\n${notes || ''}`,
          });
      }
    } catch (error) {
      errors.push(`Error processing negotiation row: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return {
    negotiationsTracked,
    errors,
  };
}
