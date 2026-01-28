import { supabase } from './supabaseClient';

/**
 * Check if user has access to a specific TripKit
 */
/**
 * Check if user has access to a specific TripKit
 */
export async function checkTripKitAccess(userId: string, tripkitId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('customer_product_access')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', tripkitId)
    .eq('product_type', 'tripkit')
    .maybeSingle();

  if (error) {
    console.error('Error checking TripKit access:', error);
    return false;
  }

  return data !== null;
}

/**
 * Grant user access to a TripKit
 */
export async function grantTripKitAccess(
  userId: string,
  tripkitId: string,
  accessType: 'purchased' | 'redeemed' | 'complimentary' = 'purchased'
) {
  const { error } = await supabase.from('customer_product_access').insert({
    user_id: userId,
    product_id: tripkitId,
    product_type: 'tripkit',
    access_type: accessType,
    access_granted_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error granting TripKit access:', error);
    throw error;
  }
}

/**
 * Get all TripKits the user has access to
 */
export async function getUserTripKits(userId: string) {
  // 1. Get access records
  const { data: accessRecords, error: accessError } = await supabase
    .from('customer_product_access')
    .select('id, product_id, access_type, access_granted_at')
    .eq('user_id', userId)
    .eq('product_type', 'tripkit')
    .order('access_granted_at', { ascending: false });

  if (accessError) {
    console.error('Error fetching user access records:', accessError);
    return [];
  }

  if (!accessRecords || accessRecords.length === 0) {
    return [];
  }

  // 2. Get tripkit details for these records
  const tripkitIds = accessRecords.map(r => r.product_id);
  const { data: tripkits, error: tripkitsError } = await supabase
    .from('tripkits')
    .select(`
      id,
      code,
      slug,
      name,
      tagline,
      description,
      cover_image_url,
      destination_count,
      price,
      tier,
      estimated_time
    `)
    .in('id', tripkitIds);

  if (tripkitsError) {
    console.error('Error fetching tripkits:', tripkitsError);
    return [];
  }

  // 3. Combine data
  const tripkitMap = new Map(tripkits?.map(t => [t.id, t]));

  const transformed = accessRecords
    .map(record => ({
      id: record.id,
      access_type: record.access_type,
      access_granted_at: record.access_granted_at,
      tripkit: tripkitMap.get(record.product_id)
    }))
    .filter(item => item.tripkit); // Filter out any where tripkit wasn't found

  return transformed;
}

/**
 * Redeem an access code for a TripKit
 */
export async function redeemAccessCode(userId: string, code: string) {
  // First, check if the code exists and is valid
  const { data: accessCode, error: codeError } = await supabase
    .from('tripkit_access_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .maybeSingle();

  if (codeError || !accessCode) {
    throw new Error('Invalid access code');
  }

  // Check if code is expired
  if (accessCode.expiration_date && new Date(accessCode.expiration_date) < new Date()) {
    throw new Error('Access code has expired');
  }

  // Check if code has reached max uses
  if (accessCode.current_uses >= accessCode.max_uses) {
    throw new Error('Access code has reached maximum uses');
  }

  // Check if user already has access
  const hasAccess = await checkTripKitAccess(userId, accessCode.tripkit_id);
  if (hasAccess) {
    throw new Error('You already have access to this TripKit');
  }

  // Grant access
  await grantTripKitAccess(userId, accessCode.tripkit_id, 'redeemed');

  // Increment code usage
  await supabase
    .from('tripkit_access_codes')
    .update({ current_uses: accessCode.current_uses + 1 })
    .eq('id', accessCode.id);

  return { success: true };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain a lowercase letter' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain an uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain a number' };
  }
  return { valid: true };
}
