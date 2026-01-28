# SLCTrips Legal Documents

This directory contains all legal and support documentation for the SLCTrips platform.

## Documents Overview

### 1. Utah Student Data Protection Compliance (`UTAH_STUDENT_DATA_PROTECTION.md`)
**NEW** - Compliance with Utah Code 53E-9-3 for educational use:
- Third-party contractor requirements
- Student data protection obligations
- Prohibited practices (targeted advertising, secondary use)
- Contract provisions for Utah K-12 schools
- Data security and breach notification
- Student and parent rights

**Status:** Complete - Required for any Utah school district contracts
**Audience:** Utah K-12 schools, districts, and education entities

### 2. Terms of Service (`TERMS_OF_SERVICE.md`)
Comprehensive terms governing use of the SLCTrips platform, including:
- Service description and user accounts
- TripKit purchases and licensing
- Intellectual property rights
- Guardian educational content policies
- Acceptable use policies
- Disclaimers and limitations of liability
- Dispute resolution and governing law

**Status:** Complete - Ready for legal review

### 3. Privacy Policy (`PRIVACY_POLICY.md`)
Detailed privacy policy covering data collection, use, and protection:
- Information collection (account, payment, usage data)
- How we use and share information
- Third-party service providers (Supabase, Stripe)
- Cookies and tracking technologies
- User privacy rights (GDPR, CCPA compliance)
- Children's privacy (COPPA compliance)
- **NEW: Section 10 - Utah Student Data Protection (Utah Code 53E-9-3 compliance)**
- International data transfers

**Status:** Complete - Ready for legal review (includes Utah student data protection)

### 4. Refund Policy (`REFUND_POLICY.md`)
Clear refund terms for digital content purchases:
- 7-day satisfaction guarantee
- Digital content refund limitations
- Refund eligibility and exclusions
- Refund process and timeline
- Chargeback policies
- Special circumstances and exceptions

**Status:** Complete - Ready for legal review

### 5. Contact & Support (`CONTACT_SUPPORT.md`)
User-facing support documentation:
- Contact information and support hours
- Comprehensive FAQ sections
- How to get help
- Partnership and media inquiries
- Social media links
- Educational use information

**Status:** Complete - Requires email/contact configuration

---

## Before Going Live: Action Items

### Critical - Must Complete

**1. Configure Email Addresses**

All documents contain placeholder email addresses that need to be configured:

```
Replace these placeholders:
- [Dan@slctrips.com]
- [Dan@slctrips.com]
- [Dan@slctrips.com]
- [Dan@slctrips.com]
- [Dan@slctrips.com]
- [Dan@slctrips.com]
- [Dan@slctrips.com]
- [Dan@slctrips.com]
- [Dan@slctrips.com]
- [Dan@slctrips.com]
- [Dan@slctrips.com]
- [Dan@slctrips.com] **NEW - Utah student data protection compliance**
- [Dan@slctrips.com] **NEW - Utah education entity audit requests**
```

**Recommended Setup:**
- Use professional email service (Google Workspace, Microsoft 365, etc.)
- Set up email aliases/forwarding
- Configure auto-responders for support emails
- Set up ticketing system (optional but recommended)

**2. Add Physical Address**

Update in multiple documents:
- Terms of Service (Section 1)
- Privacy Policy (Section 13)
- Contact & Support (Office Location)

**Required for:**
- Legal compliance
- DMCA agent registration
- Business legitimacy

**3. Update Social Media Links**

In `CONTACT_SUPPORT.md`, add actual social media handles:
- Instagram: [@slctrips]
- Facebook: [/slctrips]
- Twitter/X: [@slctrips]
- Pinterest: [/slctrips]

**4. Add Internal Links**

Update placeholder links in documents:
- "Browse TripKits" link
- "Meet the Guardians" link
- "My Account" link
- Status page URL
- Other internal navigation

---

### Important - Recommended Before Launch

**1. Legal Review**

Have all documents reviewed by a qualified attorney, especially:
- Terms of Service (liability limitations, jurisdiction)
- Privacy Policy (GDPR/CCPA compliance)
- Refund Policy (state consumer protection laws)

**Areas requiring special attention:**
- Digital content refund laws by state
- COPPA compliance for children's content
- International user considerations
- Stripe Terms of Service alignment
- Supabase data processing agreements

**2. Compliance Verification**

**GDPR (if serving EU users):**
- Verify legal basis for data processing
- Ensure data portability mechanisms
- Implement right to erasure functionality
- Appoint EU representative if required

**CCPA (California users):**
- Verify "Do Not Sell" mechanisms
- Implement data access request system
- Update privacy disclosures

**COPPA (children under 13):**
- Verify age verification mechanisms
- Ensure parental consent flows (if allowing <13)
- Document educational content safety

**3. Stripe Integration Alignment**

Verify refund policy aligns with:
- Stripe's dispute/chargeback policies
- Payment processor requirements
- Card network rules

**4. Create Accessible Versions**

Make legal docs accessible on website:
- Add footer links to all pages
- Create `/legal/terms` route
- Create `/legal/privacy` route
- Create `/legal/refund` route
- Create `/support` or `/contact` route
- Ensure mobile-friendly formatting

