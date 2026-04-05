# %% Story Module: Global CO2 Emissions
from typing import List, Dict
from stories.base import BaseStory


class CO2EmissionsStory(BaseStory):
    def __init__(self):
        super().__init__()
        self.id = "global-co2"
        self.title = "The Atmosphere's Burden: Global CO2 Intensity"
        self.tier = "R"
        self.region = "Pacific Voyagers"
        self.tags = ["Environment", "Climate", "Trends"]
        self.python_version = "3.10"
        self.dependencies = ["pandas", "numpy", "matplotlib", "torch"]
        self.unit = "Billion Tonnes (Gt)"
        self.x_label = "Year"
        self.y_label = "Gt CO2 per Year"
        self.description = "A statistical tracking of global carbon emissions since 1990. Identifying the moments where the industrial curve bent—and where it paused."
        self.source = "Global Carbon Project / IEA"
        self.source_url = "https://www.icos-cp.eu/science-and-impact/global-carbon-budget/2023"
        self.citation = "Global Carbon Budget 2023"

        self.data_fallback = [
            {"x": 1990, "label": "1990", "y": 22.7},
            {"x": 1995, "label": "1995", "y": 23.5},
            {"x": 2000, "label": "2000", "y": 25.2},
            {"x": 2005, "label": "2005", "y": 29.4},
            {"x": 2008, "label": "2008", "y": 32.1},
            {"x": 2009, "label": "2009", "y": 30.5},  # GFC Drop
            {"x": 2010, "label": "2010", "y": 33.1},
            {"x": 2013, "label": "2013", "y": 35.3},
            {"x": 2016, "label": "2016", "y": 34.8},
            {"x": 2019, "label": "2019", "y": 36.7},
            {"x": 2020, "label": "2020", "y": 34.1},  # COVID Drop
            {"x": 2021, "label": "2021", "y": 36.4},
            {"x": 2022, "label": "2022", "y": 36.8},
            {"x": 2023, "label": "2023", "y": 37.4},
        ]

    def get_characters(self, stats: Dict) -> List[Dict]:
        return [
            {
                "id": "Trend",
                "name": "The Climate Modeller",
                "archetype": "The predictor",
                "description": f"Has calculated a positive slope of {round(stats['trend']['slope'], 3)} Gt per year. The trend is our history, but is it our future?",
                "color": "#3B82F6",
            },
            {
                "id": "Outlier",
                "name": "The Crisis Observer",
                "archetype": "The outlier detector",
                "description": "Studies the dips of 2009 and 2020—reminders of how external shocks impact the global curve.",
                "color": "#EF4444",
            },
            {
                "id": "CI",
                "name": "The Uncertainty Tracker",
                "archetype": "The boundary watcher",
                "description": "Monitors the statistical 'fog' around our projections. Where the bands widen, certainty fades.",
                "color": "#6EE7B7",
            },
        ]

    def get_voice_line(self, point: Dict, beat: str, stats: Dict) -> str:
        year = int(point.get("x", 0))
        value = point.get("y", 0)

        if year == 2009:
            return f"THE GFC SHOCK: Emissions dropped to {value} Gt. The global financial crisis slowed industrial output, creating a temporary statistical valley."

        if year == 2020:
            return f"THE PANDEMIC PAUSE: A sharp drop to {value} Gt. Lockdowns achieved a record reduction, but the statistical rebound was already lurking."

        if year == 2023:
            return f"THE NEW PEAK: We've reached {value} Gt. The atmosphere is absorbing carbon at the highest intensity in recorded human history."

        if beat == "opening":
            return f"COMMENCING ATMOSPHERIC AUDIT: We are tracking {len(self.data_fallback)} data checkpoints since 1990. The curve is unmistakably upwards."
        elif beat == "conclusion":
            return f"THE FINAL ACCUMULATION: We finish the series at {value} Gt. The statistical gap between our targets and the reality is significant."

        return f"Year {year}: Global sensors recorded {value} Gt of carbon emissions."

    def get_quiz_questions(self) -> List[Dict]:
        return [
            {
                "id": "emission_dips",
                "text": "What caused the significant statistical 'Dips' in 2009 and 2020?",
                "options": [
                    "Global Climate Agreements",
                    "Major Economic and Social Disruptions",
                    "Technological Breakthroughs",
                    "Data Errors",
                ],
            },
            {
                "id": "overall_trend",
                "text": "Despite temporary dips, what is the 'Predominant Trend' of global CO2 emissions in this dataset?",
                "options": [
                    "Steady Plateau",
                    "Accelerating Decline",
                    "Persistent Increase",
                    "Random Fluctuation",
                ],
            },
        ]
