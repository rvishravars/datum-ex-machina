from stories.base import BaseStory
from typing import List, Dict

class ScreenTimeStory(BaseStory):
    def __init__(self):
        super().__init__()
        self.id = "nz-screen-time"
        self.title = "NZ Teen Screen Time vs Sleep"
        self.tier = "M"
        self.unit = "hours/day"
        self.x_label = "Year"
        self.y_label = "Screen time (hours/day)"
        self.description = "Average daily screen hours versus sleep hours for NZ secondary school students, 2015–2023. Sourced from Census at School NZ survey patterns."
        self.source = "Census at School NZ (censusatschool.org.nz)"
        self.citation = "Census at School NZ, 2015–2023 cohort data"
        self.data_fallback = [
            {"x": 2015, "label": "2015", "y": 3.1, "y2": 7.8},
            {"x": 2016, "label": "2016", "y": 3.4, "y2": 7.7},
            {"x": 2017, "label": "2017", "y": 3.8, "y2": 7.6},
            {"x": 2018, "label": "2018", "y": 4.2, "y2": 7.5},
            {"x": 2019, "label": "2019", "y": 4.7, "y2": 7.4},
            {"x": 2020, "label": "2020", "y": 6.9, "y2": 7.0},
            {"x": 2021, "label": "2021", "y": 7.1, "y2": 6.9},
            {"x": 2022, "label": "2022", "y": 6.4, "y2": 7.2},
            {"x": 2023, "label": "2023", "y": 6.1, "y2": 7.3},
        ]

    def get_voice_line(self, point: Dict, beat: str, stats: Dict) -> str:
        label = str(point.get("label", ""))
        value = point.get("y", 0)
        y2_val = point.get("y2")
        is_covid = label in ("2020", "2021")

        if is_covid:
            return f"COVID-19 IMPACT: While screens spiked to {value} hrs, sleep plummeted to {y2_val}! The lockdown was a digital surge, but a biological cost."
        
        line = f"At {label}, screen time was {value} hrs."
        if y2_val is not None:
            line += f" (Sleep: {y2_val} hrs — the cost of a {value} hr screen day.)"
        
        return line

    def get_quiz_questions(self) -> List[Dict]:
        questions = super().get_quiz_questions()
        questions.append({
            "id": "covid_impact",
            "text": "What was the primary driver of the 2020 outlier?",
            "options": ['Natural Growth', 'COVID-19 Lockdowns', 'New Gaming Consoles', 'A statistical error']
        })
        return questions
