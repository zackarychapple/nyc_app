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
│                        FRONTEND (React)                             │
│                  Hosted on AWS Amplify + Route 53                   │
│                       dbxdemonyc.com                                │
│                                                                     │
│  ┌──────────────┐   ┌──────────────────┐   ┌────────────────────┐  │
│  │  Registration │   │  Dashboard Tab   │   │  Dashboard Tab     │  │
│  │  Flow (Home)  │   │  (Kepler Map)    │   │  (Embedded DBSQL)  │  │
│  └──────┬───────┘   └────────┬─────────┘   └────────┬───────────┘  │
│         │                    │                       │              │
└─────────┼────────────────────┼───────────────────────┼──────────────┘
          │ writes             │ reads                 │ iframe
          ▼                    ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     LAKEBASE (Managed Postgres)                     │
│                                                                     │
│  Table: event_registrations                                         │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ user_id | borough | neighborhood | state | reason | ts      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Table: topic_analysis (written back from Databricks ML)            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ topic_label | topic_count | top_words | updated_at           │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │  Bi-Directional Sync    │
              │  (LakeBase ↔ UC/Delta)  │
              ▼                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABRICKS LAKEHOUSE                              │
│                                                                     │
│  Unity Catalog:                                                     │
│  ├── Forward: LakeBase catalog registered in UC (read-only)         │
│  │   └── Federated queries / Streaming table from LakeBase          │
│  │       → event_registrations available as Delta/streaming table   │
│  │                                                                  │
│  ├── Streaming NLP Job (Databricks Job / Structured Streaming)      │
│  │   → Reads event_registrations from UC                            │
│  │   → Runs ML classification on `reason` text                     │
│  │   → Writes results to topic_analysis Delta table                 │
│  │                                                                  │
│  ├── Reverse Sync (Synced Table):                                   │
│  │   → topic_analysis Delta table → LakeBase Postgres               │
│  │   → Mode: CONTINUOUS (15s min refresh)                           │
│  │                                                                  │
│  └── AI/BI Dashboard (Databricks SQL)                               │
│      → Bar chart: "Reasons people are attending"                    │
│      → Reads from UC tables (federated or synced)                   │
│      → Embedded via iframe in frontend                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Open Infrastructure Questions (Owner must fill in)

> **These MUST be resolved before development begins. Update this section as you provision resources.**

| # | Question | Status | Value |
|---|----------|--------|-------|
| 1 | LakeBase instance name & connection string | ⬜ TODO | `__LAKEBASE_HOST__`, `__LAKEBASE_PORT__`, `__LAKEBASE_DB__` |
| 2 | LakeBase credentials (user/password or service principal) | ⬜ TODO | `__LAKEBASE_USER__`, `__LAKEBASE_PASSWORD__` |
| 3 | Databricks workspace URL | ⬜ TODO | `__DATABRICKS_WORKSPACE_URL__` |
| 4 | Databricks SQL Warehouse ID (for dashboard) | ⬜ TODO | `__SQL_WAREHOUSE_ID__` |
| 5 | Unity Catalog: catalog name for LakeBase registration | ⬜ TODO | `__UC_CATALOG__` |
| 6 | Unity Catalog: catalog/schema for Delta tables (NLP output) | ⬜ TODO | `__UC_ANALYTICS_CATALOG__`.`__UC_ANALYTICS_SCHEMA__` |
| 7 | AWS Amplify app ID & branch | ⬜ TODO | `__AMPLIFY_APP_ID__` |
| 8 | Route 53 hosted zone for dbxdemonyc.com | ⬜ TODO | `__ROUTE53_ZONE_ID__` |
| 9 | GitHub repo URL | ⬜ TODO | `__GITHUB_REPO__` |
| 10 | Databricks PAT or OAuth config for API calls | ⬜ TODO | `__DATABRICKS_TOKEN__` |
| 11 | LakeBase → UC: Using registered catalog + streaming table, OR Lakehouse Federation? | ⬜ TODO | (see notes below) |
| 12 | NLP model choice (LDA, zero-shot classifier, etc.) | ⬜ TODO | TBD after testing |

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
| Frontend | React (via ai-dev-kit) | Single-page app, 2 tabs |
| Mapping | Kepler.gl (React) | Choropleth of NYC boroughs/neighborhoods |
| Dashboard | Databricks AI/BI Dashboard | Embedded iframe for bar chart |
| Hosting | AWS Amplify + Route 53 | dbxdemonyc.com |
| Backend DB | LakeBase (Managed Postgres) | Primary data store |
| API Layer | Direct Postgres connection from frontend OR lightweight API | See decision below |
| Data Platform | Databricks (Unity Catalog, SQL Warehouse, Jobs) | Analytics + ML |
| Sync (Delta → PG) | Synced Tables (Continuous) | ~15s refresh |
| Sync (PG → Delta) | Registered UC Catalog + Streaming Table | Near real-time |
| ML/NLP | Databricks Streaming Job | Model TBD |
| IaC / Dev Tooling | Databricks ai-dev-kit | Claude Code skills for Databricks resources |

