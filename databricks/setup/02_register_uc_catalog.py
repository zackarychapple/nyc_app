"""
02_register_uc_catalog.py — Register LakeBase Autoscaling database in Unity Catalog

For Autoscaling projects, use the database/catalogs API with:
  - database_project_id: the project UID (not the name)
  - database_branch_id: the branch UID (not the name)
  - database_name: the Postgres database name
  - name: the desired UC catalog name

This creates a MANAGED_ONLINE_CATALOG that exposes LakeBase tables as
read-only tables in Unity Catalog, queryable from SQL warehouses and notebooks.

Usage:
  python3 02_register_uc_catalog.py
"""

import json
import subprocess
import urllib.request

# Config
PROFILE = "dbc-eca83c32-b44b"
WORKSPACE_URL = "https://dbc-eca83c32-b44b.cloud.databricks.com"
CATALOG_NAME = "nyc_demo_lakebase"
PROJECT_UID = "19c5d4b9-ccd7-48af-8c19-f9c3f0163e5f"  # nyc-demo project
BRANCH_UID = "br-old-salad-d171gst3"                    # production branch
DATABASE_NAME = "databricks_postgres"


def get_token():
    r = subprocess.run(
        ["databricks", "auth", "token", "-p", PROFILE],
        capture_output=True, text=True
    )
    return json.loads(r.stdout)["access_token"]


def register_catalog():
    token = get_token()
    url = f"{WORKSPACE_URL}/api/2.0/database/catalogs"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    body = {
        "name": CATALOG_NAME,
        "database_project_id": PROJECT_UID,
        "database_branch_id": BRANCH_UID,
        "database_name": DATABASE_NAME,
    }

    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")

    try:
        resp = urllib.request.urlopen(req)
        result = json.loads(resp.read())
        print(f"Catalog '{CATALOG_NAME}' registered successfully!")
        print(json.dumps(result, indent=2))
    except urllib.request.HTTPError as e:
        error = json.loads(e.read())
        if "already exists" in error.get("message", ""):
            print(f"Catalog '{CATALOG_NAME}' already exists.")
        else:
            print(f"Error: {error}")
            raise


if __name__ == "__main__":
    register_catalog()
