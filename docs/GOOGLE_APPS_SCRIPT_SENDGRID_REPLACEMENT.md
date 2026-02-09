# Google Apps Script – SendGrid Replacement for WasatchWise

**Purpose:** Zero-cost email for lead magnet delivery, welcome sequences, and Pipeline IQ/Groove notifications using `admin@wasatchwise.com` (Gmail API via Apps Script).

**Use when:** Replacing SendGrid for contact forms, lead capture, and automated notifications. Deploy as a Web App and call from your app or Vercel serverless with a secret token.

---

## 1. Create the script

1. Go to [script.google.com](https://script.google.com) and create a new project.
2. Name it e.g. **WasatchWise Email API**.
3. Replace `Code.gs` with the code below.
4. Create a **Sheet** (optional) for logging: e.g. **WasatchWise Lead Log**. Copy its **Sheet ID** from the URL:  
   `https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit`
5. In the script, set `LEAD_LOG_SHEET_ID` (or leave `''` to skip logging).

---

## 2. Code.gs (paste into Apps Script editor)

```javascript
/**
 * WasatchWise Email API – Google Apps Script
 * Replaces SendGrid for: lead magnet, welcome sequence, contact form notifications, Pipeline IQ/Groove.
 * Deploy as Web App (Execute as: Me, Who has access: Anyone).
 */

var LEAD_LOG_SHEET_ID = ''; // Optional: Google Sheet ID for lead/email log
var TOKEN = '';             // Set in script or use Script Properties: EMAIL_API_TOKEN

function getToken() {
  if (TOKEN) return TOKEN;
  var props = PropertiesService.getScriptProperties();
  return props.getProperty('EMAIL_API_TOKEN') || '';
}

/**
 * POST body (JSON):
 *   token: string (required) – must match EMAIL_API_TOKEN
 *   action: 'send' | 'log_only'
 *   to: string (email or comma-separated)
 *   subject: string
 *   html: string (HTML body)
 *   text: string (optional plain text)
 *   replyTo: string (optional)
 *   logRow: object (optional) – if present and LEAD_LOG_SHEET_ID set, append to sheet
 */
function doPost(e) {
  var result = { success: false, error: null };
  try {
    if (!e || !e.postData || !e.postData.contents) {
      result.error = 'Missing POST body';
      return jsonResponse(result, 400);
    }
    var body = JSON.parse(e.postData.contents);
    var secret = body.token || (e.parameter && e.parameter.token);
    var expected = getToken();
    if (!expected || secret !== expected) {
      result.error = 'Unauthorized';
      return jsonResponse(result, 401);
    }

    var action = body.action || 'send';
    var to = body.to;
    var subject = body.subject;
    var html = body.html;
    var text = body.text;
    var replyTo = body.replyTo;

    if (!to || !subject) {
      result.error = 'Missing to or subject';
      return jsonResponse(result, 400);
    }

    var emails = to.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
    if (emails.length === 0) {
      result.error = 'No valid recipient';
      return jsonResponse(result, 400);
    }

    if (action === 'send') {
      var options = {
        htmlBody: html || (text ? null : '<p>No content</p>'),
        body: text || null,
        replyTo: replyTo || null
      };
      GmailApp.sendEmail(emails[0], subject, text || ' ', options);
      if (emails.length > 1) {
        for (var i = 1; i < emails.length; i++) {
          GmailApp.sendEmail(emails[i], subject, text || ' ', options);
        }
      }
      result.success = true;
    } else {
      result.success = true;
    }

    if (LEAD_LOG_SHEET_ID && body.logRow) {
      appendLogRow(body.logRow);
    }

    return jsonResponse(result, 200);
  } catch (err) {
    result.error = err.toString();
    return jsonResponse(result, 500);
  }
}

function appendLogRow(row) {
  if (!LEAD_LOG_SHEET_ID) return;
  var sheet = SpreadsheetApp.openById(LEAD_LOG_SHEET_ID).getSheets()[0];
  var headers = sheet.getRange(1, 1, 1, 10).getValues()[0];
  var values = [];
  if (headers.length) {
    for (var i = 0; i < headers.length; i++) {
      values.push(row[headers[i]] != null ? row[headers[i]] : '');
    }
  } else {
    values = [row.email || '', row.name || '', row.source || '', row.created_at || new Date().toISOString()];
    sheet.getRange(1, 1, 1, values.length).setValues([['email', 'name', 'source', 'created_at']]);
  }
  sheet.appendRow(values);
}

function jsonResponse(obj, status) {
  var code = status || 200;
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * GET for health check (no auth required if you want; or require token in query).
 */
function doGet(e) {
  var result = { ok: true, service: 'WasatchWise Email API' };
  return jsonResponse(result, 200);
}
```

---

## 3. Script Properties (recommended)

1. In Apps Script: **Project Settings** (gear) → **Script Properties**.
2. Add: `EMAIL_API_TOKEN` = a long random string (e.g. from `openssl rand -hex 24`).
3. Use this same value in your app as `GOOGLE_APPS_SCRIPT_EMAIL_TOKEN` (or similar).

---

## 4. Deploy as Web App

1. **Deploy** → **New deployment**.
2. Type: **Web app**.
3. **Execute as:** Me.
4. **Who has access:** Anyone (so your server can call it with the token).
5. Deploy and copy the **Web app URL** (e.g. `https://script.google.com/macros/s/.../exec`).

---

## 5. Call from your app

**Contact form / lead magnet (Node/Next.js):**

```ts
const res = await fetch(process.env.GOOGLE_APPS_SCRIPT_EMAIL_URL!, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: process.env.GOOGLE_APPS_SCRIPT_EMAIL_TOKEN,
    action: 'send',
    to: 'john@wasatchwise.com',
    subject: `New Contact: ${name}`,
    html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>Message: ${message}</p>`,
    logRow: { email, name, source: 'contact_form', created_at: new Date().toISOString() },
  }),
});
const data = await res.json();
if (!data.success) throw new Error(data.error);
```

**Send confirmation to user:**

```ts
body: JSON.stringify({
  token: process.env.GOOGLE_APPS_SCRIPT_EMAIL_TOKEN,
  action: 'send',
  to: userEmail,
  subject: 'Thank you for contacting WasatchWise',
  html: `<p>Hi ${name},</p><p>Thanks for reaching out. We'll get back within 24 hours.</p>`,
}),
```

---

## 6. Vercel environment variables

Add to each project that will send email via this script:

- `GOOGLE_APPS_SCRIPT_EMAIL_URL` = Web app URL (e.g. `https://script.google.com/macros/s/.../exec`)
- `GOOGLE_APPS_SCRIPT_EMAIL_TOKEN` = same value as `EMAIL_API_TOKEN` in Script Properties

---

## 7. Lead log sheet (optional)

1. Create a Google Sheet, add headers in row 1: `email`, `name`, `source`, `created_at` (or match keys in `logRow`).
2. Put the Sheet ID in `LEAD_LOG_SHEET_ID` at the top of `Code.gs`, or in Script Properties as `LEAD_LOG_SHEET_ID`.
3. Every request that includes `logRow` will append one row.

---

**Status:** Draft ready for paste into script.google.com and deployment. After deployment, replace SendGrid call sites with `fetch(GOOGLE_APPS_SCRIPT_EMAIL_URL, …)` using the JSON format above.
