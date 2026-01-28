# Troubleshooting - Dev Server

## ✅ Server is Running

The dev server should be accessible at: **http://localhost:5173**

## If You Don't See Anything

### 1. Check the URL
Make sure you're going to: `http://localhost:5173` (not https, not a different port)

### 2. Check Browser Console
- Open Developer Tools (F12 or Cmd+Option+I)
- Look at the Console tab for errors
- Look at the Network tab to see if files are loading

### 3. Hard Refresh
- Mac: Cmd+Shift+R
- Windows/Linux: Ctrl+Shift+R

### 4. Check Terminal
The dev server should show:
```
  VITE v7.2.7  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 5. Restart Dev Server
If needed, stop and restart:
```bash
cd frontend
# Press Ctrl+C to stop
npm run dev
```

## Common Issues

### "Cannot GET /"
- Make sure you're using `http://localhost:5173` (not just `localhost:5173`)
- Try adding `/` at the end

### Blank White Screen
- Check browser console for JavaScript errors
- Make sure all dependencies are installed: `npm install`

### Styling Not Working
- Tailwind CSS is configured
- Make sure `src/index.css` is imported in `main.tsx`

## What You Should See

1. **Auth Screen** (if not logged in):
   - DAiTE logo/title
   - Sign up / Sign in form

2. **CYRAiNO Builder** (after sign up):
   - Form to create your AI agent
   - Name, persona, values, interests fields

3. **Dashboard** (after creating CYRAiNO):
   - Your CYRAiNO profile
   - Test match button

## Still Not Working?

1. Check if port 5173 is in use:
   ```bash
   lsof -ti:5173
   ```

2. Try a different port:
   ```bash
   npm run dev -- --port 3000
   ```

3. Check for TypeScript errors:
   ```bash
   npm run build
   ```

