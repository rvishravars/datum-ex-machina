import os
import time
import requests
from pathlib import Path
from typing import List, Dict, Any

# Manual .env Loader (since python-dotenv might be missing)
def load_env_manual(path: str = ".env"):
    curr_dir = Path(__file__).resolve().parent
    # Climb up to 4 levels to find the root .env
    for _ in range(5):
        file_path = curr_dir / path
        if file_path.exists():
            try:
                with open(file_path, 'r') as f:
                    for line in f:
                        if "=" in line and not line.startswith("#"):
                            parts = line.strip().split("=", 1)
                            if len(parts) == 2:
                                os.environ[parts[0]] = parts[1]
                return
            except Exception:
                pass
        curr_dir = curr_dir.parent

load_env_manual()

# Curated Stats NZ Catalog (High Fidelity)
CURATED_ADE = [
    {
        "id": "food-price-index",
        "title": "Monthly Food Price Index",
        "description": "Tracking the cost of groceries and meals across New Zealand.",
        "category": "Economy",
        "ade_url": "STATSNZ,DF_CPI315601,1.0",
        "icon": "🍎",
        "type": "ade"
    },
    {
        "id": "rental-price-index",
        "title": "Rental Price Index",
        "description": "Analyzing trends in national and regional housing costs.",
        "category": "Society",
        "ade_url": "STATSNZ,DF_CPI315701,1.0",
        "icon": "🏠",
        "type": "ade"
    },
    {
        "id": "forestry-regional",
        "title": "Regional Forestry",
        "description": "Monitoring regional timber and forestry output.",
        "category": "Environment",
        "ade_url": "STATSNZ,AGR_AGR_001,1.0",
        "icon": "🌲",
        "type": "ade"
    },
    {
        "id": "greenhouse-gas",
        "title": "Greenhouse Gas Emissions",
        "description": "Annual air emissions from NZ industries and households.",
        "category": "Environment",
        "ade_url": "STATSNZ,DF_ENV_AC_AEI,1.0",
        "icon": "🌿",
        "type": "ade"
    }
]

class StatsNZDiscovery:
    """
    Live Discovery Engine for Stats NZ ADE using the internal Search API.
    This provides full-text indexing of datasets, including dimensions and attributes.
    """
    _cache = []
    _last_fetched = 0
    _cache_duration = 24 * 60 * 60 # 24 Hours
    
    @classmethod
    def search(cls, query: str = "", rows: int = 1000) -> List[Dict[str, Any]]:
        """
        Calls the official (internal) Search API used by the Data Explorer website.
        """
        # For empty queries, we use the 24-hour cache
        if not query and cls._cache and (time.time() - cls._last_fetched) < cls._cache_duration:
            return cls._cache

        url = "https://explore.data.stats.govt.nz/sfs/api/search?tenant=public"
        payload = {
            "lang": "en",
            "rows": rows,
            "search": query,
            "sort": "score desc, sortName asc, lastUpdated desc",
            "facets": {
                "datasourceId": ["ds-nsiws-disseminate"]
            }
        }
        
        try:
            print(f"STATS NZ SEARCH: Querying '{query}' via internal API...")
            response = requests.post(url, json=payload, timeout=15)
            if response.status_code == 200:
                body = response.json()
                dataflows = body.get("dataflows", [])
                
                results = []
                for df in dataflows:
                    df_id = df.get("dataflowId")
                    agency = df.get("agencyId", "STATSNZ")
                    version = df.get("version", "1.0")
                    title = df.get("name", df_id)
                    
                    results.append({
                        "id": f"ade-{df_id}",
                        "title": title,
                        "description": f"National Table: {df_id}",
                        "category": "National Stats",
                        "ade_url": f"{agency},{df_id},{version}",
                        "icon": "📈",
                        "type": "ade"
                    })
                
                # If this was an 'All' query, update the global cache
                if not query:
                    cls._cache = results
                    cls._last_fetched = time.time()
                    print(f"STATS NZ DISCOVERY: Cache populated with {len(results)} datasets.")
                
                return results
            else:
                print(f"STATS NZ SEARCH: API Failure {response.status_code}")
                return []
        except Exception as e:
            print(f"STATS NZ SEARCH: Connection Error: {e}")
            return []

def search_metadata_index(query: str, offset: int = 0, limit: int = 6) -> Dict[str, Any]:
    query = query.strip().lower()
    
    # 1. Fetch results from the Live Search API
    # For empty query, we fetch the first 1000 to allow browsing
    api_results = StatsNZDiscovery.search(query)
    
    all_combined = []
    
    # 2. Add Curated Matches first (only if they match the query)
    curated_urls = [c["ade_url"] for c in CURATED_ADE]
    for item in CURATED_ADE:
        if not query or query in item["title"].lower() or query in item["description"].lower():
            all_combined.append(item)
            
    # 3. Add API Results (deduplicating curated ones)
    for res in api_results:
        if res["ade_url"] not in curated_urls:
            all_combined.append(res)
                
    total_count = len(all_combined)
    results = all_combined[offset : offset + limit]
    
    return {
        "results": results,
        "total_count": total_count,
        "limit": limit,
        "offset": offset
    }

def get_catalog():
    # Only for featured list on landing
    return CURATED_ADE
