#!/usr/bin/env bash
# demo_reset.sh — Clear all registrations from LakeBase before a demo
#
# Usage:
#   ./scripts/demo_reset.sh                     # Uses Databricks OAuth (local dev)
#   DATABASE_URL="postgresql://..." ./scripts/demo_reset.sh   # Uses connection string
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"

echo "=== NYC Demo Reset ==="

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

echo ""
echo "Current row count:"
psql "$CONN" -t -c "SELECT COUNT(*) FROM event_registrations;"

echo ""
read -p "Are you sure you want to DELETE ALL registrations? (y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  psql "$CONN" -c "TRUNCATE TABLE event_registrations;"
  echo "All registrations deleted."
  echo ""
  echo "New row count:"
  psql "$CONN" -t -c "SELECT COUNT(*) FROM event_registrations;"
else
  echo "Aborted."
fi
