import os
import json
import httpx
import asyncio
from datetime import datetime
from typing import List, Dict, Any

# Configurations
STATS_NZ_API_KEY = os.getenv("STATS_NZ_API_KEY")
STATS_NZ_BASE_URL = "https://api.stats.govt.nz/adventure/v1" # Placeholder for discovery
DATA_GOVT_API_URL = "https://catalogue.data.govt.nz/api/3/action/package_search"
INDEX_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "index", "metadata_index.json")

class MetadataIndexer:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
        self.index = {
            "last_updated": None,
            "stats_nz_tables": [],
            "data_govt_packages": []
        }

    async def index_stats_nz(self):
        """
        Stats NZ OData / ADE Discovery.
        In a real scenario, this would use the subscription key.
        Since we might not have a key, we provide a placeholder or mock discovery.
        """
        if not STATS_NZ_API_KEY:
            print("WARNING: STATS_NZ_API_KEY not found. Skipping live Stats NZ index.")
            return

        headers = {"Ocp-Apim-Subscription-Key": STATS_NZ_API_KEY}
        try:
            # Note: The exact discovery endpoint for 'All Tables' in ADE
            # often requires specific product subscription.
            # Here we mock the behavior by attempting to list available structures.
            response = await self.client.get(f"{STATS_NZ_BASE_URL}/tables", headers=headers)
            if response.status_code == 200:
                self.index["stats_nz_tables"] = response.json()
            else:
                print(f"Stats NZ API Error: {response.status_code}")
        except Exception as e:
            print(f"Failed to index Stats NZ: {e}")

    async def index_data_govt(self, query: str = "New Zealand"):
        """
        Data.govt.nz CKAN API Discovery.
        Typically doesn't require a key for public metadata.
        """
        params = {
            "q": query,
            "rows": 50
        }
        try:
            response = await self.client.get(DATA_GOVT_API_URL, params=params)
            if response.status_code == 200:
                data = response.json()
                results = data.get("result", {}).get("results", [])
                
                packages = []
                for pkg in results:
                    packages.append({
                        "id": pkg.get("id"),
                        "title": pkg.get("title"),
                        "name": pkg.get("name"),
                        "organization": pkg.get("organization", {}).get("title"),
                        "notes": pkg.get("notes"),
                        "url": f"https://catalogue.data.govt.nz/dataset/{pkg.get('name')}"
                    })
                self.index["data_govt_packages"] = packages
            else:
                print(f"Data.govt.nz API Error: {response.status_code}")
        except Exception as e:
            print(f"Failed to index Data.govt.nz: {e}")

    def save_index(self):
        self.index["last_updated"] = datetime.utcnow().isoformat()
        os.makedirs(os.path.dirname(INDEX_PATH), exist_ok=True)
        with open(INDEX_PATH, "w") as f:
            json.dump(self.index, f, indent=2)
        print(f"Index saved to {INDEX_PATH}")

    async def run_full_index(self):
        print("Starting metadata indexing pipeline...")
        await asyncio.gather(
            self.index_stats_nz(),
            self.index_data_govt()
        )
        self.save_index()
        await self.client.aclose()

if __name__ == "__main__":
    indexer = MetadataIndexer()
    asyncio.run(indexer.run_full_index())
