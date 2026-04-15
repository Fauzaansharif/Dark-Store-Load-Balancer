# ZoneScore — Full Deployment Guide
# GitHub + Render (Backend) + Vercel (Frontend)
# =====================================================

## WHAT YOU HAVE

Two separate projects:
  zonescore-frontend/   → Deploy to Vercel (already there at darkstoreloadbalancer.vercel.app)
  zonescore-backend/    → Deploy to Render (free Node.js hosting)

New files to add:
  index.html            → New landing page
  login.html            → Admin login page
  landing.css           → Landing page styles
  login.css             → Login page styles
  js/landing.js         → Landing page interactions + 3D tilt
  js/login.js           → Login logic
  js/tilt.js            → 3D tilt for dashboard pages


# =====================================================
# PART 1: SET UP THE BACKEND ON GITHUB + RENDER
# =====================================================

## Step 1 — Create a new GitHub repo for the backend

1. Go to https://github.com/new
2. Repository name: zonescore-backend
3. Set to Public (required for Render free tier)
4. Do NOT add README, .gitignore, or license (we already have these)
5. Click "Create repository"

## Step 2 — Push your backend code to GitHub

Open terminal in the zonescore-backend/ folder:

  git init
  git add .
  git commit -m "Initial backend - ZoneScore load balancer"
  git branch -M main
  git remote add origin https://github.com/YOUR_USERNAME/zonescore-backend.git
  git push -u origin main

Replace YOUR_USERNAME with your actual GitHub username.

## Step 3 — Deploy backend on Render

1. Go to https://render.com → Sign up / Log in (use GitHub to sign in)
2. Click "New +" → "Web Service"
3. Click "Connect a repository" → select zonescore-backend
4. Fill in the settings:

   Name:           zonescore-backend   (or any name you like)
   Region:         Singapore (closest to Mumbai)
   Branch:         main
   Runtime:        Node
   Build Command:  npm install
   Start Command:  npm start
   Instance Type:  Free

5. Click "Create Web Service"
6. Wait 2-3 minutes for the first deploy
7. Render gives you a URL like:
   https://zonescore-backend.onrender.com

   SAVE THIS URL — you need it in Step 5.

## Step 4 — Verify backend is working

Open in browser:
  https://zonescore-backend.onrender.com/api/health

You should see:
  {"status":"ok","project":"ZoneScore","timestamp":"..."}

Also test:
  https://zonescore-backend.onrender.com/api/warehouses
  https://zonescore-backend.onrender.com/api/dashboard/stats


# =====================================================
# PART 2: UPDATE FRONTEND AND DEPLOY TO VERCEL
# =====================================================

## Step 5 — Update BACKEND_URL in api.js

Open api.js and change line 1:

  BEFORE:
  const BACKEND_URL = "http://localhost:5000";

  AFTER:
  const BACKEND_URL = "https://zonescore-backend.onrender.com";

  (Use your actual Render URL from Step 3)

## Step 6 — Add all new files to your existing frontend repo

Your existing repo is: https://github.com/Fauzaansharif/Dark-Store-Load-Balancer

Clone it locally if you haven't:
  git clone https://github.com/Fauzaansharif/Dark-Store-Load-Balancer.git
  cd Dark-Store-Load-Balancer

Now copy these files from the frontend zip INTO your repo:

  FILE                    → WHERE IN YOUR REPO
  ─────────────────────────────────────────────
  index.html              → replace existing index.html (root)
  login.html              → add to root (NEW FILE)
  landing.css             → add to root (NEW FILE)
  login.css               → add to root (NEW FILE)
  styles.css              → replace existing styles.css (root)
  api.js                  → replace existing api.js (root)
  sidebar.js              → replace existing sidebar.js (root)
  database.html           → replace existing database.html (root)
  dashboard/index.html    → replace existing dashboard/index.html
  exec/index.html         → replace existing exec/index.html
  billing/index.html      → replace existing billing/index.html
  connections/index.html  → replace existing connections/index.html
  workflows/index.html    → replace existing workflows/index.html
  settings/index.html     → replace existing settings/index.html
  js/landing.js           → add js/ folder + file (NEW)
  js/login.js             → add to js/ folder (NEW)
  js/tilt.js              → add to js/ folder (NEW)
  js/dashboard.js         → add to js/ folder (NEW)
  js/warehouses.js        → add to js/ folder (NEW)
  js/workflows.js         → add to js/ folder (NEW)
  js/connections.js       → add to js/ folder (NEW)
  js/billing.js           → add to js/ folder (NEW)
  js/settings.js          → add to js/ folder (NEW)
  js/database.js          → add to js/ folder (NEW)

## Step 7 — Commit and push to GitHub

  git add .
  git commit -m "Add landing page, login, 3D tilt effects, SQLite backend integration"
  git push origin main

## Step 8 — Vercel auto-deploys

Vercel watches your GitHub repo. Once you push, it automatically rebuilds
and deploys within 1-2 minutes.

Check your site at: https://darkstoreloadbalancer.vercel.app

Flow should now be:
  / (landing page) → /login.html → /dashboard/ → all other pages


# =====================================================
# PART 3: IMPORTANT NOTES
# =====================================================

## Render free tier — cold starts
Render's free tier spins down after 15 minutes of inactivity.
The FIRST request after idle takes ~30-60 seconds to wake up.
Subsequent requests are fast.

To avoid this: ping your backend every 14 minutes using a free service
like https://cron-job.org (set it to GET your /api/health endpoint).

## Login credentials
The login page uses demo credentials stored in js/login.js:
  Email:    admin@zonescore.io
  Password: admin123

This is frontend-only validation — fine for an academic project.
For production you'd add a real auth endpoint to the backend.

## SQLite database on Render
Render's free tier has ephemeral storage — the SQLite .db file
resets when the service restarts (usually every deploy or daily).
The server auto-recreates the database with sample data on startup,
so this is fine for demos.

For production persistent storage, migrate to Supabase (free Postgres)
or Railway (free Postgres). Let your teacher know this is a known
trade-off of free hosting.

## CORS
The backend server.js already allows your Vercel domain:
  https://darkstoreloadbalancer.vercel.app
No changes needed.

## Testing locally before pushing

Backend:
  cd zonescore-backend
  npm install
  npm run dev
  → Runs on http://localhost:5000

Frontend (with VS Code Live Server):
  Open your frontend folder in VS Code
  Right-click index.html → "Open with Live Server"
  → Runs on http://localhost:5500

Make sure api.js has BACKEND_URL = "http://localhost:5000" for local testing,
then change it back to your Render URL before pushing to GitHub.


# =====================================================
# QUICK REFERENCE — ALL URLs WHEN LIVE
# =====================================================

Landing page:  https://darkstoreloadbalancer.vercel.app/
Login:         https://darkstoreloadbalancer.vercel.app/login.html
Dashboard:     https://darkstoreloadbalancer.vercel.app/dashboard/
Warehouses:    https://darkstoreloadbalancer.vercel.app/exec/
Workflows:     https://darkstoreloadbalancer.vercel.app/workflows/
Connections:   https://darkstoreloadbalancer.vercel.app/connections/
Billing:       https://darkstoreloadbalancer.vercel.app/billing/
Settings:      https://darkstoreloadbalancer.vercel.app/settings/
Add Warehouse: https://darkstoreloadbalancer.vercel.app/database.html

Backend health:     https://zonescore-backend.onrender.com/api/health
Backend warehouses: https://zonescore-backend.onrender.com/api/warehouses
Backend simulate:   POST https://zonescore-backend.onrender.com/api/orders/simulate
