# PROGRESS.md — Development Log

> **Each agent logs what they actually did here.** This is the audit trail.
> Format: timestamp, agent name, what was done, what was verified, any issues found.
> Keep entries concise but specific enough that another agent (or the coordinator) can verify.

---

## Rules for Agents

1. **Log every significant action** — deployments, env var changes, infra changes, file deletions
2. **Include verification steps** — don't just say "done", show the command/output that proves it
3. **Flag surprises** — if you find something unexpected, log it here even if you fix it
4. **Never mark CLAUDE.md status as done unless you've verified it** — the coordinator will check

---

## Log

### 2026-02-22 — Claude 2 (Backend/Infra)

**Backend deployed to Amplify WEB_COMPUTE**
- App: `d1erxf8q87xlvj`, URL: `https://main.d1erxf8q87xlvj.amplifyapp.com`
- Buildspec set via AWS CLI (not in repo) — see CLAUDE.md for full spec
- Key gotchas discovered:
  - Amplify WEB_COMPUTE does NOT pass console env vars to compute runtime — must create `.env` file during build
  - `nodejs18.x` runtime not supported — use `nodejs20.x`
  - Don't use `applications:` with `appRoot:` format
- Env vars set: `DATABASE_URL`, `PORT`
- **NOT YET SET:** `DATABRICKS_WORKSPACE_URL`, `DATABRICKS_SP_CLIENT_ID`, `DATABRICKS_SP_CLIENT_SECRET` (see Task 7)
- Verified: `curl /health` returns `{"status":"ok","db":"connected"}`
- Verified: `curl /registrations` returns data after seeding

**Scripts created**
- `scripts/demo_reset.sh` — TRUNCATE with confirmation prompt, supports DATABASE_URL or OAuth
- `scripts/seed_data.sh` — 25 realistic registrations (7 Manhattan, 6 Brooklyn, 4 Queens, 2 Bronx, 1 Staten Island, 2 NY State, 3 other), idempotent via ON CONFLICT DO NOTHING
- Verified: Seed script ran successfully, 25 rows visible via API

**Cleanup**
- Deleted `backend/app.yaml` (contained plaintext secrets!)
- Deleted `backend/.databricks/` (wrong deployment path artifacts)
- Added both to `.gitignore`

**Task 10: --seed flag added to demo_reset.sh**
- `./scripts/demo_reset.sh --seed` — truncates and re-seeds in one command
- `./scripts/demo_reset.sh --seed -y` — skip confirmation prompt
- Calls `seed_data.sh` after truncate when `--seed` is passed

**Task 11: Databricks notebook demo reset created**
- `databricks/notebooks/demo_reset.py` — runs via UC catalog `nyc_demo_lakebase`
- `SEED_DATA = True` toggle at top of notebook
- Steps: check current state → truncate → optionally seed 25 rows → verify
- Uses `spark.sql()` for all operations (no direct PG connection needed)

### 2026-02-22 — Coordinator Review

**Findings from status check:**
- Backend reads work, writes work (tested via curl)
- Frontend has NO `REACT_APP_API_URL` set — all API calls are no-ops (returns [] for reads, logs to console for writes)
- Backend missing 3 SP env vars — `/dashboard-token` will fail
- Both agent branches (claude-1, claude-2) were stale/behind main — no active divergent work
