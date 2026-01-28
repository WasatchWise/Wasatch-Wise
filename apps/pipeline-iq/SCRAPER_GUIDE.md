# 🤖 Construction Wire Real Browser Scraper

**This is the REAL scraper** - it opens an actual Chrome browser, logs into Construction Wire, and scrapes REAL project data directly into your database.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This installs Puppeteer (Chrome automation) and all dependencies.

### 2. Make Sure Your Credentials Are Set

Check `.env.local` has:
```bash
CONSTRUCTION_WIRE_USERNAME=msartain@getgrooven.com
CONSTRUCTION_WIRE_PASSWORD=your-password-here
```

### 3. Run the Scraper

**Watch it work (recommended first time):**
```bash
npm run scrape
```

A Chrome browser will open and you'll see it:
- Log into Construction Wire
- Navigate to projects
- Extract data
- Save to database

**Run in background (faster):**
```bash
npm run scrape:headless
```

---

## 📊 What It Does

1. Opens Chrome Browser
2. Logs into Construction Wire
3. Navigates to projects
4. Scrapes real data
5. Saves to Supabase
6. Auto-scores projects

---

## 🎯 First Run

The scraper will try to auto-detect Construction Wire's structure. If it can't:

1. It takes screenshots
2. You inspect the HTML
3. You update the selectors in the code
4. You run again

See full guide in the file for customization details.

---

**Just run:** `npm run scrape` and watch it work!
