# CLAUDE.md — DBX Demo NYC (dbxdemonyc.com)

## Project Overview

An interactive demo application for a NYC Founders event (Thursday presentation) showcasing how **Databricks is a complete platform for building production applications**. The hero feature is **LakeBase** (Databricks' managed Postgres offering) powering a real-time event registration + analytics pipeline.

### What the Demo Shows
1. **A live web app** collecting attendee data (location + interests) → writes to LakeBase (managed Postgres)
2. **Bi-directional sync** between LakeBase ↔ Databricks Lakehouse (Unity Catalog / Delta tables)
3. **Advanced NLP/ML** running on Databricks (streaming job classifying free-text responses into topics)
4. **Real-time visualization** — a choropleth map + embedded Databricks Dashboard updating live as users submit

### Audience
NYC Founders learning how to build with AI on Databricks. Keep the UX clean, modern, and impressive but simple under the hood.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + CRA)                       │
│              Hosted on AWS Amplify (Static) + Route 53              │
│                       dbxdemonyc.com                                │
│                   App ID: dx7u5ga7qr7e7                             │
│                                                                     │
│  ┌──────────────┐   ┌──────────────────┐   ┌────────────────────┐  │
│  │  Registration │   │  Dashboard Tab   │   │  Dashboard Tab     │  │
│  │  Flow (Home)  │   │  (Leaflet Map +  │   │  (Embedded DBSQL   │  │
│  │  4-step wizard│   │   recharts)      │   │  via AIBI SDK)     │  │
│  └──────┬───────┘   └────────┬─────────┘   └────────┬───────────┘  │
│         │                    │                       │              │
└─────────┼────────────────────┼───────────────────────┼──────────────┘
          │ POST               │ GET                   │ SP token
          ▼                    ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│              BACKEND (Express.js on Amplify WEB_COMPUTE)            │
│                   App ID: d1erxf8q87xlvj                            │
│                                                                     │
│  Endpoints:                                                         │
│  ├── POST /registrations    → write to LakeBase                     │
│  ├── GET  /registrations    → read all (for map + charts)           │
│  ├── GET  /dashboard-token  → mint SP OAuth token for embed         │
│  └── GET  /health           → DB connectivity check                 │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ Postgres (DATABASE_URL)
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     LAKEBASE (Managed Postgres)                     │
│  Project: nyc-demo (Autoscaling)                                    │
│  Host: ep-ancient-bread-d15lax3a.database.us-west-2.cloud.db.com   │
│                                                                     │
│  Table: event_registrations                                         │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ user_id | borough | neighborhood | state | reason | ts      │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │  Registered in UC as    │
              │  nyc_demo_lakebase      │
              ▼                         │
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABRICKS LAKEHOUSE                              │
│  Workspace: dbc-eca83c32-b44b.cloud.databricks.com                  │
│                                                                     │
│  ├── AI/BI Dashboard (Lakeview)                                     │
│  │   ID: 01f1103d19bc175083fbb5392f987e10                           │
│  │   → Queries nyc_demo_lakebase.public.event_registrations         │
│  │   → Embedded in frontend via @databricks/aibi-client SDK         │
│  │   → Auth: Service Principal (nyc-demo-dashboard-embed)           │
│  │                                                                  │
│  ├── (P2) Streaming NLP Job                                         │
│  │   → Classify `reason` text into topics                           │
│  │                                                                  │
│  └── (P2) Synced Table: topic_analysis → LakeBase                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Infrastructure (Resolved)

| # | Question | Status | Value |
|---|----------|--------|-------|
| 1 | LakeBase instance name & connection string | ✅ DONE | Autoscaling project: `nyc-demo`, Host: `ep-ancient-bread-d15lax3a.database.us-west-2.cloud.databricks.com`, Port: `5432`, DB: `databricks_postgres` |
| 2 | LakeBase credentials (user/password or service principal) | ✅ DONE | Databricks OAuth via CLI profile `dbc-eca83c32-b44b`, user: `jwneil17@gmail.com`. Backend auto-refreshes tokens. |
| 3 | Databricks workspace URL | ✅ DONE | `https://dbc-eca83c32-b44b.cloud.databricks.com/` |
| 4 | Databricks SQL Warehouse ID (for dashboard) | ✅ DONE | `00561e6c134511ad` (Serverless Starter Warehouse, auto-stop 10min) |
| 5 | Unity Catalog: catalog name for LakeBase registration | ✅ DONE | `nyc_demo_lakebase` (type: MANAGED_ONLINE_CATALOG, registered via API with project UID + branch UID) |
| 6 | Unity Catalog: catalog/schema for Delta tables (NLP output) | ⬜ TODO | `__UC_ANALYTICS_CATALOG__`.`__UC_ANALYTICS_SCHEMA__` (needed once NLP pipeline is built) |
| 7 | AWS Amplify app ID & branch | ✅ DONE | App ID: `dx7u5ga7qr7e7`, Branch: `main`, appRoot: `frontend` |
| 8 | Route 53 hosted zone for dbxdemonyc.com | ✅ DONE | Zone ID: `Z0539934378OSJQUTTXIA` |
| 9 | GitHub repo URL | ✅ DONE | `https://github.com/jneil17/nyc_app` (public) |
| 10 | Databricks auth for dashboard embed | ✅ DONE | Service Principal `nyc-demo-dashboard-embed` (App ID: `4ae0de5c-dc08-49e8-9491-30ae1e81ecbd`). OAuth client credentials flow via `/dashboard-token` endpoint. |
| 11 | LakeBase → UC: Using registered catalog + streaming table, OR Lakehouse Federation? | ✅ DONE | Registered LakeBase as UC catalog `nyc_demo_lakebase`. Dashboard queries federated directly. |
| 12 | NLP model choice (LDA, zero-shot classifier, etc.) | ⬜ TODO (P2) | TBD after MVP is live |
| 13 | Backend hosting (publicly accessible) | ✅ DONE | Amplify WEB_COMPUTE app `d1erxf8q87xlvj`. NOT Databricks Apps (requires auth). |
| 14 | LakeBase native PG role (for production DATABASE_URL) | ✅ DONE | Role: `nyc_app`, password-based auth via DATABASE_URL |

