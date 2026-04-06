from typing import List, Dict
from stories.base import BaseStory


class NZWomenPhotographersStory(BaseStory):
    def __init__(self):
        super().__init__()
        self.id = "nz-women-photographers"
        self.title = "Through Shaded Glass: NZ Women Photographers"
        self.tier = "R"
        self.region = "New Zealand"
        self.tags = ["History", "Arts", "Women", "Te Papa"]
        self.python_version = "3.10"
        self.dependencies = ["pandas", "numpy"]
        self.unit = "Identified Photographers"
        self.x_label = "Year"
        self.y_label = "Active Women Photographers"
        self.description = "A tracing of women's contribution to photography in Aotearoa New Zealand between 1860 and 1960. Based on the 'Through Shaded Glass' research by Te Papa."
        self.source = "Museum of New Zealand Te Papa Tongarewa"
        self.source_url = "https://catalogue.data.govt.nz/dataset/new-zealand-women-photographers"
        self.citation = "Mitchell, L. 'Through Shaded Glass' (2023)"

        # Historical estimates based on the publication milestones
        self.data_fallback = [
            {"x": 1860, "label": "1860", "y": 5},    # Pioneers like Elizabeth Pulman
            {"x": 1880, "label": "1880", "y": 18},   # Expanding studio roles
            {"x": 1900, "label": "1900", "y": 48},   # Surge in independent studios
            {"x": 1920, "label": "1920", "y": 112},  # Modernist transition begins
            {"x": 1940, "label": "1940", "y": 235},  # Documentary photography boom
            {"x": 1960, "label": "1960", "y": 420},  # Professional normalcy
        ]

    def get_characters(self, stats: Dict) -> List[Dict]:
        return [
            {
                "id": "Trend",
                "name": "The Historian",
                "archetype": "The archival narrator",
                "description": "Tracks the expansion of women's roles from domestic assistants to professional studio owners and modern artists.",
                "color": "#D946EF",
            },
            {
                "id": "Mean",
                "name": "The Archivist",
                "archetype": "The recovery specialist",
                "description": "Focuses on the hidden figures and recovery of lost names. The 'average' represents a growing professional field.",
                "color": "#8B5CF6",
            },
            {
                "id": "Outlier",
                "name": "The Visionary",
                "archetype": "The rule-breaker",
                "description": "Highlights the pioneers like Elizabeth Pulman who defied the social conventions of the 1860s.",
                "color": "#F43F5E",
            },
        ]

    def get_voice_line(self, point: Dict, beat: str, stats: Dict) -> str:
        year = int(point.get("x", 0))
        value = point.get("y", 0)

        if year == 1860:
            return f"THE PIONEERS: In 1860, we find only {value} identified women. Many worked in the shadow of family names, but Elizabeth Pulman's shaded glass was already capturing history."

        if year == 1900:
            return f"THE PROFESSIONAL SURGE: By the turn of the century, {value} women are leading studios. This was a wave of independence that few other professions offered at the time."

        if year == 1940:
            return f"THE DOCUMENTARY BOOM: {value} active voices. The lens has shifted from the formal studio to the raw, documentary reality of life in Aotearoa."

        if beat == "opening":
            return f"INITIALIZING HISTORICAL AUDIT: Analyzing {len(self.data_fallback)} decades of visual legacy in Aotearoa New Zealand."
        elif beat == "conclusion":
            return f"THE MODERN LEGACY: We end in 1960 with {value} professionals. The foundations of modern photography were built by these eyes through the glass."

        return f"By {year}, the count of identified women photographers has grown to {value}."

    def get_chronicle_links(self, x_val: float) -> List[Dict]:
        year = int(x_val)
        links = []
        
        if year == 1860:
            links.append({
                "target_id": "nz-homeschooling",
                "label": "Shadow Education",
                "reasoning": "HIDDEN APPRENTICESHIP: Without formal art schools, many women learned photography through domestic apprenticeship—a 19th-century form of alternative education similar to modern homeschooling."
            })
        
        if year >= 1940:
            links.append({
                "target_id": "nz-screen-time",
                "label": "The Shifting Lens",
                "reasoning": "THE DIGITAL EVOLUTION: Between 1860 and 1960, the 'screen' was a pane of shaded glass. Today, we spend nearly 7 hours a day looking at digital screens. The medium has changed, but the capture continues."
            })

        # Future target for Heritage Places
        if year == 1900:
            links.append({
                "target_id": "nz-heritage-places",
                "label": "Heritage Studios",
                "reasoning": "THE STUDIO REMAINS: Many of these early 1900s studios are now listed on the Rārangi Kōrero (Heritage List), preserving the physical spaces where these women made history."
            })

        return links

    def get_knowledge_relations(self) -> List[Dict]:
        return [
            {
                "id": "shaded_glass_context",
                "label": "The Ground Glass Screen",
                "x_target": 1860,
                "type": "Concept",
                "description": "Technological shift from 'blind' capture to composed focusing using the ground glass. This was the first true 'UI' for photographers.",
                "wikipedia": "https://en.wikipedia.org/wiki/Ground_glass"
            },
            {
                "id": "cabinet_card_boom",
                "label": "The Cabinet Card Era",
                "x_target": 1900,
                "type": "Event",
                "description": "The professional surge of 1900 coincides with the global popularity of the Cabinet Card format, allowing women to monetize their studio output at scale.",
                "wikipedia": "https://en.wikipedia.org/wiki/Cabinet_card"
            },
            {
                "id": "modernist_transition",
                "label": "Modernist New Zealand",
                "x_target": 1960,
                "type": "Concept",
                "description": "The shift toward modernist and documentary photography between 1920-1960 reflected the broader arrival of modernism in the Pacific arts.",
                "wikipedia": "https://en.wikipedia.org/wiki/Modernism_in_the_visual_arts_in_New_Zealand"
            }
        ]

    def get_terms(self, stats: Dict) -> Dict[str, str]:
        terms = super().get_terms(stats)
        terms.update({
            "Shaded Glass": "The ground glass screen on the back of a view camera, used by the photographer to compose and focus the image under a dark cloth.",
            "Cabinet Card": "A style of photographic portrait mounted on card stock, popular from the 1860s to the early 1900s.",
            "Modernist": "A movement in photography from the 1920s onwards that favored sharp focus, bold compositions, and everyday subject matter over formal studio portraits.",
            "Visual Legacy": "The collective body of photographic work that documents and preserves the history and identity of a culture or place.",
        })
        return terms

    def get_quiz_questions(self) -> List[Dict]:
        return [
            {
                "id": "professional_surge",
                "text": "Which era saw the'surge' of independent women-led studios in this dataset?",
                "options": [
                    "1860-1880",
                    "1900-1920",
                    "1940-1960",
                    "Post-1960",
                ],
            },
            {
                "id": "shaded_glass_meaning",
                "text": "What does 'shaded glass' refer to in the context of early photography?",
                "options": [
                    "Dark sunglasses worn by photographers",
                    "The view camera's ground glass screen",
                    "Window shades in modern digital studios",
                    "A type of filter used only for landscapes",
                ],
            },
        ]
