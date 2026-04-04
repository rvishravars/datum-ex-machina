from typing import List, Dict


class BaseStory:
    """
    Abstract base class for all Datum Ex Machina stories.
    Each story should inherit from this and provide its own logic.
    """

    def __init__(self):
        self.id = "base"
        self.title = "Untitled Story"
        self.description = ""
        self.source = ""
        self.citation = ""
        self.unit = ""
        self.x_label = ""
        self.y_label = ""
        self.tier = "M"
        self.region = "Global"
        self.tags = []
        self.python_version = "3.10"
        self.dependencies = ["pandas", "numpy", "matplotlib", "torch"]
        self.data_fallback = []

    def load_data(self) -> List[Dict]:
        """Loads data from fallback (individual story modules)."""
        return self.data_fallback

    def get_voice_line(self, point: Dict, beat: str, stats: Dict) -> str:
        """
        Generates dialogue for a specific point and beat.
        Override this for story-specific flavor.
        """
        label = point.get("label", str(point.get("x", "")))
        value = point.get("y", 0)

        if beat == "opening":
            return f"We begin at {value} {self.unit}. This is our baseline."
        elif beat == "peak":
            return f"A high point of {value} {self.unit}! We've peaked."
        elif beat == "trough":
            return f"A low point of {value} {self.unit}. We're in the valley."
        elif beat == "outlier":
            return (
                f"Wait, {value} {self.unit}? This point doesn't fit the pattern at all."
            )

        return f"At {label}, we see {value} {self.unit}."

    def get_beat_description(self, beat: str, pt: Dict, stats: Dict) -> str:
        label = pt["label"]
        y = pt["y"]
        summary = stats["summary"]

        descriptions = {
            "opening": f"The stage opens. The data begins at {y}.",
            "ascent": f"The trend climbs. At {label}, the value reaches {y} — above the mean."
            if y > summary["mean"]
            else f"The rise continues. At {label}: {y}.",
            "descent": f"The numbers fall. At {label}: {y}, pulling toward {summary['mean']}.",
            "tension": f"A steady stretch. At {label}: {y}. No big moves yet.",
            "turning_point": f"The major shift! At {label}, the value is {y} — the story changes direction.",
            "reversal": f"The trend reverses at {label}.",
            "revelation": f"An outlier appears at {label}: {y}.",
            "cliffhanger": f"The final point: {label}, value {y}. The story ends on a peak.",
            "closing": f"The curtain falls. The trend ends at {y}.",
        }
        return descriptions.get(beat, f"At {label}: {y}.")

    def get_characters(self, stats: Dict) -> List[Dict]:
        """Returns the character roster for this story."""
        tier = self.tier
        chars = [
            {
                "id": "Mean",
                "name": "The Average" if tier == "M" else "The Mean",
                "archetype": "The middle-ground seeker",
                "description": f"The usual level is {round(stats['summary']['mean'], 2)}.",
                "color": "#4A9EFF",
            },
            {
                "id": "Trend",
                "name": "The Storyline" if tier == "M" else "The Trend",
                "archetype": "The narrator",
                "description": f"The pattern is {stats['trend']['direction']}.",
                "color": "#A78BFA",
            },
        ]
        if stats["outlier_count"] > 0:
            chars.append(
                {
                    "id": "Outlier",
                    "name": "The Rebel" if tier == "M" else "The Outlier",
                    "archetype": "The rule-breaker",
                    "description": "Doesn't follow the pattern.",
                    "color": "#EF4444",
                }
            )
        return chars

    def get_terms(self, stats: Dict) -> Dict[str, str]:
        """
        Returns a dictionary of terminology definitions that maps words/phrases to their
        deeper meanings. These will be highlighted in the frontend UI.
        Override this to supply story-specific glossary terms.
        """
        terms = {
            "mean": "The average value across all data points in this timeframe.",
            "average": "A central value that gives a general sense of the whole dataset.",
            "baseline": "The initial starting point used for comparison.",
            "outlier": "A data point that differs significantly from all others. It can indicate a measurement error or a genuine anomaly.",
            "rebel": "A narrative persona representing values that stray from the main trend.",
            "unusual": "A reading that falls far outside expected statistical confidence intervals.",
            "peak": "The highest value recorded in this dataset.",
            "valley": "The lowest point, or trough, across the observable timeline.",
            "trend": "The general direction in which the data is developing or changing.",
            "storyline": "The overall narrative or shape formed by the sequence of data points.",
            "distribution coefficient": "A statistical measure that describes how a value is spread or partitioned across different groups or conditions."
        }
        return terms

    def get_quiz_questions(self) -> List[Dict]:
        """Returns custom quiz questions for this story."""
        return [
            {
                "id": "trend_dir",
                "text": "What was the primary direction of the evidence?",
                "options": [
                    "Climbing (Rise)",
                    "Falling (Fall)",
                    "Steady (Plateau)",
                    "Reversing",
                ],
            },
            {
                "id": "greatest_change",
                "text": "Which part of the story felt the most dramatic?",
                "options": [
                    "The Opening",
                    "The Turning Point",
                    "The Outlier",
                    "The Closing",
                ],
            },
        ]

    def to_dict(self):
        """Serializes the story metadata and data for the API."""
        return {
            "id": self.id,
            "title": self.title,
            "tier": self.tier,
            "description": self.description,
            "source": self.source,
            "citation": self.citation,
            "unit": self.unit,
            "x_label": self.x_label,
            "y_label": self.y_label,
            "region": getattr(self, "region", "Global"),
            "tags": getattr(self, "tags", []),
            "python_version": getattr(self, "python_version", "3.10"),
            "dependencies": getattr(self, "dependencies", []),
            "terms": self.get_terms({"summary": {"mean": 0}}), # Safe fallback
            "data": self.load_data(),
        }


