# Databricks notebook source
# MAGIC %md
# MAGIC # NLP Topic Classification Pipeline
# MAGIC
# MAGIC Classifies free-text `reason` responses from event registrations into topics
# MAGIC using the Databricks Foundation Model API (Claude Haiku).
# MAGIC
# MAGIC **What it does:**
# MAGIC 1. Reads all registrations from `nyc_demo_lakebase.public.event_registrations`
# MAGIC 2. Calls Foundation Model API to classify each `reason` into a topic
# MAGIC 3. Writes per-registration topic assignments to `registration_topics` in LakeBase
# MAGIC 4. Writes aggregated topic counts to `topic_analysis` in LakeBase
# MAGIC
# MAGIC **Run this:** After collecting registrations, or on a schedule during the event.
# MAGIC
# MAGIC **Prerequisites:**
# MAGIC - UC catalog `nyc_demo_lakebase` registered
# MAGIC - Tables `topic_analysis` and `registration_topics` exist in LakeBase
# MAGIC - Foundation Model endpoint `databricks-claude-haiku-4-5` available

# COMMAND ----------

# MAGIC %md
# MAGIC ## Configuration

# COMMAND ----------

CATALOG = "nyc_demo_lakebase"
SCHEMA = "public"
REG_TABLE = f"{CATALOG}.{SCHEMA}.event_registrations"
TOPIC_TABLE = f"{CATALOG}.{SCHEMA}.topic_analysis"
REG_TOPICS_TABLE = f"{CATALOG}.{SCHEMA}.registration_topics"

# Foundation Model endpoint (Claude Haiku — fast + cheap for classification)
MODEL_ENDPOINT = "databricks-claude-haiku-4-5"

# Topics for classification
TOPICS = [
    "AI/ML & GenAI",
    "Data Engineering & ETL",
    "Data Warehousing & Analytics",
    "Platform Evaluation & Migration",
    "Building Apps & Startups",
    "Data Governance & Security",
    "Learning & Education",
    "Other",
]

# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 1: Read registrations

# COMMAND ----------

registrations_df = spark.sql(f"""
    SELECT user_id, reason
    FROM {REG_TABLE}
    WHERE reason IS NOT NULL AND reason != ''
""")

reg_count = registrations_df.count()
print(f"Registrations to classify: {reg_count}")
display(registrations_df.limit(5))

# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 2: Set up Foundation Model API client

# COMMAND ----------

import json
import requests
import re
from collections import Counter

# Get workspace host and token for API calls
workspace_url = dbutils.notebook.entry_point.getDbutils().notebook().getContext().apiUrl().getOrElse(None)
token = dbutils.notebook.entry_point.getDbutils().notebook().getContext().apiToken().getOrElse(None)

topic_list = "\n".join(f"- {t}" for t in TOPICS)

SYSTEM_PROMPT = f"""You are a topic classifier. Given a short text about why someone is attending a data/AI event, classify it into exactly ONE of these topics:

{topic_list}

Respond with ONLY a JSON object in this exact format:
{{"topic": "<topic name>", "confidence": <0.0 to 1.0>}}

Rules:
- Pick the single best-matching topic
- Use the exact topic name from the list above
- confidence should reflect how clearly the text matches (0.7+ for clear matches, 0.4-0.7 for ambiguous)
- Use "Other" only if none of the topics fit at all"""

def classify_reason(reason_text):
    """Classify a single reason using Foundation Model API."""
    try:
        resp = requests.post(
            f"{workspace_url}/serving-endpoints/{MODEL_ENDPOINT}/invocations",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": reason_text},
                ],
                "max_tokens": 100,
                "temperature": 0.0,
            },
            timeout=30,
        )
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"].strip()
        # Parse JSON from response (handle potential markdown wrapping)
        if content.startswith("```"):
            content = content.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
        result = json.loads(content)
        topic = result.get("topic", "Other")
        confidence = float(result.get("confidence", 0.5))
        # Validate topic is in our list
        if topic not in TOPICS:
            topic = "Other"
            confidence = 0.3
        return (topic, confidence)
    except Exception as e:
        print(f"Classification error for '{reason_text[:50]}...': {e}")
        return ("Other", 0.0)

# Test with first registration
test_row = registrations_df.first()
if test_row:
    test_topic, test_conf = classify_reason(test_row.reason)
    print(f"Test: '{test_row.reason[:80]}...'")
    print(f"  -> Topic: {test_topic} (confidence: {test_conf})")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 3: Classify all registrations

# COMMAND ----------

# Collect to driver (small dataset — ~25-100 rows max for a demo)
registrations = registrations_df.collect()
print(f"Classifying {len(registrations)} registrations...")

