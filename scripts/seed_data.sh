#!/usr/bin/env bash
# seed_data.sh — Insert 25 realistic fake registrations into LakeBase
#
# Usage:
#   ./scripts/seed_data.sh                     # Uses Databricks OAuth (local dev)
#   DATABASE_URL="postgresql://..." ./scripts/seed_data.sh   # Uses connection string
#
set -euo pipefail

export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"

echo "=== NYC Demo Seed Data ==="

# Determine connection method
if [[ -n "${DATABASE_URL:-}" ]]; then
  echo "Using DATABASE_URL connection string"
  CONN="$DATABASE_URL"
else
  echo "Using Databricks OAuth token..."
  PROFILE="${DATABRICKS_PROFILE:-dbc-eca83c32-b44b}"
  HOST="ep-ancient-bread-d15lax3a.database.us-west-2.cloud.databricks.com"
  DB="databricks_postgres"
  USER="${LAKEBASE_USER:-jwneil17@gmail.com}"

  TOKEN=$(databricks auth token -p "$PROFILE" 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
  export PGPASSWORD="$TOKEN"
  CONN="host=$HOST port=5432 dbname=$DB user=$USER sslmode=require"
fi

echo "Inserting 25 seed registrations..."

psql "$CONN" <<'SQL'
INSERT INTO event_registrations (user_id, location_type, borough, neighborhood, state, reason) VALUES
-- Manhattan (7)
('a0000001-0001-4000-8000-000000000001', 'nyc', 'Manhattan', 'SoHo', NULL, 'Building a real-time analytics platform for our fintech startup and want to learn about Lakehouse architecture'),
('a0000001-0002-4000-8000-000000000002', 'nyc', 'Manhattan', 'Midtown', NULL, 'Our team is evaluating Databricks vs Snowflake for our data warehouse migration'),
('a0000001-0003-4000-8000-000000000003', 'nyc', 'Manhattan', 'Financial District', NULL, 'Interested in how LakeBase can replace our current Postgres setup while adding Delta Lake benefits'),
('a0000001-0004-4000-8000-000000000004', 'nyc', 'Manhattan', 'Chelsea', NULL, 'Want to understand how to build production ML pipelines with MLflow and Unity Catalog'),
('a0000001-0005-4000-8000-000000000005', 'nyc', 'Manhattan', 'East Village', NULL, 'Looking into Foundation Model APIs for our customer support chatbot'),
('a0000001-0006-4000-8000-000000000006', 'nyc', 'Manhattan', 'Upper West Side', NULL, 'Need to modernize our ETL pipelines from Airflow to Databricks Workflows'),
('a0000001-0007-4000-8000-000000000007', 'nyc', 'Manhattan', 'Harlem', NULL, 'Exploring how to use AI/BI dashboards for executive reporting'),

-- Brooklyn (6)
('a0000002-0001-4000-8000-000000000001', 'nyc', 'Brooklyn', 'Williamsburg', NULL, 'We are building a marketplace app and need real-time feature serving for our recommendation engine'),
('a0000002-0002-4000-8000-000000000002', 'nyc', 'Brooklyn', 'DUMBO', NULL, 'Want to learn about streaming data pipelines with Structured Streaming'),
('a0000002-0003-4000-8000-000000000003', 'nyc', 'Brooklyn', 'Park Slope', NULL, 'Our healthcare startup needs HIPAA-compliant data platform and heard Databricks supports it'),
('a0000002-0004-4000-8000-000000000004', 'nyc', 'Brooklyn', 'Greenpoint', NULL, 'Interested in the compound AI systems approach for building agents on Databricks'),
('a0000002-0005-4000-8000-000000000005', 'nyc', 'Brooklyn', 'Bed-Stuy', NULL, 'Looking for a better way to manage data governance across our 50+ data sources'),
('a0000002-0006-4000-8000-000000000006', 'nyc', 'Brooklyn', 'Fort Greene', NULL, 'Curious about serverless SQL warehouses for our ad-hoc analytics workloads'),

-- Queens (4)
('a0000003-0001-4000-8000-000000000001', 'nyc', 'Queens', 'Astoria', NULL, 'Building an IoT platform and need to process millions of sensor events per second'),
('a0000003-0002-4000-8000-000000000002', 'nyc', 'Queens', 'Long Island City', NULL, 'Want to learn about vector search and RAG patterns for our document QA system'),
('a0000003-0003-4000-8000-000000000003', 'nyc', 'Queens', 'Flushing', NULL, 'Exploring Delta Sharing for secure data collaboration with our partners'),
('a0000003-0004-4000-8000-000000000004', 'nyc', 'Queens', 'Jackson Heights', NULL, 'Our e-commerce company needs better demand forecasting with ML'),

-- The Bronx (2)
('a0000004-0001-4000-8000-000000000001', 'nyc', 'The Bronx', 'South Bronx', NULL, 'Running a nonprofit and want to use data analytics to measure community impact'),
('a0000004-0002-4000-8000-000000000002', 'nyc', 'The Bronx', 'Fordham', NULL, 'Teaching a data engineering course and want to show students industry-standard tools'),

-- Staten Island (1)
('a0000005-0001-4000-8000-000000000001', 'nyc', 'Staten Island', 'St. George', NULL, 'Building a logistics optimization platform and need scalable compute'),

-- NY State outside NYC (2)
('a0000006-0001-4000-8000-000000000001', 'ny_state', NULL, NULL, 'New York', 'Driving down from Albany — our state agency is modernizing its data infrastructure'),
('a0000006-0002-4000-8000-000000000002', 'ny_state', NULL, NULL, 'New York', 'Coming from Rochester to learn about lakehouse for our manufacturing analytics'),

-- Other states (3)
('a0000007-0001-4000-8000-000000000001', 'other_state', NULL, NULL, 'California', 'Flew in from SF — evaluating Databricks for our Series B startup data stack'),
('a0000007-0002-4000-8000-000000000002', 'other_state', NULL, NULL, 'New Jersey', 'Just across the river — our pharma company needs better clinical trial analytics'),
('a0000007-0003-4000-8000-000000000003', 'other_state', NULL, NULL, 'Massachusetts', 'Visiting from Boston — interested in GenAI applications for our edtech platform')

ON CONFLICT (user_id) DO NOTHING;
SQL

echo ""
echo "Done! Current row count:"
psql "$CONN" -t -c "SELECT COUNT(*) FROM event_registrations;"
echo ""
echo "Breakdown by borough:"
psql "$CONN" -c "SELECT COALESCE(borough, state, location_type) as location, COUNT(*) as count FROM event_registrations GROUP BY 1 ORDER BY 2 DESC;"
