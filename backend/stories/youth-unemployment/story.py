# %% Story Module: NZ Youth Unemployment
from typing import List, Dict
from stories.base import BaseStory


class YouthUnemploymentStory(BaseStory):
    def __init__(self):
        super().__init__()
        self.id = "nz-youth-unemployment"
        self.title = "The Untapped Future: NZ Youth Jobless Trends"
        self.tier = "R"
        self.region = "Aotearoa"
        self.tags = ["Economics", "Labor", "Youth"]
        self.python_version = "3.10"
        self.dependencies = ["pandas", "numpy", "matplotlib", "torch"]
        self.unit = "Unemployment Rate (%)"
        self.x_label = "Year"
        self.y_label = "Unemployment Rate (15-24 Years)"
        self.description = "A statistical tracking of the challenges facing young workers in New Zealand. From the stability of the early 2000s to the volatility of the pandemic era."
        self.source = "Stats NZ / HLFS"
        self.source_url = "https://www.stats.govt.nz/information-releases/labour-market-statistics-march-2024-quarter/"
        self.citation = "Household Labour Force Survey (2024)"

        self.data_fallback = [
            {"x": 2000, "label": "2000", "y": 12.8},
            {"x": 2002, "label": "2002", "y": 11.4},
            {"x": 2004, "label": "2004", "y": 9.4},
            {"x": 2006, "label": "2006", "y": 9.0},
            {"x": 2008, "label": "2008", "y": 10.5},
            {"x": 2010, "label": "2010", "y": 16.7},  # Post-GFC
            {"x": 2012, "label": "2012", "y": 17.9},
            {"x": 2014, "label": "2014", "y": 14.4},
            {"x": 2016, "label": "2016", "y": 13.6},
            {"x": 2018, "label": "2018", "y": 12.4},
            {"x": 2019, "label": "2019", "y": 11.1},
            {"x": 2020, "label": "2020", "y": 16.2},  # COVID
            {"x": 2021, "label": "2021", "y": 14.8},
            {"x": 2022, "label": "2022", "y": 11.6},
            {"x": 2023, "label": "2023", "y": 10.7},
        ]

    def get_characters(self, stats: Dict) -> List[Dict]:
        return [
            {
                "id": "StandardDeviation",
                "name": "The Opportunity Analyst",
                "archetype": "The variability expert",
                "description": f"Notes the significant volatility since 2010. The {round(stats['summary']['std'], 1)}% variance indicates a high-risk labor market for the youth.",
                "color": "#10B981",
            },
            {
                "id": "Peak",
                "name": "The Career Advocate",
                "archetype": "The human element",
                "description": "Reminds us that the 2012 peak of 17.9% represents a critical loss of early-career momentum.",
                "color": "#F43F5E",
            },
            {
                "id": "CI",
                "name": "The Policy Auditor",
                "archetype": "The boundary watcher",
                "description": "Scans the confidence intervals of our labor data. As uncertainty grows, policy intervention becomes a statistical gamble.",
                "color": "#6EE7B7",
            },
        ]

    def get_voice_line(self, point: Dict, beat: str, stats: Dict) -> str:
        year = int(point.get("x", 0))
        value = point.get("y", 0)

        if year == 2006:
            return f"THE HISTORICAL LOW: A statistical Floor of {value}%. This era represented a gold-standard for entry-level opportunity."

        if year == 2012:
            return f"THE POST-CRISIS PEAK: Unemployment hit {value}%. A major statistical trauma for a generation entering the workforce after the GFC."

        if year == 2020:
            return f"THE COVID SURGE: A sudden spike to {value}%. The service industry's pause hit the youngest cohort first and hardest."

        if beat == "opening":
            return f"COMMENCING LABOR AUDIT: We are analyzing {len(self.data_fallback)} years of workforce participation. The goal is low volatility."
        elif beat == "conclusion":
            return f"MODERN RESILIENCE: We end the series at {value}%. A remarkable recovery from the pandemic shock, but structural challenges remain."

        return f"Year {year}: Record shows a {value}% unemployment rate for the youth cohort."

    def get_quiz_questions(self) -> List[Dict]:
        return [
            {
                "id": "volatility_year",
                "text": "Which year represents the 'Deepest Statistical Trough' (Lowest Unemployment) in this dataset?",
                "options": ["2000", "2006", "2012", "2020"],
            },
            {
                "id": "covid_impact",
                "text": "What was the immediate statistical effect of the 2020 pandemic on New Zealand's youth labor market?",
                "options": [
                    "No Change",
                    "A Massive Reduction in Unemployment",
                    "A Significant Jobless Surge",
                    "A Gradual Stabilization",
                ],
            },
        ]
