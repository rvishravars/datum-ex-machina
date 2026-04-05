import os
import json
import httpx
import asyncio
from datetime import datetime, timezone
from typing import List, Dict, Any, Counter

# Configurations
STATS_NZ_API_KEY = os.getenv("STATS_NZ_API_KEY")
STATS_NZ_BASE_URL = "https://api.stats.govt.nz/adventure/v1"
DATA_GOVT_API_URL = "https://catalogue.data.govt.nz/api/3/action/package_search"
INDEX_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "index", "metadata_index.json")

class MetadataIndexer:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
        self.index = {
            "last_updated": None,
            "stats_nz_tables": [],
            "data_govt_packages": [],
            "clusters": {} # For the Bubble Chart: {Theme: Count}
        }

    async def index_stats_nz(self):
        """
        Stats NZ ADE Discovery with Thematic Clustering.
        """
        if not STATS_NZ_API_KEY:
            print("WARNING: STATS_NZ_API_KEY not found. Using development fallbacks.")
            self.index["stats_nz_tables"] = [
                {"id": "retail-trade-survey-march-2024", "title": "Retail Trade Survey", "theme": "Economic"},
                {"id": "consumer-price-index-june-2024", "title": "Consumer Price Index", "theme": "Economic"},
                {"id": "ghg-emissions-2023", "title": "Greenhouse Gas Emissions", "theme": "Environmental"}
            ]
            return

        headers = {"Ocp-Apim-Subscription-Key": STATS_NZ_API_KEY}
        try:
            # Stats NZ ADE - Attempt to list all available metadata
            response = await self.client.get(f"{STATS_NZ_BASE_URL}/metadata/tables", headers=headers)
            if response.status_code == 200:
                tables = response.json()
                # ADE often provides 'subject' or 'theme' in metadata
                self.index["stats_nz_tables"] = tables
            elif response.status_code == 502:
                print("Stats NZ API Error: 502. Service under maintenance.")
            else:
                print(f"Stats NZ API Error: {response.status_code}")
        except Exception as e:
            print(f"Failed to index Stats NZ: {e}")

    async def index_data_govt(self, query: str = "New Zealand"):
        """
        Data.govt.nz CKAN API Discovery with Organization Clustering.
        """
        params = {
            "q": query,
            "rows": 200 # Grab 200 for a more impressive bubble chart
        }
        try:
            response = await self.client.get(DATA_GOVT_API_URL, params=params)
            if response.status_code == 200:
                data = response.json()
                results = data.get("result", {}).get("results", [])
                
                packages = []
                org_counts = Counter()
                for pkg in results:
                    org = pkg.get("organization", {}).get("title", "Unknown Dept")
                    org_counts[org] += 1
                    
                    packages.append({
                        "id": pkg.get("id"),
                        "title": pkg.get("title"),
                        "name": pkg.get("name"),
                        "organization": org,
                        "notes": pkg.get("notes"),
                        "url": f"https://catalogue.data.govt.nz/dataset/{pkg.get('name')}"
                    })
                self.index["data_govt_packages"] = packages
                self.index["clusters"] = dict(org_counts)
            else:
                print(f"Data.govt.nz API Error: {response.status_code}")
        except Exception as e:
            print(f"Failed to index Data.govt.nz: {e}")

    def save_index(self):
        self.index["last_updated"] = datetime.now(timezone.utc).isoformat()
        os.makedirs(os.path.dirname(INDEX_PATH), exist_ok=True)
        with open(INDEX_PATH, "w") as f:
            json.dump(self.index, f, indent=2)
        print(f"Index saved to {INDEX_PATH}")
        print(f"Clusters discovered: {len(self.index['clusters'])} organizations.")

    async def run_full_index(self):
        print("Starting Deep Metadata Indexing pipeline...")
        await asyncio.gather(
            self.index_stats_nz(),
            self.index_data_govt()
        )
        self.save_index()
        await self.client.aclose()

if __name__ == "__main__":
    indexer = MetadataIndexer()
    asyncio.run(indexer.run_full_index())
