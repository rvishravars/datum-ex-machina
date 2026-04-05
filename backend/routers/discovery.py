from fastapi import APIRouter
import json
import os

router = APIRouter()

INDEX_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "index", "metadata_index.json")

@router.get("/discovery/stats")
def get_discovery_stats():
    """
    Returns aggregated metadata for the Bubble Chart.
    """
    if not os.path.exists(INDEX_PATH):
        return {"error": "Index not found. Run indexer first."}
    
    with open(INDEX_PATH, "r") as f:
        index = json.load(f)
    
    # Format for Bubble Chart (List of {id, label, value, group})
    bubbles = []
    
    # 1. Organizations from Data.Govt
    for org, count in index.get("clusters", {}).items():
        bubbles.append({
            "id": f"org-{org}",
            "label": org,
            "value": count,
            "group": "Organization",
            "color": "#4A9EFF" # Blue for Gov
        })
        
    # 2. Themes from Stats NZ (if any)
    stats_themes = {}
    for table in index.get("stats_nz_tables", []):
        theme = table.get("theme", "General Statistics")
        stats_themes[theme] = stats_themes.get(theme, 0) + 1
        
    for theme, count in stats_themes.items():
        bubbles.append({
            "id": f"theme-{theme}",
            "label": theme,
            "value": count,
            "group": "Stats Theme",
            "color": "#10B981" # Green for Stats
        })

    return {
        "last_updated": index.get("last_updated"),
        "bubbles": bubbles,
        "total_datasets": len(index.get("data_govt_packages", [])) + len(index.get("stats_nz_tables", []))
    }
