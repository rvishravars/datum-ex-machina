# Datum Ex Machina: Rendering Pipeline

This document describes the low-level sequence of operations required to transform a raw statistical dataset into a narrative-driven comic storyboard.

## Comic Generation Sequence

```mermaid
sequenceDiagram
    autonumber
    participant U as User (UI)
    participant S as Stage (React)
    participant A as Analyze API (FastAPI)
    participant R as Story Registry
    participant SM as Story Module (e.g. Highlanders)
    participant ST as Stats Engine (PyTorch)
    participant N as Narrative Engine
    participant M as Matplotlib (Chart Gen)

    U->>S: Select Story (e.g. Highlanders) & Tier (M/R)
    S->>A: POST /api/analyze (id, Dataset, Tier)
    
    A->>R: get_story(id)
    R-->>A: Story Instance (Highlanders)

    A->>ST: compute_stats(raw_data)
    ST->>ST: Solve OLS Regression via PyTorch (y = Wx + b)
    ST-->>A: Statistical Profile (Trend, Points)

    A->>N: map_to_storyboard(stats, story)
    
    loop For each Narrative Beat
        N->>SM: story.get_characters(stats)
        N->>SM: story.get_voice_line(Point, Beat, Context)
        SM-->>N: Specialized Dialogue (e.g. "FORSYTH BARR KICKOFF")
        
        N->>M: render_stats_chart_base64(...)
        M-->>N: Base64 Plot
        
        N->>N: Assemble Panel
    end
    
    N-->>A: Completed Storyboard JSON
    A-->>S: Return Storyboard Object
    
    S->>U: Render <Panel /> sequence
```

## Key Components

### 1. Statistical Processing (`backend/pipeline/stats.py`)
Calculates the central tendency and identifies the **Narrative Archetype** of each point (e.g., "Outlier," "Peak," "Mean"). We use PyTorch for the linear regression to ensure the trend lines are mathematically precise.

### 2. Narrative Beat Mapping (`backend/pipeline/narrative.py`)
Determines the "rhythm" of the comic. It decides when to show the "Opening," where the "Turning Point" (greatest change) occurs, and how to conclude the story (Cliffhanger vs. Plateau).

### 3. Character Voice Bank (`backend/pipeline/voices.py`)
Injects personality. Each data archeype (The Mean, Standard Deviation, The Outlier) has a distinct voice. This layer also handles **Correlation Logic** (e.g., relating Screen Time to COVID-19 lockdowns).

### 4. Dynamic Visualization (`backend/pipeline/stats.py`)
Charts are generated on-the-fly as Base64 images. This ensures the hand-drawn xkcd aesthetic remains consistent between the data visuals and the stick-figure characters.
