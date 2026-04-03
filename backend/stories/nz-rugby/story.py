from stories.base import BaseStory
from typing import List, Dict

class RugbyStory(BaseStory):
    def __init__(self):
        super().__init__()
        self.id = "nz-sports-season"
        self.title = "2024 Highlanders: Battle Lines and Southern Pride in the Glasshouse"
        self.tier = "M"
        self.unit = "points scored"
        self.x_label = "2024 Super Rugby Match Order"
        self.y_label = "Points Scored"
        self.description = "A blow-by-blow statistical analysis of the Highlanders' 14-match 2024 Super Rugby Pacific campaign—tracking attacking power, defensive pressure, and local Dunedin pride."
        self.source = "Super Rugby Pacific Official Match Data (SANZAAR)"
        self.citation = "Highlanders 2024 Season Archive (Dunedin Match Records)"
        self.data_fallback = [
            {"x": 1,  "label": "vs Moana Pasifika", "y": 35, "y2": 21}, # Win
            {"x": 2,  "label": "vs Blues",          "y": 29, "y2": 37}, # Loss
            {"x": 3,  "label": "vs Waratahs",       "y": 23, "y2": 21}, # Win
            {"x": 4,  "label": "vs Brumbies",       "y": 21, "y2": 27}, # Loss
            {"x": 5,  "label": "vs Chiefs",         "y": 21, "y2": 28}, # Loss
            {"x": 6,  "label": "vs Hurricanes",     "y": 12, "y2": 47}, # Massive Loss (Gap)
            {"x": 7,  "label": "vs Reds",           "y": 14, "y2": 31}, # Loss
            {"x": 8,  "label": "vs Force",          "y": 7,  "y2": 31}, # Loss
            {"x": 9,  "label": "vs Moana II",       "y": 28, "y2": 17}, # Win
            {"x": 10, "label": "vs Crusaders",      "y": 32, "y2": 29}, # CRUCIAL WIN
            {"x": 11, "label": "vs Blues II",       "y": 20, "y2": 31}, # Loss
            {"x": 12, "label": "vs Chiefs II",      "y": 19, "y2": 26}, # Loss
            {"x": 13, "label": "vs Fijian Drua",    "y": 39, "y2": 3},  # MEGA WIN
            {"x": 14, "label": "vs Hurricanes II",  "y": 14, "y2": 41}, # Loss
        ]

    def get_characters(self, stats: Dict) -> List[Dict]:
        return [
            {
                "id": "Mean",
                "name": "The High Performance Coach",
                "archetype": "The benchmark keeper",
                "description": f"The Highlanders attack average is {round(stats['summary']['mean'], 2)} points. Can we keep the scoring gap positive?",
                "color": "#4A9EFF",
            },
            {
                "id": "Trend",
                "name": "The Match Official",
                "archetype": "The objective narrator",
                "description": "Monitors the 'The Gap' (Win/Loss Margin) across the 2024 season.",
                "color": "#A78BFA",
            }
        ]

    def get_voice_line(self, point: Dict, beat: str, stats: Dict) -> str:
        label = str(point.get("label", ""))
        # Use 'or 0' to handle cases where y or y2 might be None
        scored = point.get("y") if point.get("y") is not None else 0
        conceded = point.get("y2") if point.get("y2") is not None else 0
        
        margin = scored - conceded
        outcome = "WIN" if margin > 0 else "LOSS"
        
        if label == "vs Hurricanes":
              return f"DEFENSIVE COLLAPSE: We only scored {scored} but let in {conceded}! A {abs(margin)}-point blowout by the Hurricanes. The gap is becoming a canyon."

        if label == "vs Crusaders":
              return f"THE GRITTY WIN: Scored {scored}, conceded {conceded}. A narrow {margin}-point victory over the Crusaders! This is where the defense stood firm."

        if label == "vs Fijian Drua":
              return f"ATTACKING DOMINANCE: A massive {margin}-point margin ({scored}-{conceded})! This is statistical attacking perfection at Forsyth Barr."

        if beat == "opening":
            return f"FORSYTH BARR KICKOFF: We pull off a {margin}-point win ({scored}-{conceded}). Setting a positive statistical margin for the season."
        elif beat == "conclusion":
            return f"THE FINAL MARGIN: The season ends on a tough {abs(margin)}-point loss ({scored}-{conceded}). The 2024 campaign is a story of gaps we couldn't quite close."
        
        return f"Match {label}: {scored} Scored vs {conceded} Conceded ({outcome} by {abs(margin)})."

    def get_quiz_questions(self) -> List[Dict]:
        return [
            {
                "id": "best_win",
                "text": "In which match did the Highlanders have their largest statistical 'Win Margin'?",
                "options": ['vs Crusaders', 'vs Fijian Drua', 'Match 1', 'The Season Wrap']
            },
            {
                "id": "defensive_slump",
                "text": "What does a large 'Gap' between the two lines indicate in our Hurricanes match?",
                "options": ['A Close Game', 'A Massive Defensive Blowout', 'A Low Scoring Draw', 'A Statistical Error']
            }
        ]
