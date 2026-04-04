# Datum Ex Machina: Rendering Pipeline

This document describes the low-level sequence of operations required to transform a raw statistical dataset into a narrative-driven comic storyboard using our **Modular Inheritance Architecture**.

## 🧬 Class Inheritance Model

Each dataset in **Datum Ex Machina** is governed by a specialized class that inherits from a common base, ensuring consistent narrative logic while allowing for unique "voices."

```mermaid
classDiagram
    class BaseStory {
        <<Abstract>>
        +title: str
        +unit: str
        +get_characters(stats) List
        +get_voice_line(point, beat, stats) str
        +get_beat_description(beat, point, stats) str
    }
    
    class GenericStory {
        +get_voice_line(point, beat, stats) str (Standard Stats)
    }

    class HighlandersStory {
        +get_voice_line(point, beat, stats) str (Rugby Narrative)
    }

    class NZScreenTimeStory {
        +get_voice_line(point, beat, stats) str (Digital Fatigue Narrative)
    }

    BaseStory <|-- GenericStory : Inheritance
    BaseStory <|-- HighlandersStory : Inheritance
    BaseStory <|-- NZScreenTimeStory : Inheritance
    
    class StoryRegistry {
        +register(story_id, story_class)
        +get_story(story_id) BaseStory
    }
    
    StoryRegistry o-- BaseStory : Aggregates
```

## 🏗️ Comic Generation Sequence

```mermaid
sequenceDiagram
    autonumber
    participant U as User (UI)
    participant S as Stage (React)
    participant A as Analyze API (FastAPI)
    participant R as Story Registry
    participant SM as Story Module (Inherits BaseStory)
    participant ST as Stats Engine (PyTorch)
    participant N as Narrative Engine (pipeline/narrative.py)

    U->>S: Select Story & Tier (M/R)
    S->>A: POST /api/analyze (id, Dataset, Tier)
    
    A->>R: get_story(id)
    R-->>A: Instance of Specialized Story Module
    
    A->>ST: compute_stats(raw_data)
    ST->>ST: Solve OLS Regression via PyTorch
    ST-->>A: Statistical Profile (Trend, Points)

    A->>N: map_to_storyboard(stats, story_instance)
    
    loop For each Narrative Beat
        N->>SM: story.get_characters(stats)
        N->>SM: story.get_voice_line(point, beat, stats)
        SM-->>N: Specialized Dialogue (Inherited or Overridden)
        
        N->>N: Assemble Panel with Matplotlib Chart
    end
    
    N-->>A: Completed Storyboard JSON
    A-->>S: Return Storyboard Object
    
    S->>U: Render 4-Stage Experience (Viz -> Story -> Feedback)
```

## 🛠️ Key Components

### 1. Statistical Processing (`backend/pipeline/stats.py`)
Calculates the central tendency and identifies the **Narrative Archetype** of each point (e.g., "Outlier," "Peak," "Mean"). We use PyTorch for linear regression to ensure mathematical precision.

### 2. The Base Story Template (`backend/stories/base.py`)
The **Abstract Base Class (`BaseStory`)** defines the required interface for all datasets. It handles the shared boilerplate, while child classes (e.g., `HighlandersStory`) only need to override the `get_voice_line` or `get_characters` methods to inject their unique personality.

### 3. Narrative Beat Mapping (`backend/pipeline/narrative.py`)
Determines the "rhythm" of the comic. It decides when to show the "Opening," where the "Turning Point" occurs, and how to conclude the story (Cliffhanger vs. Plateau). It orchestrates the handover between calculations and the Story Module.

### 4. Stage 4: Feedback (Personal Feedback Desk)
Once the narrative sequence completes, the pipeline transitions to the **Editorial Stage**. Here, the user's personal synthesis is captured and stored in the database, acting as the final feedback loop for the "Platform for Understanding."
