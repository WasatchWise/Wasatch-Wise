# Fix Old Supabase Password Permanently

## Problem

Claude Code agents keep trying to use the old Supabase password `5w55dmaWp!CJGvn` instead of the correct one `S@squ@tch Dani3l 2025`.

## Root Cause

The old password is hardcoded in Claude Code's pre-approved bash commands list. This appears in the system prompt that gets loaded for every session.

## Where It Appears

1. **Claude Code Configuration** - Pre-approved bash commands include:
   ```
   Bash(PGPASSWORD=5w55dmaWp!CJGvn:*)
   ```

2. **Possibly in** `.claudecode/` config files or user-level Claude Code settings

## How to Fix Permanently

### Option 1: Update Claude Code Settings (Recommended)

1. Open Claude Code settings (look for `.claudecode/` folder or global settings)
2. Find the pre-approved bash commands list
3. Replace ALL instances of `5w55dmaWp!CJGvn` with `S@squ@tch Dani3l 2025`
4. OR: Remove the PGPASSWORD pre-approval entirely and let Claude always use the environment variable

### Option 2: Check These Locations

```bash
# Check global Claude Code config
cat ~/.config/claude-code/config.json 2>/dev/null | grep "5w55dmaWp"
cat ~/Library/Application\ Support/claude-code/config.json 2>/dev/null | grep "5w55dmaWp"

# Check project-specific config
cat /Users/johnlyman/Desktop/slctrips-v2/slctrips-v2/.claudecode/config.json 2>/dev/null | grep "5w55dmaWp"
```

### Option 3: Remove Password Pre-Approval

Instead of pre-approving specific PGPASSWORD values, configure Claude Code to:
- Always read from `.env.local`
- Never hardcode database passwords
- Use environment variables only

## Current Workaround

For now, scripts in this project correctly use `.env.local`:
```javascript
const envContent = fs.readFileSync('.env.local', 'utf8');
// Parses PGPASSWORD=S@squ@tch Dani3l 2025
```

## Action Items

- [ ] Find and update Claude Code configuration files
- [ ] Remove old password from pre-approved commands
- [ ] Test that future sessions use correct password
- [ ] Consider removing PGPASSWORD pre-approval entirely

## Correct Password Location

**Always use `.env.local`:**
```
PGPASSWORD=S@squ@tch Dani3l 2025
```

**Never hardcode passwords in:**
- Claude Code settings
- Scripts
- Git repositories
- Command history

---

**Created:** November 1, 2025
**Issue:** Claude agents repeatedly using wrong database password
**Priority:** HIGH - Security & Frustration Issue
