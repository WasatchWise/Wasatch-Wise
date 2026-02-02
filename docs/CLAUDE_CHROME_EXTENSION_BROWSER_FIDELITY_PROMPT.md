# Claude Chrome Extension – SLC Trips Fidelity Check Prompt

Use this prompt with the Claude Chrome extension so it **checks the fidelity of SLC Trips** in the browser: what the live site shows, where links go, and what requests it makes.

---

## Copy this into Claude (Chrome extension)

```
You are checking the fidelity of SLC Trips (slctrips.com or the URL I give you). Use the browser: look at the current page, follow links, and use DevTools/Network when needed. Report what you actually see and any mismatches.

**1. Key pages**
- Homepage: hero, nav, main CTAs load and look correct.
- TripKits: list/detail pages load; prices and “Buy”/purchase buttons visible.
- Welcome Wagon: /welcome-wagon loads; pricing and checkout CTA present.
- StayKits: /staykits loads; purchase flow visible if offered.
- Checkout success: /checkout/success (after a test pay or with a session_id) shows confirmation or access code/link.
- Checkout cancel: /checkout/cancel shows a clear “no charge” message.

**2. Revenue paths**
- Click a paid TripKit “Buy” or “Purchase”: does it go to Stripe Checkout (checkout.stripe.com) or show an error? Note the exact URL/redirect.
- Click Welcome Wagon “Buy”/checkout: same—Stripe Checkout or error?
- After checkout (if you can test or I share a session): does success page show access code or “access your TripKit” (or equivalent)? Any failed requests in Network?

**3. Links and connections**
- Outbound links from destination/trip pages: do Booking, Viator, Amazon, or other affiliate links open the expected domains (e.g. booking.com, viator.com, amazon.com) and do URLs contain affiliate/tracking params where expected (e.g. awin, tag=)?
- Important buttons/links: no 404s, no wrong domain (e.g. not pointing to a dev or wrong env).

**4. Content and layout**
- No obvious broken layout, missing images, or placeholder text on key revenue pages.
- Nav: main links (TripKits, Welcome Wagon, StayKits, etc.) go to the right paths.

**5. Report**
- List what you checked and what you saw (URLs, redirects, status codes if from Network).
- Note any mismatch: “Expected X, saw Y” or “Link goes to Z instead of Stripe/affiliate.”
- If you couldn’t see something (e.g. behind login or no test payment), say so and suggest what I should check.
```

---

## Short version (paste when you want a quick check)

```
Check SLC Trips fidelity in the browser. (1) Key pages load: home, TripKits, Welcome Wagon, StayKits, checkout success/cancel. (2) Revenue: “Buy”/checkout goes to Stripe Checkout; success page shows access/confirmation. (3) Affiliate links go to correct domains and have tracking params. (4) No broken layout or wrong links. Report what you see and any mismatches; say what you couldn’t check and what I should verify.
```

---

## How to use

1. Open the Claude Chrome extension.
2. Go to slctrips.com (or your SLC Trips URL: staging/production).
3. Paste the **full prompt** (or short version) into Claude.
4. Optionally add: “Start with the homepage, then [e.g. one TripKit and Welcome Wagon].”
5. Claude will use the page(s) and, if possible, Network/links to check fidelity and report back.

Use the **short version** for a quick “is revenue and navigation intact?” check; use the **full prompt** when you want a structured fidelity report.