results = []
for i, row in enumerate(registrations):
    topic, confidence = classify_reason(row.reason)
    results.append({
        "user_id": str(row.user_id),
        "reason": row.reason,
        "assigned_topic": topic,
        "confidence": confidence,
    })
    if (i + 1) % 10 == 0:
        print(f"  Classified {i + 1}/{len(registrations)}...")

print(f"Done! Classified {len(results)} registrations.")

# Show distribution
from collections import Counter as C
dist = C(r["assigned_topic"] for r in results)
for topic, count in dist.most_common():
    print(f"  {topic}: {count}")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 4: Write per-registration topic assignments to LakeBase

# COMMAND ----------

# Clear existing data
try:
    spark.sql(f"DELETE FROM {REG_TOPICS_TABLE}")
    print("Cleared existing registration_topics")
except Exception as e:
    print(f"Clear failed (may not exist yet): {e}")

# Insert each result via SQL (more reliable than saveAsTable for LakeBase UC catalog)
inserted = 0
for r in results:
    try:
        # Escape single quotes in topic names
        topic_escaped = r["assigned_topic"].replace("'", "''")
        spark.sql(f"""
            INSERT INTO {REG_TOPICS_TABLE} (user_id, assigned_topic, confidence, updated_at)
            VALUES ('{r["user_id"]}', '{topic_escaped}', {r["confidence"]}, current_timestamp())
        """)
        inserted += 1
    except Exception as e:
        print(f"Failed to insert topic for {r['user_id']}: {e}")

print(f"Inserted {inserted}/{len(results)} registration topic assignments")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Step 5: Write aggregated topic analysis to LakeBase

# COMMAND ----------

def extract_top_words(reasons, n=5):
    """Extract top N meaningful words from a list of reasons."""
    stop_words = {
        "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "by", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "shall", "can", "need", "our", "we", "i",
        "my", "me", "you", "your", "their", "its", "this", "that", "these",
        "those", "from", "into", "about", "how", "what", "which", "who",
        "want", "looking", "interested", "learn", "building", "using",
    }
    all_words = []
    for reason in reasons:
        words = re.findall(r'\b[a-z]{3,}\b', reason.lower())
        all_words.extend(w for w in words if w not in stop_words)
    return ", ".join(w for w, _ in Counter(all_words).most_common(n))

# Aggregate: group by topic, count, extract top words
topic_groups = {}
for r in results:
    topic = r["assigned_topic"]
    if topic not in topic_groups:
        topic_groups[topic] = []
    topic_groups[topic].append(r["reason"])

topic_rows = []
for topic, reasons in topic_groups.items():
    topic_rows.append({
        "topic_label": topic,
        "topic_count": len(reasons),
        "top_words": extract_top_words(reasons),
    })

# Sort by count descending
topic_rows.sort(key=lambda x: x["topic_count"], reverse=True)

print("Topic analysis summary:")
for r in topic_rows:
    print(f"  {r['topic_label']}: {r['topic_count']} registrations (top words: {r['top_words']})")

# COMMAND ----------

# Clear and write topic_analysis
try:
    spark.sql(f"DELETE FROM {TOPIC_TABLE}")
    print("Cleared existing topic_analysis")
except Exception as e:
    print(f"Clear failed (may not exist yet): {e}")

inserted = 0
for r in topic_rows:
    try:
        label_escaped = r["topic_label"].replace("'", "''")
        words_escaped = r["top_words"].replace("'", "''")
        spark.sql(f"""
            INSERT INTO {TOPIC_TABLE} (topic_label, topic_count, top_words, updated_at)
            VALUES ('{label_escaped}', {r["topic_count"]}, '{words_escaped}', current_timestamp())
        """)
        inserted += 1
    except Exception as e:
        print(f"Failed to insert topic '{r['topic_label']}': {e}")

print(f"Inserted {inserted}/{len(topic_rows)} topic analysis rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Verify Results

# COMMAND ----------

print("=== Topic Analysis ===")
display(spark.sql(f"""
    SELECT topic_label, topic_count, top_words, updated_at
    FROM {TOPIC_TABLE}
    ORDER BY topic_count DESC
"""))

# COMMAND ----------

print("=== Per-Registration Topics (sample) ===")
display(spark.sql(f"""
    SELECT r.assigned_topic, r.confidence, e.reason
    FROM {REG_TOPICS_TABLE} r
    JOIN {REG_TABLE} e ON r.user_id = e.user_id
    ORDER BY r.assigned_topic, r.confidence DESC
    LIMIT 25
"""))