class GenericStory(BaseStory):
    """
    A fallback story module for generic or ad-hoc datasets.
    Uses standard statistical personas and default dialogue.
    """

    def __init__(self, title: str = "Dataset Analysis", unit: str = "Value"):
        super().__init__()
        self.id = "generic"
        self.title = title
        self.unit = unit
        self.description = f"Standard statistical analysis of {title}."

    def get_characters(self, stats: Dict) -> List[Dict]:
        """Provides a standard set of personas for any dataset."""
        chars = [
            {
                "id": "Mean",
                "name": "The Average",
                "archetype": "The middle-ground seeker",
                "description": f"Focuses on the central tendency at {round(stats['summary']['mean'], 2)}.",
                "color": "#4A9EFF",
            },
            {
                "id": "Trend",
                "name": "The Narrative",
                "archetype": "The direction finder",
                "description": f"Tracks the overall movement is {stats['trend']['direction']}.",
                "color": "#A78BFA",
            },
        ]
        if stats.get("outlier_count", 0) > 0:
            chars.append(
                {
                    "id": "Outlier",
                    "name": "The Radical",
                    "archetype": "The outlier",
                    "description": "Highlights the points that defy the standard trend.",
                    "color": "#EF4444",
                }
            )
        return chars

    def get_voice_line(self, point: Dict, beat: str, stats: Dict) -> str:
        """Default voice lines if no specific story is provided."""
        val = point.get("y", 0)
        label = point.get("label", "Current")

        if beat == "opening":
            return f"INITIALIZING AUDIT: The first data point recorded is {val} at {label}. We are building the baseline."
        if beat == "closing":
            return f"FINAL OBSERVATION: We finish at {val} ({label}). The statistical series is complete."
        if point.get("is_outlier"):
            return f"SENSORY ANOMALY: A radical value of {val} detected! This point significantly deviates from our mean."

        return f"Standard reading at {label}: Recorded value of {val} {self.unit}."
