"""
Narrative Mapping Engine
Maps statistical output → panel-ordered storyboard with character assignments
and beat types. No ML — pure deterministic logic derived from the data's shape.
"""

from typing import Dict, Any, List
import numpy as np
from pipeline.stats import render_stats_chart_base64
from stories.base import BaseStory, GenericStory


def map_to_storyboard(stats: Dict[str, Any], tier: str, title: str, unit: str, story: BaseStory = None) -> Dict[str, Any]:
    """
    Produces a storyboard dict using the provided Story module or a Generic fallback.
    """
    # Use GenericStory if no specific module is provided
    active_story = story if story else GenericStory(title=title, unit=unit)
    
    points = stats["points"]
    trend = stats["trend"]
    summary = stats["summary"]
    max_change_idx = stats["max_change_index"]
    ci_bands = stats.get("confidence_bands", [])
    effect_size = stats.get("effect_size", None)

    # Determine panel count
    n = summary["n"]
    panel_count = min(max(6, n), 10) if tier == "M" else min(max(8, n), 20)

    # Sample panel-worth of points
    sampled_points = _sample_points(points, panel_count)

    # Build characters from the story module
    characters = active_story.get_characters(stats)

    # Build panels
    panels = []
    for i, pt in enumerate(sampled_points):
        beat = _classify_beat(pt, i, len(sampled_points), trend["direction"], max_change_idx)
        panel = _build_panel(
            panel_index=i,
            data_point=pt,
            beat=beat,
            stats=stats,
            tier=tier,
            unit=unit,
            ci_bands=ci_bands,
            story=active_story
        )
        panels.append(panel)

    return {
        "title": title,
        "tier": tier,
        "unit": unit,
        "characters": characters,
        "summary_stats": {
            "mean": summary["mean"],
            "median": summary["median"],
            "std": summary["std"],
            "trend_direction": trend["direction"],
            "r_squared": trend["r_squared"],
            "outlier_count": stats["outlier_count"],
            "effect_size": effect_size,
            "p_value": trend["p_value"],
        },
        "panels": panels,
    }


def _sample_points(points: List[Dict], n: int) -> List[Dict]:
    """Evenly sample n points from the full list, always including first and last."""
    total = len(points)
    if total <= n:
        return points
    indices = [0] + [round(i * (total - 1) / (n - 1)) for i in range(1, n - 1)] + [total - 1]
    indices = sorted(set(indices))
    return [points[i] for i in indices]


def _classify_beat(pt, panel_idx, total_panels, trend_dir, max_change_idx) -> str:
    """Determine the narrative beat type based on data significance."""
    if panel_idx == 0:
        return "opening"
    if panel_idx == total_panels - 1:
        return "cliffhanger" if trend_dir == "cliffhanger" else "closing"

    if pt["is_outlier"]:
        return "revelation"
    if abs(pt["index"] - max_change_idx) <= 1:
        return "turning_point"

    beat_map = {
        "rise": "ascent",
        "fall": "descent",
        "plateau": "tension",
        "reversal": "reversal",
        "cliffhanger": "ascent",
        "flat": "tension",
    }
    return beat_map.get(trend_dir, "bridge")


def _build_panel(panel_index, data_point, beat, stats, tier, unit, ci_bands, story: BaseStory) -> Dict:
    trend = stats["trend"]

    # Who speaks in this panel? (Derived from characters defined in the story)
    characters_present = _select_characters_for_beat(beat, data_point, tier, story, stats)
    primary_char = characters_present[0] if characters_present else "Trend"
    
    # Delegate narration and beat descriptions to the story module
    dialogue = story.get_voice_line(data_point, beat, stats)
    beat_description = story.get_beat_description(beat, data_point, stats)

    # CI data for R-tier
    ci_info = None
    if ci_bands:
        matching = [b for b in ci_bands if abs(b["x"] - data_point["x"]) < 1e-6]
        if matching:
             ci_info = matching[0]

    # Render PyTorch chart (with secondary series support)
    stats_chart = render_stats_chart_base64(
        xs=np.array([p["x"] for p in stats["points"]]), 
        ys=np.array([p["y"] for p in stats["points"]]), 
        slope=trend["slope"], 
        intercept=trend["intercept"], 
        current_idx=data_point["index"], 
        title=stats.get("title", "Dataset"), 
        unit=unit,
        ys2=np.array([p["y2"] for p in stats["points"]]) if all("y2" in p and p["y2"] is not None for p in stats["points"]) else None
    )

    return {
        "panel_index": panel_index,
        "beat": beat,
        "beat_description": beat_description,
        "data_point": {
            "x": data_point["x"],
            "label": data_point["label"],
            "y": data_point["y"],
            "role": data_point["role"],
            "is_outlier": data_point["is_outlier"],
            "z_score": data_point.get("z_score", 0),
        },
        "characters_present": characters_present,
        "primary_character": primary_char,
        "dialogue": dialogue,
        "ci_info": ci_info,
        "micro_chart": _build_micro_chart(data_point, stats),
        "visual_cues": _get_visual_cues(beat, data_point, tier, ci_info),
        "stats_chart": stats_chart,
    }


def _build_micro_chart(data_point, stats) -> Dict:
    return {
        "value": data_point["y"],
        "mean": stats["summary"]["mean"],
        "std": stats["summary"]["std"],
        "min": stats["summary"]["min"],
        "max": stats["summary"]["max"],
        "percent_of_max": round(data_point["y"] / stats["summary"]["max"] * 100, 1) if stats["summary"]["max"] != 0 else 0,
        "all_points": [pt["y"] for pt in stats["points"]],
    }


def _get_visual_cues(beat, data_point, tier, ci_info) -> List[str]:
    cues = []
    if data_point["is_outlier"]: cues.append("spotlight")
    if beat == "turning_point": cues.append("dramatic_lighting")
    if beat in ("tension", "plateau"): cues.append("horizontal_lines")
    if beat == "cliffhanger": cues.append("edge_fade")
    if tier == "R" and ci_info: cues.append("fog_overlay")
    return cues


def _select_characters_for_beat(beat: str, data_point: Dict, tier: str, story: BaseStory, stats: Dict) -> List[str]:
    """Selects character IDs from the story roster based on the current beat."""
    story_chars = [c["id"] for c in story.get_characters(stats)]
    
    if beat == "opening":
        return [c for c in ["Trend", "Mean"] if c in story_chars]
    if beat == "closing":
        return [c for c in ["Trend", "Mean", "CI"] if c in story_chars]
    if data_point["is_outlier"] or beat == "revelation":
        return [c for c in ["Outlier", "Mean"] if c in story_chars]
    if beat in ("turning_point", "reversal"):
        return [c for c in ["StandardDeviation", "Trend"] if c in story_chars]
    
    return [story_chars[0]] if story_chars else ["Trend"]
