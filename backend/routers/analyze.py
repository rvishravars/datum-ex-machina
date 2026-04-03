"""
POST /api/analyze
POST /api/datasets — list built-in datasets
GET  /api/datasets/{id} — fetch a specific built-in dataset
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Literal, Optional

from pipeline.stats import compute_stats
from pipeline.narrative import map_to_storyboard
from data.datasets import DATASETS
from stories.registry import get_story

router = APIRouter()


class DataPoint(BaseModel):
    x: float  # time / categorical axis value
    label: str = ""  # optional human-readable label e.g. "2018"
    y: float  # primary measured value
    y2: Optional[float] = None  # secondary measured value (optional)


class AnalyzeRequest(BaseModel):
    id: str = "base"
    dataset: List[DataPoint]
    tier: Literal["M", "R"] = "M"
    title: str = "Untitled Dataset"
    unit: str = ""


@router.post("/analyze")
def analyze(req: AnalyzeRequest):
    if len(req.dataset) < 3:
        raise HTTPException(
            status_code=400, detail="Dataset must have at least 3 points"
        )

    story = get_story(req.id)
    raw = [
        {"x": p.x, "label": p.label or str(int(p.x)), "y": p.y, "y2": p.y2}
        for p in req.dataset
    ]
    stats = compute_stats(raw, tier=req.tier)

    # We'll pass the story object to map_to_storyboard so it can use custom voices/quizzes
    storyboard = map_to_storyboard(
        stats, tier=req.tier, title=req.title, unit=req.unit, story=story
    )
    return storyboard


@router.get("/datasets")
def list_datasets():
    return [
        {
            "id": ds["id"],
            "title": ds["title"],
            "tier": ds["tier"],
            "description": ds["description"],
            "source": ds["source"],
            "unit": ds["unit"],
            "data": ds["data"],
        }
        for ds in DATASETS
    ]


@router.get("/datasets/{dataset_id}")
def get_dataset(dataset_id: str):
    ds = next((d for d in DATASETS if d["id"] == dataset_id), None)
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return ds
