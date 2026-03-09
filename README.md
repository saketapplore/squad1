# SquadXP SDR Intel — Vercel Deployment Guide

## What this is
A Next.js app that gives your SDR team real-time company intelligence + killer outreach messages. Fully deployed on Vercel in ~5 minutes.

---

## Step 1 — Push to GitHub

1. Create a new repo on GitHub (e.g. `squadxp-sdr-intel`)
2. Upload all these files into it (maintain the folder structure)
3. Or use the GitHub desktop app / drag-and-drop upload

---

## Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repo
4. Vercel will auto-detect it as a Next.js project
5. **Before clicking Deploy**, go to **Environment Variables** and add:

```
Name:  ANTHROPIC_API_KEY
Value: sk-ant-xxxxxxxxxxxxxxxx   ← your actual Anthropic API key
```

6. Click **Deploy** — done in ~60 seconds

---

## Step 3 — Get your Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Click **API Keys** → **Create Key**
3. Copy it and paste into Vercel's environment variable above

---

## Folder structure

```
squadxp-sdr-intel/
├── app/
│   ├── api/
│   │   └── research/
│   │       └── route.js        ← Secure backend (holds your API key)
│   ├── components/
│   │   └── SDRIntel.js         ← Full UI
│   ├── layout.js
│   └── page.js
├── next.config.js
├── package.json
└── README.md
```

---

## Why it's secure
- Your Anthropic API key **never touches the browser**
- It lives only in Vercel's environment variables (server-side)
- All API calls go through `/api/research` — a Next.js server route

---

## Local development (optional)

```bash
# Create .env.local file with:
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Then run:
npm install
npm run dev
# Open http://localhost:3000
```
