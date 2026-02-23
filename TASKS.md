# TASKS.md — Active Task Board

> **This is the single source of truth for what needs to be done.**
> Agents: Pick up tasks from here. Update status when you start/finish.
> Coordinator: Add new tasks here. Agents should check this file at the start of every session.

## How to Use
- **Claiming a task:** Change status to `IN PROGRESS` and add your agent name (e.g., `Claude 1`)
- **Completing a task:** Change status to `DONE`, add completion notes, and log details in PROGRESS.md
- **Blocked?** Mark as `BLOCKED`, note why, and move on to something else
- **New work discovered?** Add it to the Backlog section and tag the coordinator

---

## Active Tasks — Claude 1 (Frontend)

### Task 8 — Verify AIBI dashboard embed is rendering on production
- **Owner:** Claude 1
- **Status:** TODO
- **Priority:** P1
- **Details:**
  - Visit `https://dbxdemonyc.com/dashboard` and scroll to "Databricks AI/BI Dashboard" section
  - The component fetches an SP token from `/dashboard-token` (confirmed working) then uses `@databricks/aibi-client` SDK
  - Check if the dashboard renders inline or shows the fallback placeholder
  - If fallback shows, check browser console for errors (CORS on workspace, token scope, SDK init)
  - If embed can't be fixed easily, add a direct link fallback to the published dashboard
- **Acceptance criteria:** Databricks dashboard renders inline on /dashboard showing registration data
- **Fallback URL:** `https://dbc-eca83c32-b44b.cloud.databricks.com/dashboardsv3/01f1103d19bc175083fbb5392f987e10`

### Task 9 — Mobile responsiveness check and polish
- **Owner:** Claude 1
- **Status:** TODO
- **Priority:** P1
- **Details:**
  - Test registration flow at 375px width: cards stack, dropdowns full-width, textarea usable
  - Test dashboard at 375px: stats bar (3-col might be too tight), map zoomable, charts scale, table scrollable
  - Fix any overflow/cut-off issues
- **Acceptance criteria:** Registration + dashboard usable on phone-sized screen (375px) with no overflow

---

## Active Tasks — Claude 3 (UI Polish)

> **Claude 3 rules:** You ONLY touch UI/styling. No logic, no API changes, no backend. See CLAUDE.md "Claude 3 — UI Polish Agent Rules" for full constraints.
> **Branch:** `claude-3`
> **Files you can edit:** `frontend/src/components/**/*.jsx`, `frontend/src/index.css`, `frontend/public/index.html` (Tailwind config only)

### Task 9 — Mobile responsiveness check and polish
- **Owner:** Claude 3
- **Status:** TODO
- **Priority:** P1
- **Details:**
  - Test registration flow at 375px: cards stack vertically, dropdowns full-width, textarea usable
  - Test dashboard at 375px: stats bar may need `grid-cols-1 sm:grid-cols-3`, charts row should stack, table needs scroll wrapper
  - Fix any overflow or cut-off content
  - **Only change Tailwind classes — no logic changes**
- **Acceptance criteria:** Registration + dashboard usable on 375px with no overflow

