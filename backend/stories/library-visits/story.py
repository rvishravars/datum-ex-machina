from typing import List, Dict
from stories.base import BaseStory


class LibraryVisitsStory(BaseStory):
    def __init__(self):
        super().__init__()
        self.id = "nz-library-loans"
        self.title = "The Silent Shelves: Physical Library Lending"
        self.tier = "M"
        self.unit = "Monthly Loans (Thousands)"
        self.x_label = "Month"
        self.y_label = "Total Physical Loans"
        self.description = "An investigation into the seasonal and cultural shifts in New Zealand's physical book lending. Analyzing the trajectory of tactile literacy in a digital world."
        self.source = "Local Library Statistics NZ"
        self.citation = "Regional Literacy & Lending Reports (2022)"

        self.data_fallback = [
            {"x": 1, "label": "Feb", "y": 380},
            {"x": 2, "label": "Mar", "y": 420},
            {"x": 3, "label": "Apr", "y": 390},
            {"x": 4, "label": "May", "y": 310},
            {"x": 5, "label": "Jun", "y": 260},
            {"x": 6, "label": "Jul", "y": 180},
            {"x": 7, "label": "Aug", "y": 290},
            {"x": 8, "label": "Sep", "y": 340},
            {"x": 9, "label": "Oct", "y": 220},
            {"x": 10, "label": "Nov", "y": 140},
            {"x": 11, "label": "Dec", "y": 95},
        ]

    def get_characters(self, stats: Dict) -> List[Dict]:
        return [
            {
                "id": "Trough",
                "name": "The Digital Archivist",
                "archetype": "The tech-optimist",
                "description": f"Identifies the December trough of {round(stats['summary']['min'], 0)} as a point of digital conversion. Are books becoming artifacts?",
                "color": "#8B5CF6",
            },
            {
                "id": "Mean",
                "name": "The Community Librarian",
                "archetype": "The guardian",
                "description": f"Strives for the monthly benchmark of {round(stats['summary']['mean'], 0)}. Every loan is a victory for the physical format.",
                "color": "#F59E0B",
            },
        ]

    def get_voice_line(self, point: Dict, beat: str, stats: Dict) -> str:
        month = str(point.get("label", ""))
        value = point.get("y", 0)

        if month == "Mar":
            return f"THE PEAK READ: March hit {value}k. This is where academic cycles and Autumn weather drive the community back to the shelves."

        if month == "Jul":
            return f"THE MID-YEAR SLUMP: Loans dropped to {value}k. This statistical trough coincides with winter breaks where travel often replaces reading."

        if month == "Dec":
            return f"THE SILENT SHELVES: A record low of {value}k. The holiday rush has completely drained the library of its tactile audience."

        if beat == "opening":
            return "COMMENCING LENDING TRACKER: We are analyzing the monthly pulse of New Zealand's library systems. Stability is the goal."
        elif beat == "conclusion":
            return f"FINAL ANNUAL COUNT: We finish on a steep decline to {value}k. The narrative of the physical book is at a statistical crossroads."

        return f"Month {month}: Sensors recorded {value}k physical book loans across the region."

    def get_quiz_questions(self) -> List[Dict]:
        return [
            {
                "id": "lending_peak",
                "text": "Based on the data, in which month did New Zealanders reach their 'Physical Reading Peak'?",
                "options": ["February", "March", "December", "July"],
            },
            {
                "id": "december_interpretation",
                "text": "What does the steep decline in December most likely indicate in this narrative context?",
                "options": [
                    "Higher Library Productivity",
                    "Seasonal Shift in Public Habits",
                    "Massive Book Deletions",
                    "Data Collection Error",
                ],
            },
        ]
