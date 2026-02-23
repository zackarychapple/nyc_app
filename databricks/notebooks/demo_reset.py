# Databricks notebook source
# MAGIC %md
# MAGIC # NYC Demo Reset
# MAGIC
# MAGIC Run this notebook before the presentation to reset the demo data.
# MAGIC
# MAGIC **What it does:**
# MAGIC 1. Truncates `event_registrations` in LakeBase (via UC catalog)
# MAGIC 2. Optionally seeds 25 realistic fake registrations
# MAGIC
# MAGIC **Prerequisites:**
# MAGIC - UC catalog `nyc_demo_lakebase` registered (LakeBase → UC)
# MAGIC - SQL warehouse `00561e6c134511ad` running

# COMMAND ----------

# MAGIC %md
# MAGIC ## Configuration

# COMMAND ----------

CATALOG = "nyc_demo_lakebase"
SCHEMA = "public"
TABLE = "event_registrations"
FULL_TABLE = f"{CATALOG}.{SCHEMA}.{TABLE}"

# Set to True to insert seed data after truncating
SEED_DATA = True

# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 1: Check current state

# COMMAND ----------

current_count = spark.sql(f"SELECT COUNT(*) as cnt FROM {FULL_TABLE}").first().cnt
print(f"Current registrations: {current_count}")

# COMMAND ----------

display(
    spark.sql(f"""
        SELECT COALESCE(borough, state, location_type) as location, COUNT(*) as count
        FROM {FULL_TABLE}
        GROUP BY 1 ORDER BY 2 DESC
    """)
)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 2: Truncate all registrations

# COMMAND ----------

spark.sql(f"DELETE FROM {FULL_TABLE}")
remaining = spark.sql(f"SELECT COUNT(*) as cnt FROM {FULL_TABLE}").first().cnt
print(f"Rows after truncate: {remaining}")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 3: Seed fake data (if enabled)

# COMMAND ----------

if SEED_DATA:
    seed_rows = [
        # Manhattan (7)
        ("a0000001-0001-4000-8000-000000000001", "nyc", "Manhattan", "SoHo", None, "Building a real-time analytics platform for our fintech startup and want to learn about Lakehouse architecture"),
        ("a0000001-0002-4000-8000-000000000002", "nyc", "Manhattan", "Midtown", None, "Our team is evaluating Databricks vs Snowflake for our data warehouse migration"),
        ("a0000001-0003-4000-8000-000000000003", "nyc", "Manhattan", "Financial District", None, "Interested in how LakeBase can replace our current Postgres setup while adding Delta Lake benefits"),
        ("a0000001-0004-4000-8000-000000000004", "nyc", "Manhattan", "Chelsea", None, "Want to understand how to build production ML pipelines with MLflow and Unity Catalog"),
        ("a0000001-0005-4000-8000-000000000005", "nyc", "Manhattan", "East Village", None, "Looking into Foundation Model APIs for our customer support chatbot"),
        ("a0000001-0006-4000-8000-000000000006", "nyc", "Manhattan", "Upper West Side", None, "Need to modernize our ETL pipelines from Airflow to Databricks Workflows"),
        ("a0000001-0007-4000-8000-000000000007", "nyc", "Manhattan", "Harlem", None, "Exploring how to use AI/BI dashboards for executive reporting"),
        # Brooklyn (6)
        ("a0000002-0001-4000-8000-000000000001", "nyc", "Brooklyn", "Williamsburg", None, "We are building a marketplace app and need real-time feature serving for our recommendation engine"),
        ("a0000002-0002-4000-8000-000000000002", "nyc", "Brooklyn", "DUMBO", None, "Want to learn about streaming data pipelines with Structured Streaming"),
        ("a0000002-0003-4000-8000-000000000003", "nyc", "Brooklyn", "Park Slope", None, "Our healthcare startup needs HIPAA-compliant data platform and heard Databricks supports it"),
        ("a0000002-0004-4000-8000-000000000004", "nyc", "Brooklyn", "Greenpoint", None, "Interested in the compound AI systems approach for building agents on Databricks"),
        ("a0000002-0005-4000-8000-000000000005", "nyc", "Brooklyn", "Bed-Stuy", None, "Looking for a better way to manage data governance across our 50+ data sources"),
        ("a0000002-0006-4000-8000-000000000006", "nyc", "Brooklyn", "Fort Greene", None, "Curious about serverless SQL warehouses for our ad-hoc analytics workloads"),
        # Queens (4)
        ("a0000003-0001-4000-8000-000000000001", "nyc", "Queens", "Astoria", None, "Building an IoT platform and need to process millions of sensor events per second"),
        ("a0000003-0002-4000-8000-000000000002", "nyc", "Queens", "Long Island City", None, "Want to learn about vector search and RAG patterns for our document QA system"),
        ("a0000003-0003-4000-8000-000000000003", "nyc", "Queens", "Flushing", None, "Exploring Delta Sharing for secure data collaboration with our partners"),
        ("a0000003-0004-4000-8000-000000000004", "nyc", "Queens", "Jackson Heights", None, "Our e-commerce company needs better demand forecasting with ML"),
        # The Bronx (2)
        ("a0000004-0001-4000-8000-000000000001", "nyc", "The Bronx", "South Bronx", None, "Running a nonprofit and want to use data analytics to measure community impact"),
        ("a0000004-0002-4000-8000-000000000002", "nyc", "The Bronx", "Fordham", None, "Teaching a data engineering course and want to show students industry-standard tools"),
        # Staten Island (1)
        ("a0000005-0001-4000-8000-000000000001", "nyc", "Staten Island", "St. George", None, "Building a logistics optimization platform and need scalable compute"),
        # NY State (2)
        ("a0000006-0001-4000-8000-000000000001", "ny_state", None, None, "New York", "Driving down from Albany — our state agency is modernizing its data infrastructure"),
        ("a0000006-0002-4000-8000-000000000002", "ny_state", None, None, "New York", "Coming from Rochester to learn about lakehouse for our manufacturing analytics"),
        # Other states (3)
        ("a0000007-0001-4000-8000-000000000001", "other_state", None, None, "California", "Flew in from SF — evaluating Databricks for our Series B startup data stack"),
        ("a0000007-0002-4000-8000-000000000002", "other_state", None, None, "New Jersey", "Just across the river — our pharma company needs better clinical trial analytics"),
        ("a0000007-0003-4000-8000-000000000003", "other_state", None, None, "Massachusetts", "Visiting from Boston — interested in GenAI applications for our edtech platform"),
    ]

    columns = ["user_id", "location_type", "borough", "neighborhood", "state", "reason"]
    df = spark.createDataFrame(seed_rows, columns)
    df.write.mode("append").saveAsTable(FULL_TABLE)
    print(f"Inserted {len(seed_rows)} seed registrations")
else:
    print("Seed data disabled — set SEED_DATA = True to insert fake registrations")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Verify

# COMMAND ----------

final_count = spark.sql(f"SELECT COUNT(*) as cnt FROM {FULL_TABLE}").first().cnt
print(f"Final registration count: {final_count}")

display(
    spark.sql(f"""
        SELECT COALESCE(borough, state, location_type) as location, COUNT(*) as count
        FROM {FULL_TABLE}
        GROUP BY 1 ORDER BY 2 DESC
    """)
)
