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


import os
import sys
from fastapi.responses import FileResponse

@router.get("/datasets")
def list_datasets():
    return DATASETS

@router.get("/datasets/{dataset_id}")
def get_dataset(dataset_id: str):
    ds = next((d for d in DATASETS if d["id"] == dataset_id), None)
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return ds

@router.get("/datasets/{dataset_id}/notebook")
def download_notebook(dataset_id: str):
    story = get_story(dataset_id)
    if not hasattr(story, "__class__"):
        raise HTTPException(status_code=404, detail="Story logic not found")
    
    # Get the file path of the story module
    module_name = story.__class__.__module__
    module = sys.modules.get(module_name)
    if not module or not hasattr(module, "__file__"):
        raise HTTPException(status_code=500, detail="Could not locate story source file")
    
    file_path = module.__file__
    
    return FileResponse(
        path=file_path,
        media_type="text/x-python",
        filename=f"{dataset_id}_notebook.py"
    )