### API Layer Decision

The frontend needs to read/write to LakeBase Postgres. Options:

1. **LakeBase Data API (PostgREST-compatible REST)** — if available on provisioned instance, this is the simplest. Frontend calls REST endpoints directly. No backend server needed.
2. **Lightweight Express/FastAPI backend** — deployed on Amplify or as a Databricks App. Proxies requests to Postgres.
3. **Databricks Apps** — deploy a small backend app on Databricks that connects to LakeBase natively.

**Recommendation:** Use option 1 (Data API) if available. Otherwise option 2 (lightweight Node.js API deployed alongside the React app on Amplify).

---

## Repo Structure

```
dbxdemonyc/
├── CLAUDE.md                          # This file
├── README.md                          # Public-facing repo docs
├── .claude/                           # ai-dev-kit Claude skills
│   └── skills/                        # Databricks-specific skills
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx                    # Main app with tab routing
│   │   ├── index.jsx                  # Entry point
│   │   ├── components/
│   │   │   ├── Registration/
│   │   │   │   ├── RegistrationFlow.jsx    # Main registration orchestrator
│   │   │   │   ├── BoroughSelector.jsx     # Step 1: NYC vs outside
│   │   │   │   ├── NeighborhoodSelector.jsx # Step 2: Neighborhood picker
│   │   │   │   ├── StateSelector.jsx       # Step 2-alt: US state picker
│   │   │   │   ├── ReasonInput.jsx         # Step 3: Free-text "what brought you"
│   │   │   │   └── Confirmation.jsx        # Step 4: Thank you + UUID display
│   │   │   ├── Dashboard/
│   │   │   │   ├── DashboardPage.jsx       # Container for map + chart
│   │   │   │   ├── KeplerMap.jsx           # Kepler.gl choropleth component
│   │   │   │   └── EmbeddedDashboard.jsx   # Databricks AI/BI iframe embed
│   │   │   └── common/
│   │   │       ├── Header.jsx              # Nav bar with tabs
│   │   │       └── Loading.jsx             # Loading spinner
│   │   ├── data/
│   │   │   ├── boroughs.json               # NYC boroughs list
│   │   │   ├── neighborhoods.json          # Borough → neighborhood mapping (from NYC OpenData)
│   │   │   └── us-states.json              # US states list
│   │   ├── services/
│   │   │   └── api.js                      # API client (talks to LakeBase or backend)
│   │   └── styles/
│   │       └── global.css
│   └── amplify.yml                    # Amplify build config
├── backend/                           # (if needed — lightweight API proxy)
│   ├── package.json
│   ├── server.js                      # Express server
│   └── db.js                          # Postgres connection pool (pg library)
├── databricks/
│   ├── setup/
│   │   ├── 01_create_lakebase_tables.sql       # DDL for LakeBase tables
│   │   ├── 02_register_uc_catalog.py           # Register LakeBase in UC
│   │   ├── 03_create_streaming_table.sql       # Streaming table from LakeBase catalog
│   │   ├── 04_create_synced_table.py           # Synced table: Delta → LakeBase (reverse ETL)
│   │   └── 05_create_dashboard.sql             # AI/BI dashboard queries
│   ├── jobs/
│   │   └── nlp_streaming_job.py                # Structured streaming NLP classification
│   └── notebooks/
│       ├── exploration.py                      # Ad-hoc data exploration
│       └── demo_reset.py                       # Reset script for demo prep
├── scripts/
│   ├── setup.sh                       # End-to-end setup script
│   ├── seed_data.sh                   # Seed fake data for testing
│   └── teardown.sh                    # Clean up all resources
└── .env.example                       # Template for environment variables
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

Split layout:

#### Top Section: Kepler.gl Choropleth Map
- **Map type:** Choropleth of NYC neighborhoods/boroughs
- **Color intensity:** Number of registrations from each area (more red = more people)
- **Tooltip on hover:** Neighborhood name, count, top topic (if NLP results available)
- **GeoJSON source:** NYC OpenData NTA boundaries
- **Auto-refresh:** Poll LakeBase every 10 seconds for updated registration counts
- **Fallback:** If no NLP data yet, just show registration density

#### Bottom Section: Embedded Databricks AI/BI Dashboard
- **Content:** Bar chart showing "Top Reasons for Attending" (topic distribution)
- **Embed method:** Databricks Dashboard embed URL in an iframe
- **Dashboard queries from:** Unity Catalog tables (either federated from LakeBase catalog or from the Delta streaming table)
- **Auto-refresh:** Handled by Databricks dashboard refresh settings

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

```env
# .env.example