### AWS Details
- **Account:** `637423476933`
- **IAM User:** `jneil_developer` (has `ClaudeCodeDemoAccess` policy: Amplify, Route53, IAM read-only)
- **Region:** `us-east-1` (all Amplify resources)
- **Frontend Amplify App:** `dx7u5ga7qr7e7` (Static, `appRoot: frontend`)
  - Default domain: `dx7u5ga7qr7e7.amplifyapp.com`
  - Custom domain: `dbxdemonyc.com`
  - Build: `npm install` → `npm run build` → serves `build/`
  - Env var needed: `REACT_APP_API_URL` → set to backend URL once deployed
- **Backend Amplify App:** `d1erxf8q87xlvj` (WEB_COMPUTE, `appRoot: backend`)
  - Default domain: `d1erxf8q87xlvj.amplifyapp.com`
  - Env vars set: `DATABASE_URL`
  - Env vars needed: `DATABRICKS_WORKSPACE_URL`, `DATABRICKS_SP_CLIENT_ID`, `DATABRICKS_SP_CLIENT_SECRET`
  - **STATUS: DEPLOY PENDING** — last build failed (buildspec `cd backend` issue, see Deployment section)

### Databricks Details
- **Workspace:** `https://dbc-eca83c32-b44b.cloud.databricks.com/`
- **CLI Profile:** `dbc-eca83c32-b44b` (SSO auth)
- **Admin user:** John Neil (`jwneil17@gmail.com`)

### LakeBase Details (Autoscaling Tier)
- **Project:** `nyc-demo` (UID: `19c5d4b9-ccd7-48af-8c19-f9c3f0163e5f`)
- **Branch:** `production` (UID: `br-old-salad-d171gst3`, default, no expiry)
- **Endpoint:** `primary` (UID: `ep-ancient-bread-d15lax3a`, read-write, 1 CU autoscaling)
- **Host:** `ep-ancient-bread-d15lax3a.database.us-west-2.cloud.databricks.com`
- **Port:** `5432`
- **Database:** `databricks_postgres` (default for Autoscaling tier)
- **PG Version:** 17
- **Auth:** Databricks OAuth (via CLI profile `dbc-eca83c32-b44b`)
- **Status:** ACTIVE, tables created, tested and working
- **CLI commands:** Use `databricks postgres` (not `databricks database`)
- **Table:** `event_registrations` — created with indexes on `borough` and `created_at`
- **Connect via psql:**
  ```bash
  export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
  TOKEN=$(databricks auth token -p dbc-eca83c32-b44b | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
  PGPASSWORD="$TOKEN" psql "host=ep-ancient-bread-d15lax3a.database.us-west-2.cloud.databricks.com port=5432 dbname=databricks_postgres user=jwneil17@gmail.com sslmode=require"
  ```

### Databricks AI/BI Dashboard (Lakeview)
- **Dashboard ID:** `01f1103d19bc175083fbb5392f987e10`
- **Display Name:** "NYC Event - Live Registrations"
- **Workspace ID:** `3590757798436003`
- **Warehouse:** `00561e6c134511ad` (Serverless Starter Warehouse)
- **Published:** Yes
- **Dashboard URL:** `https://dbc-eca83c32-b44b.cloud.databricks.com/dashboardsv3/01f1103d19bc175083fbb5392f987e10`
- **Widgets:** Counter (total), Pie (location type), Area (activity over time), Bar (by borough), Table (recent responses)
- **Data Source:** All queries hit `nyc_demo_lakebase.public.event_registrations` (federated from LakeBase)
- **Embed method:** `@databricks/aibi-client` SDK in `EmbeddedDashboard.jsx` — fetches SP token from backend `GET /dashboard-token`, then renders natively in the React app (no iframe)

### Service Principal (Dashboard Embed Auth)
- **Name:** `nyc-demo-dashboard-embed`
- **Application ID:** `4ae0de5c-dc08-49e8-9491-30ae1e81ecbd`
- **SP ID:** `76983484699022`
- **Secret expires:** 2028-02-22
- **Permissions granted:**
  - `CAN_USE` on SQL warehouse `00561e6c134511ad`
  - `CAN_READ` on dashboard `01f1103d19bc175083fbb5392f987e10`
  - `USE CATALOG` on `nyc_demo_lakebase`
  - `USE SCHEMA` on `nyc_demo_lakebase.public`
  - `SELECT` on `nyc_demo_lakebase.public.event_registrations`
