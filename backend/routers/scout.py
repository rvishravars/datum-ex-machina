import os
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pipeline.statsnz_scout import StatsNZScout
from pipeline.catalog import get_catalog, search_metadata_index

router = APIRouter()

class ExploreRequest(BaseModel):
    url: str  # This is the flowRef (e.g. STATSNZ,DF_CPI315601,1.0)
    title: Optional[str] = "Data Discovery"

class ExploreResponse(BaseModel):
    title: str
    metadata: Dict[str, Any]
    download_url: str

@router.get("/scout/catalog")
async def fetch_catalog():
    """Returns the list of verified Stats NZ datasets for students."""
    return get_catalog()

@router.get("/scout/search")
async def global_search(q: Optional[str] = "", page: int = 1):
    """Uses the metadata index to find results matching the query."""
    limit = 6
    offset = (page - 1) * limit
    
    if not q:
        # For simplicity, if no query, return curated as page 1
        curated = get_catalog()
        return {
            "results": curated,
            "total_count": len(curated),
            "limit": limit,
            "offset": offset
        }
        
    return search_metadata_index(q, offset=offset, limit=limit)

@router.post("/scout/explore")
async def explore_dataset(req: ExploreRequest):
    """
    Metadata Discovery Endpoint:
    Fetches the dataset aspects (range, count) and provides download links.
    """
    system_key = os.getenv("STATSNZ_API_KEY")
    if not system_key:
        raise HTTPException(
            status_code=500, 
            detail="Stats NZ API access is not configured on the server."
        )

    try:
        explorer = StatsNZScout(subscription_key=system_key)
        
        # 1. Fetch
        df = explorer.fetch_odata(req.url)
        
        # 2. Extract Metadata (Vital Signs)
        metadata = explorer.get_metadata(df)
        
        # 3. Construct direct download URL for the student
        # Note: The student will need their own key or we proxy it, 
        # but for simplicity we provide the ADE REST URL structure.
        download_url = f"{explorer.base_url}/rest/data/{req.url}/ALL"
        
        return {
            "title": req.title,
            "metadata": metadata,
            "download_url": download_url
        }
        
    except Exception as e:
        print(f"Discovery Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
