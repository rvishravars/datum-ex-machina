from typing import List, Dict
from stories.base import BaseStory


class IncomeInequalityStory(BaseStory):
    def __init__(self):
        super().__init__()
        self.id = "nz-gini"
        self.title = "The Great Divide: New Zealand's Income Equality Arc"
        self.tier = "R"
        self.unit = "Gini Coefficient"
        self.x_label = "Year"
        self.y_label = "Gini Index (0 to 1)"
        self.description = "A historical lens on New Zealand's wealth distribution from 1985 to today. Tracking the 'Gini Index'—where 0 is total equality and 1 is total inequality."
        self.source = "OECD Income Distribution Database / Stats NZ"
        self.citation = "NZ Household Incomes Report (Perry, 2023)"

        self.data_fallback = [
            {"x": 1985, "label": "1985", "y": 0.271},
            {"x": 1990, "label": "1990", "y": 0.311},
            {"x": 1994, "label": "1994", "y": 0.338},
            {"x": 1998, "label": "1998", "y": 0.335},
            {"x": 2001, "label": "2001", "y": 0.328},
            {"x": 2004, "label": "2004", "y": 0.340},
            {"x": 2007, "label": "2007", "y": 0.336},
            {"x": 2010, "label": "2010", "y": 0.332},
            {"x": 2013, "label": "2013", "y": 0.333},
            {"x": 2016, "label": "2016", "y": 0.341},
            {"x": 2019, "label": "2019", "y": 0.320},
            {"x": 2022, "label": "2022", "y": 0.311},
            {"x": 2023, "label": "2023", "y": 0.308},
        ]

    def get_characters(self, stats: Dict) -> List[Dict]:
        return [
            {
                "id": "Mean",
                "name": "The Social Economist",
                "archetype": "The macro-observer",
                "description": f"Focuses on the long-term historical mean of {round(stats['summary']['mean'], 3)}. Is the gap closing?",
                "color": "#10B981",
            },
            {
                "id": "Outlier",
                "name": "The Impact Reviewer",
                "archetype": "The outlier detector",
                "description": "Examines the 1994 peak of 33.7—a moment where the statistical gap reached a historic extreme.",
                "color": "#EF4444",
            },
            {
                "id": "CI",
                "name": "The Structural Analyst",
                "archetype": "The boundary watcher",
                "description": "Tracks the statistical width of the wealth gap. As CI broadens, the social fabric feels the strain.",
                "color": "#6EE7B7",
            },
        ]

    def get_voice_line(self, point: Dict, beat: str, stats: Dict) -> str:
        year = int(point.get("x", 0))
        value = point.get("y", 0)

        if year == 1985:
            return f"THE STARTING POINT: 1985 saw a Gini of {value}. This is the era of pre-reform relative equality. The baseline was low."

        if year == 1994:
            return f"THE SPIKE: By 1994, the index hit {value}. This represents a massive shift in distribution following the economic reforms of the early 90s."

        if year == 2023:
            return f"THE MODERN PLATEAU: We closed 2023 at {value}. There is a slight cooling trend from the 2016 peak, but the 'New Normal' is still higher than the 80s."

        if beat == "opening":
            return "WELCOME TO THE DIVIDE: We are tracking the Gini coefficient across four decades of New Zealand history. Higher numbers mean wider gaps."
        elif beat == "conclusion":
            return f"THE FINAL VERDICT: Our statistical trend finishes at {value}. The question remains: is this a sustainable social equilibrium?"

        return (
            f"Year {year}: Staticians recorded a distribution coefficient of {value}."
        )

    def get_quiz_questions(self) -> List[Dict]:
        return [
            {
                "id": "gini_meaning",
                "text": "What does a HIGHER Gini Coefficient indicate in this narrative?",
                "options": [
                    "Greater Income Equality",
                    "Greater Income Inequality",
                    "Higher Average Salary",
                    "Lower Cost of Living",
                ],
            },
            {
                "id": "peak_year",
                "text": "In which era did New Zealand experience its most significant statistical 'Equity Spike'?",
                "options": ["Mid-1980s", "Early-1990s", "Post-2020", "The 2000s"],
            },
        ]