- **Token flow:** Backend calls `POST https://dbc-eca83c32-b44b.cloud.databricks.com/oidc/v1/token` with client credentials → returns 1hr access token → frontend uses it with AIBI SDK
- **Verified working:** SP can query LakeBase data and access the dashboard

### Backend API (Code DONE, Deployment PENDING)
- **Location:** `backend/` directory
- **Stack:** Express.js + pg (node-postgres)
- **Port:** 3001 (local), auto-assigned on Amplify
- **Endpoints:**
  - `GET /health` — DB health check
  - `POST /registrations` — insert new registration
  - `GET /registrations` — fetch all registrations (for dashboard polling)
  - `GET /registrations/stats` — aggregated borough/neighborhood counts
  - `GET /topics` — fetch topic analysis (from NLP pipeline)
  - `GET /dashboard-token` — mint SP OAuth token for embedded dashboard
- **DB connection:** `DATABASE_URL` env var (native PG role `nyc_app` with password) OR `LAKEBASE_AUTH=oauth` for local dev with Databricks CLI
- **CORS:** Allows `dbxdemonyc.com`, `www.dbxdemonyc.com`, `dx7u5ga7qr7e7.amplifyapp.com`, `localhost:3000`
- **Run locally:** `cd backend && npm install && node server.js`
- **Frontend integration:** set `REACT_APP_API_URL=http://localhost:3001` for local dev

### Backend Deployment (BLOCKER — must complete for demo)

**Target:** Amplify WEB_COMPUTE app `d1erxf8q87xlvj` (publicly accessible, no auth)

**Why NOT Databricks Apps:** Databricks Apps require authentication (302 → login page). Public visitors can't access them.

