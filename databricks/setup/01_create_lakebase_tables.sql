-- 01_create_lakebase_tables.sql
-- Run against the nyc_demo database in the nyc-demo LakeBase instance
-- Usage: databricks psql nyc-demo -p dbc-eca83c32-b44b -- -d nyc_demo -f 01_create_lakebase_tables.sql

CREATE TABLE IF NOT EXISTS public.event_registrations (
    user_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_type   VARCHAR(20) NOT NULL,       -- 'nyc' | 'ny_state' | 'other_state'
    borough         VARCHAR(50),                 -- Only if location_type = 'nyc'
    neighborhood    VARCHAR(100),                -- Only if location_type = 'nyc'
    state           VARCHAR(50),                 -- Only if location_type != 'nyc'
    reason          TEXT NOT NULL,               -- Free-text: "What brought you here today?"
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registrations_borough ON public.event_registrations(borough);
CREATE INDEX IF NOT EXISTS idx_registrations_created ON public.event_registrations(created_at);

-- topic_analysis will be created as a Synced Table (read-only in Postgres)
-- from the Databricks NLP pipeline. Schema for reference:
--
-- CREATE TABLE public.topic_analysis (
--     topic_id        SERIAL PRIMARY KEY,
--     topic_label     VARCHAR(200),
--     topic_count     INT,
--     top_words       TEXT,
--     updated_at      TIMESTAMPTZ
-- );