# LakeBase Postgres
LAKEBASE_HOST=__LAKEBASE_HOST__
LAKEBASE_PORT=5432
LAKEBASE_DB=__LAKEBASE_DB__
LAKEBASE_USER=__LAKEBASE_USER__
LAKEBASE_PASSWORD=__LAKEBASE_PASSWORD__
LAKEBASE_SSL=true

# Databricks
DATABRICKS_WORKSPACE_URL=__DATABRICKS_WORKSPACE_URL__
DATABRICKS_TOKEN=__DATABRICKS_TOKEN__
SQL_WAREHOUSE_ID=__SQL_WAREHOUSE_ID__

# Dashboard Embed
DASHBOARD_EMBED_URL=__DASHBOARD_EMBED_URL__

# App
REACT_APP_API_URL=__API_BASE_URL__
REACT_APP_DASHBOARD_EMBED_URL=__DASHBOARD_EMBED_URL__
```

---

## Priority / Build Order

### P0 — Must Have for Thursday (MVP)
1. ✅ Frontend registration flow (borough → neighborhood → reason → submit)
2. ✅ LakeBase table creation + API to write registrations
3. ✅ Registration data visible in LakeBase / queryable
4. ✅ Basic dashboard tab with Kepler choropleth map (registration density)
5. ✅ Embedded Databricks Dashboard (bar chart of reasons — even if raw text, not NLP-classified)

### P1 — Should Have (makes demo impressive)
6. Register LakeBase in UC + streaming table
7. Synced Table back to Postgres
8. Real-time auto-refresh on map (polling every 10s)
9. Demo reset script

### P2 — Nice to Have (NLP pipeline)
10. Streaming NLP job classifying reasons into topics
11. Topic-colored choropleth (color by topic, not just density)
12. Per-registration topic assignments synced back

### P3 — Polish
13. Seed data script with realistic fake data
14. Teardown script
15. Comprehensive README for reproducibility

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

1. **Frontend-first architecture:** The React app is the primary interface. It talks directly to LakeBase (via Data API or a thin backend). Databricks handles the analytics layer behind the scenes.

2. **UUID generation is client-side:** `crypto.randomUUID()` — no auth, no login, just session-based. Simple for a demo.

3. **Kepler.gl for the map, NOT Databricks Dashboard for the map:** Kepler gives us a beautiful, interactive choropleth directly in the React app. The Databricks Dashboard is only used for the bar chart (embedded via iframe) since the goal is to show the Databricks Dashboard product.

4. **Polling, not WebSockets:** For <100 users, polling every 10 seconds is perfectly fine and much simpler. The frontend polls LakeBase for updated registration counts and re-renders the Kepler map.

5. **NLP is decoupled:** The NLP streaming job is a separate concern. The demo works without it (just shows raw text in the bar chart). When it's ready, it enhances the experience but isn't blocking.

6. **Everything in git for reproducibility:** Setup scripts, DDL, job definitions — all committed so others can fork and recreate.

---

## Development Workflow

1. **Clone repo, install ai-dev-kit** (follow https://github.com/databricks-solutions/ai-dev-kit)
2. **Fill in Open Infrastructure Questions** above
3. **Run setup scripts** in order (01 → 05)
4. **`cd frontend && npm install && npm start`** for local development
5. **Deploy to Amplify** via git push (Amplify auto-builds from branch)
6. **Test end-to-end:** Submit registration → see it in LakeBase → see it on dashboard

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
