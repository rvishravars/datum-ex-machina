"""
Quiz submission and management router.
Stores results in a local JSON file.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
import json
import os
from datetime import datetime

router = APIRouter()

RESULTS_FILE = "data/quiz_results.json"


class QuizSubmission(BaseModel):
    storyboard_title: str
    tier: str
    answers: Dict[str, str]
    summary_stats: Dict[str, Any]


@router.post("/quiz/submit")
async def submit_quiz(submission: QuizSubmission):
    """
    Submits a quiz result and stores it in the local JSON data store.
    """
    try:
        # Load existing
        if os.path.exists(RESULTS_FILE):
            with open(RESULTS_FILE, "r") as f:
                try:
                    data = json.load(f)
                except json.JSONDecodeError:
                    data = []
        else:
            data = []

        # Add new entry
        entry = {
            "timestamp": datetime.now().isoformat(),
            "storyboard_title": submission.storyboard_title,
            "tier": submission.tier,
            "answers": submission.answers,
            "summary_stats": submission.summary_stats,
        }
        data.append(entry)

        # Save back
        with open(RESULTS_FILE, "w") as f:
            json.dump(data, f, indent=4)

        return {"status": "success", "message": "Verdict archived successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/quiz/results")
async def get_results():
    """
    Retrieves all archived results.
    """
    if os.path.exists(RESULTS_FILE):
        with open(RESULTS_FILE, "r") as f:
            return json.load(f)
    return []
