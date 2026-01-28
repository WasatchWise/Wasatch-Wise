<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ep53wYS-_I0G42V4Hg43VGYLz7tkPu68

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a `.env.local` file (copy from `env.local.example`) and set `GEMINI_API_KEY` to your Gemini API key
   - Note: This project keeps the key **server-side** in dev (via a local `/api/recommendation` route). The UI can run without a key, but spinning requires it.
3. Run the app:
   `npm run dev`
