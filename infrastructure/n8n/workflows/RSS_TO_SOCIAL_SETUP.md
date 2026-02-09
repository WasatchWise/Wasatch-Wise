# RSS → Claude → Google Sheets — Setup

**Workflow file:** `rss-to-social-content-log.json`

This workflow polls your blog RSS feed every 6 hours, takes the **newest post**, asks Claude to generate LinkedIn + X (Twitter) copy, and appends the result to a Google Sheet. No LinkedIn or X API keys required for this version — you copy from the Sheet and post manually (or add API nodes later).

---

## 1. Import the workflow

1. In n8n: **Workflows** → **Import from File** (or ⋯ → **Import**).
2. Select `rss-to-social-content-log.json`.
3. If n8n reports a missing node **"Build Claude Body"**, the connection is wired to it but the node may be missing in your import — connect **Has New Post?** (true branch) directly to **Claude: Generate LinkedIn + X** and see **Fix for Claude request body** below.

---

## 2. Fix for “access to env vars denied” (other workflows)

If you see **"access to env vars denied"** in a **Supabase** or **HTTP** node:

- Use **n8n Variables** instead of environment variables.
- In n8n: **Settings** → **Variables** (or **Project** → **Variables**). Add e.g. `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- In the node, reference them as **`{{ $vars.SUPABASE_URL }}`** and **`{{ $vars.SUPABASE_SERVICE_ROLE_KEY }}`** (not `$env`).
- The **social-metrics-webhook-ingest** workflow already uses `$vars` in the HTTP Request node; if your instance still blocks env access, ensure those variables are set in n8n.

---

## 3. Configure this workflow

### 3.1 RSS URL

- Open the **RSS Feed Read** node.
- Set **URL** to your blog feed, e.g.:
  - `https://wasatchwise.com/feed`
  - `https://wasatchwise.com/rss`
  - or your actual feed URL (Next.js often uses `/feed` or `/feed.xml`).

### 3.2 Anthropic API key

The **Claude: Generate LinkedIn + X** node sends a POST to the Anthropic API and needs your API key.

**Docker Compose (recommended for local n8n):**

1. In **`infrastructure/n8n/`**, ensure you have a **`.env`** file (copy from `.env.example` if needed).
2. Add to **`.env`**: `ANTHROPIC_API_KEY=sk-ant-...` and `GOOGLE_SHEET_ID=your-spreadsheet-id` (do not commit .env).
3. Restart n8n so it picks up .env: `cd infrastructure/n8n && docker compose restart n8n`. The workflow uses **`{{ $env.ANTHROPIC_API_KEY }}`**. If your n8n version uses Variables for “env”, it may read from Variables; otherwise set **Environment** in your n8n deployment with `ANTHROPIC_API_KEY=sk-ant-...`.

**Option B — HTTP Header Auth credential:**

1. In n8n: **Credentials** → **Create** → **Header Auth**.
2. Name: e.g. `Anthropic API`.
3. Header name: `x-api-key`, Value: your API key.
4. In the **Claude: Generate LinkedIn + X** node, set **Authentication** to that credential and remove the manual `x-api-key` header.

**If the request body is empty:** The workflow expects the previous node to pass a `requestBody` field. If you connected **Has New Post?** directly to **Claude: Generate LinkedIn + X**, the HTTP node receives `title`, `link`, `excerpt` but no `requestBody`. In that case add a **Code** node between **Has New Post?** and **Claude** that builds the body:

```js
const r = $input.first().json;
const prompt = `Given this blog post, write two social posts. Use valid JSON only, no markdown.\n\nTitle: ${r.title}\nURL: ${r.link}\nExcerpt: ${(r.excerpt || '').substring(0, 800)}\n\nOutput format: { "linkedin": "...", "x": "..." }\n- linkedin: professional, 1-3 sentences, max 3000 chars, include the URL at the end.\n- x: punchy, max 280 chars, include the URL.`;
const requestBody = JSON.stringify({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1024,
  messages: [{ role: 'user', content: prompt }]
});
return [{ json: { ...r, requestBody } }];
```

Name the node **Build Claude Body** and connect: **Has New Post?** (true) → **Build Claude Body** → **Claude: Generate LinkedIn + X**.

### 3.3 Google Sheet

1. Create a Google Sheet with a sheet (tab) named **RSS Social Log** (or change the node to match your name).
2. Add header row: **Title** | **Blog URL** | **LinkedIn Text** | **X Text** | **Generated At**.
3. Copy the **Spreadsheet ID** from the URL: `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`.
4. In n8n **Settings** → **Variables**, add **`GOOGLE_SHEET_ID`** = that ID.
5. In the **Append to Google Sheet** node, set **Document** to that spreadsheet and **Sheet** to **RSS Social Log** (or your name). The node uses **Google Sheets** credentials — create a Google OAuth2 credential for n8n if needed.

---

## 4. Run and test

1. **Execute manually** (Run workflow) once. It will fetch the RSS feed, take the newest item, call Claude, and append to the Sheet.
2. If the feed is empty or the link is missing, **Has New Post?** routes to the false branch and nothing else runs.
3. Check the **RSS Social Log** sheet for a new row with Title, Blog URL, LinkedIn Text, X Text, Generated At.

---

## 5. Optional: LinkedIn / X auto-posting later

- **LinkedIn:** Add an **HTTP Request** (or LinkedIn node) after **Parse and Merge**; use LinkedIn API with OAuth. You can branch “if LinkedIn enabled” and pass `linkedin_text` + URL.
- **X (Twitter):** Same idea; X API v2 requires a paid tier (~$100/mo for write). You can skip and keep copying from the Sheet.

---

## 6. Deduplication (optional)

To avoid reprocessing the same post every 6 hours:

- **Option A:** Keep “Newest Post Only” and add a **Google Sheet: Lookup** node that checks if `Blog URL` already exists in **RSS Social Log**; only continue if not found.
- **Option B:** Use n8n’s **RSS Feed Trigger** instead of Schedule + RSS Read, so the workflow runs only when the feed has new items (if your n8n version supports it).

---

**Summary:** Import the JSON → set RSS URL, Anthropic key (via Variable or Header Auth), and Google Sheet ID + credentials → run once to test → enable workflow for every-6-hour runs.