**Last build failed (Job #2):** The buildspec had `cd backend` commands, but since `appRoot: backend` is set, the build already runs from `backend/`. Fix: remove the `cd backend` from buildspec commands.

**Correct buildspec for backend Amplify app:**
```yaml
version: 1
applications:
  - appRoot: backend
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - mkdir -p .amplify-hosting/compute/default
            - cp server.js db.js package.json package-lock.json .amplify-hosting/compute/default/
            - cd .amplify-hosting/compute/default && npm ci --production
            - mkdir -p .amplify-hosting/static
            - |
              cat > .amplify-hosting/deploy-manifest.json << 'EOF'
              {
                "version": 1,
                "routes": [
                  { "path": "/*", "target": { "kind": "Compute", "src": "default" } }
                ],
                "computeResources": [
                  { "name": "default", "entrypoint": "server.js", "runtime": "nodejs18.x" }
                ],
                "framework": { "name": "express", "version": "4.21.2" }
              }
              EOF
      artifacts:
        baseDirectory: .amplify-hosting
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
```

**Env vars needed on backend Amplify app (`d1erxf8q87xlvj`):**
```
DATABASE_URL=postgresql://nyc_app:<password>@ep-ancient-bread-d15lax3a.database.us-west-2.cloud.databricks.com/databricks_postgres?sslmode=require
DATABRICKS_WORKSPACE_URL=https://dbc-eca83c32-b44b.cloud.databricks.com
DATABRICKS_SP_CLIENT_ID=4ae0de5c-dc08-49e8-9491-30ae1e81ecbd
DATABRICKS_SP_CLIENT_SECRET=<SP_SECRET_IN_BACKEND_ENV>
```

**After backend deploys:**
1. Set `REACT_APP_API_URL=https://d1erxf8q87xlvj.amplifyapp.com` on frontend Amplify app (`dx7u5ga7qr7e7`)
2. Trigger frontend rebuild
3. Test end-to-end: registration → LakeBase → dashboard charts + map

### Important Note on Bi-Directional Sync

**LakeBase → Delta Lake (forward CDC sync) is in Private Preview as of Feb 2026.** The two GA options for getting LakeBase data into the Lakehouse are:

1. **Register LakeBase as a UC Catalog** → enables federated queries from SQL Warehouses/notebooks + you can create a **managed streaming table** from the registered catalog (this is the recommended approach)
2. **Lakehouse Federation** → create a foreign catalog via `CREATE CONNECTION TYPE postgresql` + `CREATE FOREIGN CATALOG`

For the **reverse direction** (Delta → LakeBase Postgres), use **Synced Tables** with `CONTINUOUS` mode (GA, ~15s refresh).

**Recommendation:** Register LakeBase catalog in UC → create streaming table for `event_registrations` → NLP job reads from streaming table → writes to `topic_analysis` Delta table → Synced Table pushes `topic_analysis` back to LakeBase Postgres → frontend reads both tables from Postgres.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React (CRA) + Tailwind CDN | Single-page app, 2 tabs (/ and /dashboard) |
| Mapping | react-leaflet + CARTO tiles | Borough-level choropleth with GeoJSON overlay |
| Charts | recharts | Borough bar chart, location pie chart, responses table |
| Dashboard Embed | @databricks/aibi-client SDK | Embeds Lakeview dashboard via SP token |
| Frontend Hosting | AWS Amplify (Static) + Route 53 | `dx7u5ga7qr7e7`, dbxdemonyc.com |
| Backend | Express.js (Node.js) | REST API proxying to LakeBase Postgres |
| Backend Hosting | AWS Amplify (WEB_COMPUTE) | `d1erxf8q87xlvj` — publicly accessible, no auth wall |
| Backend DB | LakeBase (Managed Postgres, Autoscaling) | Primary data store |
| Data Platform | Databricks (Unity Catalog, SQL Warehouse) | Analytics + embedded dashboard |
| Auth for Embed | Service Principal (OAuth client credentials) | SP: `nyc-demo-dashboard-embed` |

### API Layer Decision (RESOLVED)

**Decision: Express.js backend on Amplify WEB_COMPUTE** (`d1erxf8q87xlvj`).

Why NOT Databricks Apps: Databricks Apps require authentication (302 redirect to login). Public visitors at dbxdemonyc.com won't be authenticated, so the backend must be publicly accessible. Amplify WEB_COMPUTE gives us a serverless Node.js backend with no auth wall.

The backend connects to LakeBase via `DATABASE_URL` (native PG role with password) and mints SP OAuth tokens for the embedded dashboard.

### Frontend API Contract (for backend developer)

The frontend (`frontend/src/services/api.js`) is built and expects the following endpoints at `REACT_APP_API_URL`:

**POST `/registrations`** — Submit a new registration
```json
// Request body:
{
  "user_id": "uuid-string",           // Generated client-side via crypto.randomUUID()
  "location_type": "nyc",             // "nyc" | "ny_state" | "other_state"
  "borough": "Manhattan",             // null if not NYC
  "neighborhood": "SoHo",             // null if not NYC
  "state": null,                      // null if NYC, "New York" if ny_state, state name otherwise
  "reason": "I want to learn about building AI apps on Databricks"
}
// Response: 200 OK with the saved record
```

**GET `/registrations`** — Fetch all registrations (for dashboard/map)
```json
// Response: array of registration objects
```

**Behavior when no API is configured:** The frontend logs submissions to `console.log` and still shows the confirmation page. This lets the UI work standalone for development/demo prep.

### Frontend Design System

The frontend uses the same design language as [dbx4startups.com](https://dbx4startups.com/):
- **Tailwind CSS** via CDN (configured in `public/index.html`)
- **Font:** DM Sans (400, 500, 700) from Google Fonts
- **Icons:** Font Awesome 6
- **Colors:** Lava (#FF7A5C / #FF5F46 / #FF3621), Navy (#1B3139 / #0B2026), Oat (#F9F7F4 / #EEEDE9)
- **Patterns:** White cards with shadows, lava gradient heroes, rounded-xl corners, clean spacing

---

## Repo Structure

```
nyc_app/
├── CLAUDE.md                          # This file
├── .gitignore                         # ✅ Built (node_modules, .env, build/, etc.)
├── .env.example                       # ✅ Built (template for all env vars)
├── frontend/                          # ✅ BUILT — React app (CRA)
│   ├── package.json
│   ├── postcss.config.js
│   ├── public/
│   │   └── index.html                 # Tailwind CDN + DM Sans + Font Awesome
│   ├── src/
│   │   ├── App.js                     # React Router: / (register) and /dashboard
│   │   ├── index.js                   # Entry point
│   │   ├── index.css                  # Minimal base styles (Tailwind via CDN)
│   │   ├── components/
│   │   │   ├── Registration/
│   │   │   │   ├── RegistrationFlow.jsx    # Orchestrator: manages step state + form data
│   │   │   │   ├── LocationSelector.jsx    # Step 1: NYC / NY State / Other State cards
│   │   │   │   ├── BoroughSelector.jsx     # Step 2a: Borough + Neighborhood dropdowns
│   │   │   │   ├── StateSelector.jsx       # Step 2c: US state dropdown
│   │   │   │   ├── ReasonInput.jsx         # Step 3: Free-text textarea (10-500 chars)
│   │   │   │   └── Confirmation.jsx        # Step 4: Success + link to dashboard
│   │   │   ├── Dashboard/
│   │   │   │   ├── DashboardPage.jsx       # Full dashboard: stats + map + charts + embed
│   │   │   │   ├── NYCMap.jsx              # react-leaflet borough choropleth
│   │   │   │   ├── RegistrationCharts.jsx  # recharts: BoroughChart, LocationPieChart, RecentResponsesTable
│   │   │   │   └── EmbeddedDashboard.jsx   # @databricks/aibi-client SDK embed
│   │   │   └── common/
│   │   │       └── Header.jsx              # Nav bar with Register/Dashboard tabs
│   │   ├── data/
│   │   │   ├── neighborhoods.json          # ✅ Borough → neighborhood mapping (curated)
│   │   │   └── us-states.json              # ✅ 50 states + DC
│   │   └── services/
│   │       └── api.js                      # ✅ API client (see Frontend API Contract below)
├── backend/                           # ✅ BUILT — Express.js API
│   ├── package.json
│   ├── server.js                      # Express server (registrations + dashboard-token + CORS)
│   ├── db.js                          # Postgres pool (DATABASE_URL or OAuth)
│   └── .env                           # Local env (not committed)
├── databricks/                        # ⬜ TODO
│   ├── setup/
│   │   ├── 01_create_lakebase_tables.sql
│   │   ├── 02_register_uc_catalog.py
│   │   ├── 03_create_streaming_table.sql
│   │   ├── 04_create_synced_table.py
│   │   └── 05_create_dashboard.sql
│   ├── jobs/
│   │   └── nlp_streaming_job.py
│   └── notebooks/
│       ├── exploration.py
│       └── demo_reset.py
├── scripts/                           # ⬜ TODO
│   ├── setup.sh
│   ├── seed_data.sh
│   └── teardown.sh
└── README.md                          # ⬜ TODO
```

---

## Data Model

### Table: `event_registrations` (LakeBase — primary write target)

```sql
CREATE TABLE IF NOT EXISTS public.event_registrations (
    user_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_type   VARCHAR(20) NOT NULL,       -- 'nyc' | 'ny_state' | 'other_state'
    borough         VARCHAR(50),                 -- Only if location_type = 'nyc'
    neighborhood    VARCHAR(100),                -- Only if location_type = 'nyc'
    state           VARCHAR(50),                 -- Only if location_type != 'nyc'
    reason          TEXT NOT NULL,               -- Free-text: "What brought you here today?"
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for dashboard queries
CREATE INDEX idx_registrations_borough ON public.event_registrations(borough);
CREATE INDEX idx_registrations_created ON public.event_registrations(created_at);
```

### Table: `topic_analysis` (Written by Databricks NLP job → synced back to LakeBase)

```sql
-- This table is created as a Synced Table (read-only in Postgres)
-- Source: Unity Catalog Delta table written by the NLP streaming job
-- Schema will match the Delta table:

-- topic_id        INT           (PK for sync)
-- topic_label     VARCHAR(200)  (e.g., "AI/ML Development", "Data Engineering")
-- topic_count     INT           (number of registrations classified under this topic)
-- top_words       TEXT          (comma-separated top keywords)
-- updated_at      TIMESTAMPTZ   (when the NLP job last refreshed)
```

### Table: `registration_topics` (Written by Databricks NLP job → synced back to LakeBase)

```sql
-- Optional: per-registration topic assignment for map coloring
-- Synced Table from Delta

-- user_id         UUID          (FK to event_registrations, PK for sync)
-- assigned_topic  VARCHAR(200)  (the topic this registration was classified into)
-- confidence      FLOAT         (model confidence score)
-- updated_at      TIMESTAMPTZ
```

---

## NYC Location Data

### Source
Download borough and neighborhood boundaries from **NYC OpenData**:
- **Neighborhood Tabulation Areas (NTAs):** https://data.cityofnewyork.us/City-Government/Neighborhood-Tabulation-Areas-NTA-/cpf4-rkhq
- **Borough Boundaries:** https://data.cityofnewyork.us/City-Government/Borough-Boundaries/7t3b-ywvw

### Borough List
```json
["Manhattan", "Brooklyn", "Queens", "The Bronx", "Staten Island"]
```

### Neighborhood Mapping
Download the NTA dataset and extract a curated mapping of `borough → [neighborhoods]`. Aim for **15-25 neighborhoods per borough** (the most well-known ones). Store in `frontend/src/data/neighborhoods.json`.

Format:
```json
{
  "Manhattan": ["Lower East Side", "East Village", "Greenwich Village", "SoHo", "Tribeca", "Chelsea", "Midtown", "Upper East Side", "Upper West Side", "Harlem", "Washington Heights", "Inwood", "Financial District", "Chinatown", "Hell's Kitchen"],
  "Brooklyn": ["Williamsburg", "Greenpoint", "Fort Greene", "Park Slope", "DUMBO", "Brooklyn Heights", "Bed-Stuy", "Bushwick", "Crown Heights", "Sunset Park", "Bay Ridge", "Flatbush", "Prospect Heights", "Red Hook", "Cobble Hill"],
  "Queens": ["Astoria", "Long Island City", "Jackson Heights", "Flushing", "Forest Hills", "Ridgewood", "Sunnyside", "Woodside", "Jamaica", "Bayside", "Elmhurst", "Corona", "Rockaway Beach"],
  "The Bronx": ["South Bronx", "Mott Haven", "Fordham", "Riverdale", "Kingsbridge", "Pelham Bay", "Tremont", "Concourse", "Hunts Point", "Norwood"],
  "Staten Island": ["St. George", "Stapleton", "Tottenville", "Great Kills", "New Dorp", "West Brighton", "Port Richmond"]
}
```

### US States List
Standard 50 states + DC. Store in `frontend/src/data/us-states.json`.

---

## Frontend Specification

### Tab 1: Registration Flow (Home — `/`)

A clean, step-by-step registration wizard. No authentication required. Each user gets a UUID generated client-side via `crypto.randomUUID()`.

#### Step 1: Location Selection
- **Header:** "Welcome to [Event Name]! Where are you joining us from?"
- **Three options (large clickable cards):**
  1. 🏙️ "I'm from NYC"
  2. 🗽 "I'm from New York State (outside NYC)"
  3. 🇺🇸 "I'm from outside New York"

#### Step 2a: NYC Flow
- **Borough dropdown:** Manhattan, Brooklyn, Queens, The Bronx, Staten Island
- **Neighborhood dropdown:** Populated dynamically based on borough selection (from `neighborhoods.json`)
- Both required before proceeding

#### Step 2b: NY State (outside NYC) Flow
- **Display:** "You're from New York State — nice! We're focused on NYC neighborhoods for our map, but we're glad you're here!"
- **State is auto-set** to "New York"
- Proceed to Step 3

#### Step 2c: Other State Flow
- **State dropdown:** All 50 US states + DC
- Proceed to Step 3

#### Step 3: Reason
- **Header:** "What brought you to this event today? What's the main thing you want to learn?"
- **Open text area** (max 500 chars, min 10 chars)
- Submit button

#### Step 4: Confirmation
- "Thanks for registering! 🎉"
- Show their user ID (small, subtle)
- "Check out the live dashboard to see who's here →" (link to Dashboard tab)

#### On Submit
- Generate UUID client-side
- POST to API → INSERT into `event_registrations` in LakeBase
- Redirect to confirmation

### Tab 2: Live Dashboard (`/dashboard`)

Full dashboard layout (top to bottom):

#### Stats Bar (3 counters)
- Total Registered | From NYC | Boroughs Represented

#### NYC Registration Map (react-leaflet)
- **Map type:** Borough-level choropleth using CARTO light basemap
- **GeoJSON:** `public/nyc_boroughs.geojson` (from ArcGIS, simplified)
- **Color scale:** Lava gradient (oat → #FFD4CC → #FF7A5C → #FF5F46 → #FF3621)
- **Tooltip on hover:** Borough name + registration count
- **Auto-refresh:** Polls `/registrations` every 10 seconds

#### Charts Row (2-column grid, recharts)
- **Left:** Bar chart — Registrations by Borough (sorted descending, lava colors)
- **Right:** Donut chart — Where Are Attendees From? (NYC / NY State / Other State)

#### Embedded Databricks AI/BI Dashboard
- **SDK:** `@databricks/aibi-client` (not iframe)
- **Auth:** Fetches SP token from backend `GET /dashboard-token`
- **Fallback:** Shows placeholder if backend not available

#### Recent Responses Table
- Last 10 responses with Location + Reason columns

---

## Databricks Setup Sequence

### Step 1: Provision LakeBase Instance
- Create a LakeBase Provisioned instance (or Autoscaling if available)
- Region: `us-east-1` (closest to NYC)
- Create the `event_registrations` table using DDL above
- Note connection credentials

### Step 2: Register LakeBase in Unity Catalog
```python
# databricks/setup/02_register_uc_catalog.py
from databricks.sdk import WorkspaceClient
from databricks.sdk.service.database import DatabaseCatalog

w = WorkspaceClient()

catalog = w.database.create_database_catalog(
    DatabaseCatalog(
        name="__UC_CATALOG__",
        database_instance_name="__LAKEBASE_INSTANCE__",
        database_name="__LAKEBASE_DB__",
        create_database_if_not_exists=True
    )
)
```

### Step 3: Create Streaming Table (LakeBase → Delta)
From the registered UC catalog, create a managed streaming table on `event_registrations` so the NLP job can read from Delta with streaming semantics.

```sql
-- In Databricks SQL or notebook
-- Navigate to the registered LakeBase catalog > public schema > event_registrations
-- Click Create > Streaming Table
-- This creates a Delta streaming table that continuously ingests from the LakeBase Postgres source
```

### Step 4: Create NLP Streaming Job
```python
# databricks/jobs/nlp_streaming_job.py
# Structured Streaming job that:
# 1. Reads from the streaming table (event_registrations)
# 2. Runs ML classification on the `reason` column
# 3. Writes aggregated topic counts to a Delta table: topic_analysis
# 4. Optionally writes per-registration topic to: registration_topics

# MODEL TBD — placeholder for now. Options:
# - sklearn LDA (simple, fast)
# - Zero-shot classification via Databricks Foundation Model (more accurate)
# - Simple keyword/regex classifier (fastest, good enough for demo)
```

### Step 5: Create Synced Table (Delta → LakeBase Postgres)
```python
# databricks/setup/04_create_synced_table.py
from databricks.sdk import WorkspaceClient
from databricks.sdk.service.database import (
    SyncedDatabaseTable, SyncedTableSpec, NewPipelineSpec,
    SyncedTableSchedulingPolicy
)

w = WorkspaceClient()

# Sync topic_analysis Delta table back to LakeBase Postgres
synced = w.database.create_synced_database_table(
    SyncedDatabaseTable(
        name="__UC_CATALOG__.__SCHEMA__.topic_analysis",
        spec=SyncedTableSpec(
            source_table_full_name="__UC_ANALYTICS_CATALOG__.__UC_ANALYTICS_SCHEMA__.topic_analysis",
            primary_key_columns=["topic_id"],
            scheduling_policy=SyncedTableSchedulingPolicy.CONTINUOUS,
            new_pipeline_spec=NewPipelineSpec(
                storage_catalog="__UC_ANALYTICS_CATALOG__",
                storage_schema="__UC_ANALYTICS_SCHEMA__"
            )
        ),
    )
)
```

### Step 6: Create AI/BI Dashboard
- Create a Databricks SQL Dashboard with:
  - Bar chart: `SELECT assigned_topic, COUNT(*) as count FROM topic_analysis GROUP BY assigned_topic ORDER BY count DESC`
  - Set auto-refresh to 10-15 seconds
- Get the embed/share URL for iframe

### Step 7: Wire Up Frontend
- Point API service to LakeBase connection
- Embed Dashboard URL
- Deploy to Amplify

---

## Environment Variables

### Backend (`backend/.env` for local, Amplify env vars for production)
```env
# Option A: CONNECTION STRING (production — Amplify WEB_COMPUTE)
DATABASE_URL=postgresql://nyc_app:<password>@ep-ancient-bread-d15lax3a.database.us-west-2.cloud.databricks.com/databricks_postgres?sslmode=require

# Option B: INDIVIDUAL VARS (local dev with Databricks OAuth)
LAKEBASE_HOST=ep-ancient-bread-d15lax3a.database.us-west-2.cloud.databricks.com
LAKEBASE_PORT=5432
LAKEBASE_DB=databricks_postgres
LAKEBASE_USER=jwneil17@gmail.com
LAKEBASE_AUTH=oauth
DATABRICKS_PROFILE=dbc-eca83c32-b44b

# Service Principal for dashboard embed (both local + production)
DATABRICKS_WORKSPACE_URL=https://dbc-eca83c32-b44b.cloud.databricks.com
DATABRICKS_SP_CLIENT_ID=4ae0de5c-dc08-49e8-9491-30ae1e81ecbd
DATABRICKS_SP_CLIENT_SECRET=<SP_SECRET_IN_BACKEND_ENV>

PORT=3001
```

### Frontend (Amplify env vars — baked into build)
```env
REACT_APP_API_URL=https://d1erxf8q87xlvj.amplifyapp.com  # Set once backend is deployed
```

---

## Priority / Build Order

### P0 — Must Have for Thursday (MVP)
1. ✅ **DONE** Frontend registration flow (4-step wizard) — live at dbxdemonyc.com
2. ✅ **DONE** LakeBase table creation + backend API (Express.js) — `backend/`
3. ✅ **DONE** Registration data visible in LakeBase / queryable (verified locally)
4. ✅ **DONE** Dashboard tab with react-leaflet choropleth map + recharts charts + auto-refresh 10s
5. ✅ **DONE** Databricks AI/BI Dashboard (Lakeview) created + AIBI SDK embed component
6. ✅ **DONE** Service Principal for public dashboard embedding
7. ✅ **DONE** Register LakeBase in UC — catalog `nyc_demo_lakebase`
8. **🔴 BLOCKER** Deploy backend to Amplify WEB_COMPUTE (`d1erxf8q87xlvj`) — fix buildspec, add SP env vars
9. **🔴 BLOCKER** Set `REACT_APP_API_URL` on frontend Amplify + rebuild — depends on #8

### P1 — Should Have (makes demo impressive)
10. ⬜ Demo reset script (TRUNCATE + seed 5-10 fake registrations)
11. ⬜ Seed data script with realistic fake data for testing

### P2 — Nice to Have (NLP pipeline)
12. ⬜ Streaming NLP job classifying reasons into topics
13. ⬜ Synced Table: topic_analysis Delta → LakeBase
14. ⬜ Topic-colored choropleth (color by topic, not just density)

### P3 — Polish
15. ⬜ Teardown script
16. ⬜ Comprehensive README for reproducibility

---

## Demo Reset Script

```python
# databricks/notebooks/demo_reset.py
# Run before the presentation to clear all data

# 1. TRUNCATE event_registrations in LakeBase
# 2. Clear/reset the streaming table
# 3. Clear topic_analysis Delta table
# 4. Optionally seed 5-10 fake registrations so the dashboard isn't empty

# Connection to LakeBase:
import psycopg2
conn = psycopg2.connect(
    host="__LAKEBASE_HOST__",
    port=5432,
    dbname="__LAKEBASE_DB__",
    user="__LAKEBASE_USER__",
    password="__LAKEBASE_PASSWORD__",
    sslmode="require"
)
cur = conn.cursor()
cur.execute("TRUNCATE TABLE public.event_registrations;")
conn.commit()
cur.close()
conn.close()
```

---

## Key Design Decisions

1. **Frontend-first architecture:** React app is the primary interface. Express.js backend proxies to LakeBase. Databricks handles analytics + embedded dashboard.

2. **UUID generation is client-side:** `crypto.randomUUID()` — no auth, no login. Simple for a demo.

3. **react-leaflet for the map (not Kepler.gl):** Kepler.gl had peer dependency conflicts with React 19 (react-palm, enzyme). react-leaflet is lightweight, no API key needed, no Redux dependency.

4. **recharts + AIBI SDK (not iframe):** Recharts provides immediate visualization from our API data (no Databricks auth needed). The `@databricks/aibi-client` SDK embeds the native Databricks dashboard using a service principal token — better UX than an iframe.

5. **Amplify WEB_COMPUTE for backend (not Databricks Apps):** Databricks Apps require authentication (302 → login). Public visitors at dbxdemonyc.com need unauthenticated access. Amplify WEB_COMPUTE is serverless, public, and simple.

6. **Service Principal for dashboard embed:** Dedicated SP (`nyc-demo-dashboard-embed`) with minimal permissions. Backend mints tokens via OAuth client credentials flow. Tokens are cached and auto-refreshed.

7. **Polling, not WebSockets:** For <100 users, polling every 10 seconds is perfectly fine and much simpler.

8. **NLP is decoupled (P2):** The demo works without it. Recharts shows data from the API directly. When NLP is ready, it enhances the experience but isn't blocking.

---

## Multi-Claude Collaboration Workflow

> **IMPORTANT: All Claude sessions MUST follow this workflow to avoid merge conflicts.**

Multiple Claude Code sessions may work on this repo concurrently. Each session operates on its own branch and merges to `main` frequently.

### Branch Convention
- **Claude 1** (frontend/dashboard): works on `claude-1` branch (or `main` directly if solo)
- **Claude 2** (backend/infra): works on `claude-2` branch
- **Additional sessions**: use `claude-N` naming (e.g., `claude-3`)

### Required Git Workflow (every session must follow)

**At the start of your session:**
```bash
# 1. Make sure you're on your branch (create if it doesn't exist)
git checkout claude-N 2>/dev/null || git checkout -b claude-N

# 2. Pull latest main and rebase your branch on top
git fetch origin
git rebase origin/main
```

**Before every commit (and at minimum every 15-20 minutes of active work):**
```bash
# 1. Fetch latest main
git fetch origin

# 2. Rebase your branch onto main to catch other Claude's changes
git rebase origin/main

# 3. If there are conflicts, resolve them, then:
#    git add <resolved files>
#    git rebase --continue

# 4. Commit your changes on your branch
git add <files>
git commit -m "your message"

# 5. Push your branch
git push origin claude-N --force-with-lease

# 6. Merge to main (fast-forward if possible)
git checkout main
git pull origin main
git merge claude-N
git push origin main

# 7. Switch back to your branch
git checkout claude-N
```

**If merge to main fails due to conflicts:**
```bash
# Abort the merge, go back to your branch, rebase, and resolve
git merge --abort
git checkout claude-N
git rebase origin/main
# Resolve conflicts, then retry the merge
```

### Rules
1. **Never force-push to `main`** — only force-push your own `claude-N` branch
2. **CLAUDE.md is a shared file** — be careful editing it. Prefer appending to sections rather than rewriting them. If you see another Claude's updates, preserve them.
3. **Commit frequently, merge frequently** — small merges are easier to resolve than big ones
4. **Check `git log origin/main` before merging** — understand what the other Claude has done
5. **If you see conflicts in CLAUDE.md**, the other Claude's infrastructure/status updates take priority for their sections — don't overwrite their progress markers

### Ownership Boundaries
To minimize conflicts, each Claude session should primarily edit files in its own domain:
- **Claude 1 (frontend):** `frontend/`, dashboard-related sections of CLAUDE.md
- **Claude 2 (backend/infra):** `backend/`, `databricks/`, `scripts/`, `.env.example`, infra sections of CLAUDE.md

---

## Development Workflow

1. **Clone repo, install ai-dev-kit** (follow https://github.com/databricks-solutions/ai-dev-kit)
2. **Fill in Open Infrastructure Questions** above
3. **Run setup scripts** in order (01 → 05)
4. **`cd frontend && npm install && npm start`** for local development
5. **Start backend:** `cd backend && npm install && npm run dev`
6. **Deploy to Amplify** via git push to `main` (Amplify auto-builds from `main` branch)
7. **Test end-to-end:** Submit registration → see it in LakeBase → see it on dashboard

---

## References

- [Databricks ai-dev-kit](https://github.com/databricks-solutions/ai-dev-kit)
- [LakeBase Docs](https://docs.databricks.com/aws/en/oltp/)
- [LakeBase Synced Tables (Reverse ETL)](https://docs.databricks.com/aws/en/oltp/instances/sync-data/sync-table)
- [Register LakeBase in UC](https://docs.databricks.com/aws/en/oltp/instances/register-uc)
- [Kepler.gl React](https://github.com/keplergl/kepler.gl/tree/master/src/components)
- [NYC OpenData NTAs](https://data.cityofnewyork.us/City-Government/Neighborhood-Tabulation-Areas-NTA-/cpf4-rkhq)
- [NYC OpenData Borough Boundaries](https://data.cityofnewyork.us/City-Government/Borough-Boundaries/7t3b-ywvw)
- [LakeBase Blog: Transactional Data Layer for Apps](https://www.databricks.com/blog/how-use-lakebase-transactional-data-layer-databricks-apps)