### Task 14 — Polish registration flow visual design
- **Owner:** Claude 3
- **Status:** DONE
- **Priority:** P1
- **Details:**
  - LocationSelector: hover states, lava accent on selection, smooth transitions
  - Dropdowns: consistent styling, good focus states
  - ReasonInput: character count indicator, nice focus ring
  - Confirmation: celebratory feel, clean spacing
  - Buttons: lava gradient, hover states, disabled states
  - **Design system:** Lava (#FF5F46), Navy (#1B3139), Oat (#F9F7F4), DM Sans, rounded-xl, shadow-md
  - **Only change Tailwind classes — no logic changes**
- **Acceptance criteria:** Registration flow looks polished on desktop and mobile

### Task 15 — Polish dashboard page layout and spacing
- **Owner:** Claude 3
- **Status:** IN PROGRESS
- **Priority:** P1
- **Details:**
  - Stats bar: visually balanced, large readable numbers
  - Map/charts: consistent padding, heading alignment, charts same height
  - Recent responses table: clean styling, truncate long text gracefully
  - Overall: consistent section gaps (mb-8), breathing room
  - Auto-refresh indicator: subtle but visible
  - **Design system:** Lava (#FF5F46), Navy (#1B3139), Oat (#F9F7F4), DM Sans, rounded-xl, shadow-md
  - **Only change Tailwind classes — no logic changes**
- **Acceptance criteria:** Dashboard looks clean and professional across all sections

---

## Active Tasks — Claude 2 (Backend/Infra)

_All current tasks complete. See Backlog for future work._

---

## Backlog (P3)

### Task 13 — Genie API integration: natural language Q&A on event data
- **Owner:** TBD (Claude 2 for backend, Claude 1 for frontend)
- **Status:** ROADMAP
- **Priority:** P3 / Future
- **Genie Room:** `01f110512fd015ada6b59c70c0ef42a6` ("DBX Demo NYC Genie"), warehouse `e5f11d721479f35a`
- **Room URL:** `https://dbc-eca83c32-b44b.cloud.databricks.com/genie/rooms/01f110512fd015ada6b59c70c0ef42a6?o=3590757798436003`
- **API Docs:** https://docs.databricks.com/aws/en/genie/conversation-api
- **What it does:** Adds a chat-style Q&A box to the dashboard where users ask natural language questions about the event data ("Which borough has the most registrations?") and get answers powered by Databricks Genie
- **Backend work (Claude 2):**
  - `POST /genie/ask` — proxy to Genie API: start conversation → poll for completion → return results
  - `GET /genie/result/:conv/:msg/:attachment` — fetch query results
  - Auth: SP OAuth M2M (same SP, may need Genie room permissions granted)
  - Rate limit: 5 queries/min/workspace — consider caching or debouncing
- **Frontend work (Claude 1):**
  - Chat input box on dashboard page (collapsible panel or new tab)
  - POST question → show loading spinner → display result as table or text
  - Suggested starter questions: "How many people registered from Brooklyn?", "What are the most popular topics?"
- **API flow:**
  1. `POST /api/2.0/genie/spaces/{space_id}/start-conversation` with `{"content": "<question>"}`
  2. Poll `GET .../messages/{message_id}` every 1-5s until `status = "COMPLETED"`
  3. Extract `attachment_id` from `attachments` array
  4. `GET .../query-result/{attachment_id}` for up to 5,000 rows
- **Why it's compelling:** Shows Genie as "data analyst in a box" — audience asks ad-hoc questions about their own live data. No extra infra needed.

### Task 16 — Enhanced map: neighborhood boundaries + surrounding states
- **Owner:** TBD (Claude 1 or Claude 3)
- **Status:** ROADMAP
- **Priority:** P3 / Future
- **What it does:** Two enhancements to `NYCMap.jsx`:
  1. **Neighborhood-level polygons** — replace borough-only choropleth with NTA (Neighborhood Tabulation Area) boundaries from NYC OpenData. Color individual neighborhoods by registration density. Source: https://data.cityofnewyork.us/City-Government/Neighborhood-Tabulation-Areas-NTA-/cpf4-rkhq
  2. **Surrounding state boundaries** — add GeoJSON for NY, NJ, CT, PA, MA so non-NYC registrations show on the map with a lighter fill. Source: US Census TIGER/Line or Natural Earth Data.
- **Files:** `NYCMap.jsx`, add `frontend/public/nyc_neighborhoods.geojson` + `frontend/public/us_states.geojson`
- **Notes:** Simplify GeoJSON via mapshaper.org to keep file sizes small. Need name-matching between `neighborhoods.json` and NTA GeoJSON. Consider lazy-loading larger files.

### Topic-colored choropleth on map
- **Owner:** TBD
- **Status:** ROADMAP
- **Priority:** P3
- **Details:** Color the NYC map by dominant topic per borough instead of just registration density. Depends on NLP pipeline (Task 12, done) populating `registration_topics`.

### Teardown script
- Clean up all infrastructure after the event
- Low priority — do after demo

### README.md
- Reproducibility docs for others to deploy this

---

## Completed Tasks

| # | Task | Owner | Completed | Notes |
|---|------|-------|-----------|-------|
| 1 | Set REACT_APP_API_URL on frontend + rebuild | Claude 1 | 2026-02-22 | Frontend now hits backend API |
| 2 | End-to-end smoke test | Claude 1 | 2026-02-22 | Phone test confirmed working |
| 3 | Clean up secrets + Databricks App artifacts | Claude 2 | 2026-02-22 | Deleted app.yaml, .databricks/, updated .gitignore |
| 4 | Create demo reset script | Claude 2 | 2026-02-22 | `scripts/demo_reset.sh` |
| 5 | Create seed data script | Claude 2 | 2026-02-22 | `scripts/seed_data.sh` — 25 records, idempotent |
| 6 | Rebase claude-2 onto main | Claude 2 | 2026-02-22 | Branch up to date |
| 7 | Add SP env vars to backend Amplify | Claude 2 | 2026-02-22 | All 5 env vars set, /dashboard-token works |
| 10 | Add --seed flag to demo_reset.sh | Claude 2 | 2026-02-22 | `--seed` re-seeds after truncate, `-y` skips confirmation |
| 11 | Create Databricks notebook demo reset | Claude 2 | 2026-02-22 | `databricks/notebooks/demo_reset.py` — uses UC catalog, SEED_DATA toggle |
| 12 | Build NLP topic classification pipeline | Claude 2 | 2026-02-22 | `databricks/jobs/nlp_topic_classifier.py` — Claude Haiku via FMAPI, writes to topic_analysis + registration_topics |
