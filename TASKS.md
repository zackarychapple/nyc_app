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

## Active Tasks — Claude 2 (Backend/Infra)

### Task 12 — Build NLP topic classification pipeline (P2)
- **Owner:** Claude 2
- **Status:** IN PROGRESS
- **Priority:** P2
- **Details:**
  - Create `databricks/jobs/nlp_topic_classifier.py`
  - Read from `nyc_demo_lakebase.public.event_registrations` via UC
  - Classify `reason` into topics: "AI/ML & GenAI", "Data Engineering & ETL", "Data Warehousing & Analytics", "Platform Migration", "Startups & Building Apps", "Data Governance", "Learning & Education", "Other"
  - Use Foundation Model API (zero-shot / prompt-based — no training needed)
  - Write to `topic_analysis` table (topic_id, topic_label, topic_count, top_words, updated_at)
  - Optionally write per-registration assignments to `registration_topics` (user_id, assigned_topic, confidence, updated_at)
  - Backend `GET /topics` already wired to query `topic_analysis` — returns [] if table missing
- **Acceptance criteria:** Running the notebook populates `topic_analysis`, visible at `GET /topics`

---

## Backlog (P3)

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