**5. Version Control**

Implement legal document versioning:
- Track all changes with dates
- Notify users of material changes
- Archive previous versions
- Implement "Last Updated" tracking system

---

## Implementation Checklist

### Phase 1: Immediate (Pre-Launch)
- [ ] Configure all email addresses
- [ ] Add physical business address
- [ ] Legal review of all documents
- [ ] Update social media placeholders
- [ ] Add internal navigation links
- [ ] Test email delivery

### Phase 2: Pre-Launch
- [ ] Create web pages for legal documents
- [ ] Add footer links site-wide
- [ ] Implement user consent flows
- [ ] Create cookie consent banner
- [ ] Set up email notification system for policy updates
- [ ] Configure auto-responders

### Phase 3: Post-Launch
- [ ] Monitor support email volumes
- [ ] Refine FAQ based on common questions
- [ ] A/B test refund policy clarity
- [ ] Gather user feedback
- [ ] Update documents based on real-world use

### Ongoing
- [ ] Annual legal review
- [ ] Update for regulatory changes
- [ ] Expand FAQ sections
- [ ] Track refund request patterns
- [ ] Monitor DMCA/copyright issues

---

## Document Maintenance

### When to Update Documents

**Terms of Service:**
- New features or services added
- Changes to pricing or refund policies
- Liability or legal requirement changes
- User feedback requiring clarification

**Privacy Policy:**
- New data collection practices
- Additional third-party services
- Regulatory requirement changes
- User rights expansions

**Refund Policy:**
- Changes to refund windows or eligibility
- New product types
- Payment processor changes
- Legal requirement updates

**Contact & Support:**
- New contact methods
- FAQ expansions
- Service hour changes
- Partnership opportunities

### Update Process

1. **Draft Changes**
   - Document specific changes needed
   - Note effective date

2. **Legal Review**
   - Submit changes to attorney
   - Address any concerns

3. **User Notification**
   - Email registered users of material changes
   - Post notice on platform
   - Update "Last Updated" date

4. **Implementation**
   - Update all document versions
   - Update website copies
   - Archive previous versions

5. **Monitoring**
   - Monitor user questions/confusion
   - Address any ambiguities

---

## Contact Information Template

**For easy copy-paste when configuring:**

```
General Support: Dan@slctrips.com
Technical Issues: Dan@slctrips.com
Billing & Refunds: Dan@slctrips.com
Partnerships: Dan@slctrips.com
Privacy Requests: Dan@slctrips.com
Security Issues: Dan@slctrips.com
Content Errors: Dan@slctrips.com
DMCA Notices: Dan@slctrips.com
Feedback: Dan@slctrips.com
Educational Use: Dan@slctrips.com
Media Inquiries: Dan@slctrips.com
Student Data (Utah K-12): Dan@slctrips.com
Education Audits (Utah): Dan@slctrips.com

Physical Address:
SLCTrips
2604 w Dublin Dr.
Salt Lake City, UT 84119
United States
```

---

## Notes for Developers

### Displaying Legal Documents

**Recommended implementation:**

1. **Create Next.js routes:**
   ```
   /legal/terms
   /legal/privacy
   /legal/refund
   /support or /contact
   ```

2. **Markdown rendering:**
   - Use markdown parser (e.g., `react-markdown`, `marked`)
   - Style for readability
   - Ensure mobile responsiveness

3. **Footer component:**
   ```jsx
   <footer>
     <Link href="/legal/terms">Terms of Service</Link>
     <Link href="/legal/privacy">Privacy Policy</Link>
     <Link href="/legal/refund">Refund Policy</Link>
     <Link href="/support">Support</Link>
   </footer>
   ```

4. **User consent:**
   - Checkbox on registration: "I agree to Terms of Service and Privacy Policy"
   - Store consent timestamp in database
   - Re-prompt on material changes

5. **Cookie consent banner:**
   - Display on first visit
   - Allow granular consent (analytics, marketing, etc.)
   - Store preference in localStorage/cookie

### Database Considerations

**User consent tracking:**
```sql
CREATE TABLE user_consents (
  user_id UUID REFERENCES auth.users(id),
  terms_version VARCHAR(50),
  privacy_version VARCHAR(50),
  consent_date TIMESTAMP,
  ip_address INET,
  PRIMARY KEY (user_id, consent_date)
);
```

---

## Legal Resources

**Useful References:**
- FTC Digital Advertising Guidelines
- GDPR Official Text: gdpr.eu
- CCPA Official Text: oag.ca.gov/privacy/ccpa
- COPPA Compliance: ftc.gov/coppa
- Stripe Legal Docs: stripe.com/legal
- Supabase Privacy: supabase.com/privacy

**Recommended Legal Services:**
- Rocket Lawyer (small business legal)
- LegalZoom (document templates)
- Local Utah business attorney (highly recommended)

---

**Questions or Issues?**

If you have questions about these legal documents or need to make updates, contact the legal team or project owner.

**Created:** November 1, 2025
**Last Updated:** November 1, 2025
**Next Review:** Pre-launch legal review required
