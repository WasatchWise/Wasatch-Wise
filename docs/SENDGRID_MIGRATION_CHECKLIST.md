# SendGrid → Google Workspace Migration Checklist
**Week 1 P0 — February 10, 2026**

---

## Week 1 Steps (Today/This Week)

### Export from SendGrid
- [ ] Log into SendGrid (makeyouseestars@gmail.com)
- [ ] Export contact lists (CSV download from dashboard)
- [ ] Export email templates (copy HTML/text to Google Drive folder "Email Templates")
- [ ] Document any active automations (expected: zero)

### Google Setup
- [ ] Create Google Sheet "Email Subscribers Master List" — import SendGrid CSV
- [ ] Create Google Drive folder "Email Templates" — store exported templates

### Research Complete
- [ ] Google Apps Script + Gmail API doc exists: `docs/GOOGLE_APPS_SCRIPT_SENDGRID_REPLACEMENT.md`
- [ ] Gmail API: 2,000 emails/day limit (free)
- [ ] Apps Script: free automation platform

---

## Week 2 Steps
- [ ] Build Google Apps Script welcome email sequence
- [ ] Test with personal email
- [ ] Migrate 10 test subscribers, monitor deliverability
- [ ] Full migration, sunset SendGrid

---

## Cost Savings
$240–$1,080/year (SendGrid avoided)
