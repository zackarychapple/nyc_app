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

## Active Tasks

_No active tasks — all P0/P1 work is complete._

---

## Backlog (P3)

### Task 13 frontend — Genie chat UI on dashboard page
- **Owner:** Claude 1
- **Status:** TODO
- **Priority:** P3
- **Details:**
  - Backend `POST /genie/ask` is DONE and deployed — accepts `{"question": "..."}`, returns `{answer, sql, columns, rows, suggested_questions}`
  - Need: chat input box on dashboard, loading spinner, answer + data table display
  - Suggested starter questions as clickable chips
- **Acceptance criteria:** Users can ask natural language questions and see Genie answers on /dashboard

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
| 13 | Genie API backend endpoint | Claude 2 | 2026-02-22 | `POST /genie/ask` — proxies to Databricks Genie, returns answer + SQL + data. SP granted CAN_RUN on Genie space. Verified on production. |
| 8 | Verify AIBI dashboard embed on production | Claude 1 | 2026-02-22 | Fixed 3 issues: SP CAN_RUN permission, 3-step scoped embed token flow, domain allowlist (`dbxdemonyc.com` added to `aibi_dash_embed_ws_apprvd_domains`). Dashboard renders inline with all charts. |
| 9 | Mobile responsiveness check and polish | Claude 1 | 2026-02-22 | Responsive Tailwind classes on Header, LocationSelector, DashboardPage, RegistrationCharts, EmbeddedDashboard. Tested at 375px. |
| 17 | Security audit: scan repo for secrets | Claude 1 | 2026-02-22 | Clean — no secrets in tracked files or git history. `.gitignore` covers `.env`, `app.yaml`, `.databricks/`, `*.png`. SP secret and DB password confirmed absent from all commits. |
