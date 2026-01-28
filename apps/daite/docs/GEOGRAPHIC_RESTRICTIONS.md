# Geographic Restrictions

## Overview

DAiTE has geographic restrictions to ensure platform safety and compliance:

1. **United States Only**: Only users with home addresses in the United States can register and use DAiTE
2. **Salt Lake City Exclusion Zone**: Users whose **HOME location** is within a 6-hour driving radius (approximately 420 miles) of Salt Lake City International Airport are excluded
3. **Travelers Welcome**: Users traveling through or visiting the SLC area can still use DAiTE if their permanent/home address is outside the restricted zone

## Implementation

### Database Functions

#### `calculate_driving_distance_miles(lat1, lon1, lat2, lon2)`
Calculates approximate driving distance between two coordinates using the Haversine formula with a road distance factor (1.3x straight-line distance).

#### `is_location_allowed(country, lat, lon, is_home_location)`
Returns `TRUE` if location meets requirements:
- Country is United States
- If `is_home_location = TRUE`: HOME location must be outside 6-hour driving radius of SLC Airport
- If `is_home_location = FALSE`: Travelers/temporary locations are always allowed (if country is US)

#### `can_user_register(country, lat, lon)`
Returns JSONB with:
- `allowed`: boolean
- `error`: detailed error message if not allowed
- `country_check`: whether country check passed
- `distance_check`: whether distance check passed

### Salt Lake City International Airport Reference

- **Coordinates**: 40.7899° N, -111.9791° W
- **6-hour driving radius**: ~420 miles (at 70 mph average highway speed)
- **Affected area**: Most of Utah, parts of Nevada, Idaho, Wyoming, Colorado

### Enforcement

#### Database Level
- **Trigger**: `check_geographic_restrictions` on `user_profiles` table
- **Validates**: On INSERT and UPDATE of location data
- **Error**: Raises exception with clear message if restriction violated

#### Application Level
- Validate during registration
- Check during profile updates
- Verify before matching/discovery
- Display clear error messages to users

### Frontend Implementation

```typescript
// Check if user can register
async function checkGeographicRestrictions(country: string, lat?: number, lon?: number) {
  const { data, error } = await supabase.rpc('can_user_register', {
    country,
    lat: lat || null,
    lon: lon || null
  });
  
  if (error) throw error;
  return data; // { allowed: boolean, error?: string }
}
```

### User Experience

#### Registration Flow
1. User selects country → Immediate validation if not US
2. User enters **HOME location** (permanent address) → Calculate distance from SLC
3. If home within radius → Show error: "DAiTE is not available for users whose HOME location is within a 6-hour driving radius of Salt Lake City. Your home location is approximately X miles from Salt Lake City International Airport. Note: Travelers visiting the area can use DAiTE if their home address is outside the restricted zone."
4. If outside US → Show error: "DAiTE is currently only available to users in the United States."
5. **Optional**: User can set current/temporary location for matching (not restricted)

#### Error Messages

**Country Restriction**:
> "DAiTE is currently only available to users in the United States. We're working on expanding to other countries in the future."

**SLC Radius Restriction (Home Location)**:
> "DAiTE is not available for users whose HOME location is within a 6-hour driving radius of Salt Lake City. Your home location is approximately [X] miles from Salt Lake City International Airport. Note: Travelers visiting the area can use DAiTE if their home address is outside the restricted zone. This restriction is temporary and may be lifted in the future."

**Traveler Note**:
> "You're currently in the Salt Lake City area, but your home address is outside the restricted zone. You can use DAiTE! Your current location won't affect your ability to connect."

**Combined**:
> "DAiTE is currently only available to users in the United States, excluding the Salt Lake City area. Thank you for your interest!"

### Geographic Tracking

The `geographic_restrictions` table tracks:
- All location checks
- Restriction status
- Distance calculations
- Allows for analytics and future policy changes

### Privacy Considerations

- Location data is stored securely
- Only necessary coordinates are stored
- Users can opt for city/state level precision (no exact coordinates)
- Geographic restriction data is only accessible to service role

### Future Considerations

- **Expansion**: Plan for removing SLC restriction
- **International**: Framework for international expansion
- **Precision**: Allow city-level location without exact coordinates
- **Graduated Restrictions**: Different rules for different features

### Testing

Test cases to verify:
1. ✅ US user outside SLC radius → Allowed
2. ✅ Non-US country → Blocked
3. ✅ US user within SLC radius → Blocked
4. ✅ Missing location data → Blocked (until provided)
5. ✅ City-level location (no exact coordinates) → Check country only

### Affected Areas (Approximate)

Within 6-hour driving radius of SLC Airport (~420 miles):
- **Utah**: Entire state
- **Nevada**: Northern/eastern portions
- **Idaho**: Southern portions
- **Wyoming**: Western portions
- **Colorado**: Western edge

Note: Exact boundaries depend on road networks, not straight-line distance.

