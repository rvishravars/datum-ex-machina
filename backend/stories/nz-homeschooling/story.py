from typing import List, Dict
from stories.base import BaseStory


class NZHomeschoolingStory(BaseStory):
    def __init__(self):
        super().__init__()
        self.id = "nz-homeschooling"
        self.title = "The Great Shift: NZ Homeschooling Trends"
        self.tier = "R"
        self.region = "New Zealand"
        self.tags = ["Education", "Pandemic Impact", "Society"]
        self.python_version = "3.10"
        self.dependencies = ["pandas", "numpy", "matplotlib", "torch"]
        self.unit = "Total Students"
        self.x_label = "Year"
        self.y_label = "Total Homeschooled Students"
        self.description = "A statistical tracking of homeschooling student numbers in New Zealand from 2010 to 2025. Identifying the baseline, the pandemic surge, and the permanent structural shift post-COVID."
        self.source = "Education Counts (Ministry of Education NZ)"
        self.source_url = "https://www.educationcounts.govt.nz/statistics/homeschooling"
        self.citation = "Homeschooling Students in New Zealand (Time Series)"

        self.data_fallback = [
            {"x": 2010, "label": "2010", "y": 5915},
            {"x": 2013, "label": "2013", "y": 5521},
            {"x": 2016, "label": "2016", "y": 5837},
            {"x": 2019, "label": "2019", "y": 6573},
            {"x": 2020, "label": "2020", "y": 7192},  # The initial shock
            {"x": 2021, "label": "2021", "y": 7749},
            {"x": 2022, "label": "2022", "y": 10899},  # The peak surge
            {"x": 2023, "label": "2023", "y": 10777},
            {"x": 2024, "label": "2024", "y": 10757},
            {"x": 2025, "label": "2025", "y": 11010},  # New paradigm
        ]

    def get_characters(self, stats: Dict) -> List[Dict]:
        return [
            {
                "id": "Trend",
                "name": "The Predictor",
                "archetype": "The baseline tracker",
                "description": "Has calculated a very flat, gentle baseline. Before 2020, the average was hovering around 6,000 students. Nothing indicated the surge ahead.",
                "color": "#3B82F6",
            },
            {
                "id": "Outlier",
                "name": "The Crisis Observer",
                "archetype": "The outlier detector",
                "description": "Focussed entirely on the massive spike between 2020 and 2022. An absolute deviation that broke every forecasting model.",
                "color": "#EF4444",
            },
            {
                "id": "CI",
                "name": "The New Paradigm",
                "archetype": "The boundary watcher",
                "description": "Watches the numbers after the shock. What was expected to return to baseline has instead established a completely new normal.",
                "color": "#6EE7B7",
            },
        ]

    def get_voice_line(self, point: Dict, beat: str, stats: Dict) -> str:
        year = int(point.get("x", 0))
        value = point.get("y", 0)

        if year == 2019:
            return f"THE FINAL BASELINE: {value} students. For nearly a decade, homeschooling numbers had remained incredibly stable."

        if year == 2020:
            return f"THE PANDEMIC SHOCK: The initial jump to {value}. An unprecedented wave of families opted out of traditional schooling networks."

        if year == 2022:
            return f"THE APEX: A massive outlier event hitting {value}. An incredible relative increase completely breaking historical confidence intervals."

        if beat == "opening":
            return f"INITIALIZING AUDIT: Analyzing {len(self.data_fallback)} chronological checkpoints in New Zealand's education statistics."
        elif beat == "conclusion":
            return f"THE NEW NORMAL: Finishing the series at {value} students in 2025. The numbers have not returned to the pre-2020 baseline."

        return f"Year {year}: Recorded total of {value} homeschooled students."

    def get_chronicle_links(self, x_val: float) -> List[Dict]:
        if int(x_val) == 2020:
            return [{
                "target_id": "nz-screen-time",
                "label": "Digital Habit Spikes",
                "reasoning": "THE DIGITAL SHIFT: As students moved to home-based learning in 2020, their daily screen time surged to an average of 6.9 hours. The kitchen table became the new digital classroom."
            }]
        return []

    def get_quiz_questions(self) -> List[Dict]:
        return [
            {
                "id": "homeschooling_surge",
                "text": "What defined the 'Outlier' event in this dataset?",
                "options": [
                    "A slow, steady increase in homeschooling since 2010",
                    "A sudden drop in homeschooling due to internet issues",
                    "A massive surge in homeschooling between 2020 and 2022",
                    "A data measurement error in the Ministry of Education",
                ],
            },
            {
                "id": "post_shock_trend",
                "text": "What is the most notable statistical trend following the 2022 outlier spike?",
                "options": [
                    "The numbers immediately dropped back to 6,000",
                    "The numbers vanished due to missing data",
                    "The numbers established a new, permanently elevated structural baseline",
                    "The numbers continued to double every single year",
                ],
            },
        ]
