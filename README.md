# 📓 Datum Ex Machina

> **"Where real data tells its own story."**

**Datum Ex Machina** is an interactive analytical walkthrough that transforms statistical datasets into high-fidelity technical narratives. Using a **modular story architecture**, the app provides deep insights through **PyTorch-rendered diagrams** and systematic narration, focusing on clear, objective evidence.

## 🏗️ Unified Architecture

The application is built for simplicity and performance as a **Single-Process App**:
- **Unified Server**: A FastAPI backend serves both the analytical API and the React frontend static files.
- **Port 8000**: Access everything (UI and API) through a single entry point.
- **Micro-Container**: Optimized for Google Cloud Run with a minimal memory footprint.

## 🧠 Modular Story Engine

The engine is now fully extensible. Each "Story" is a self-contained artifact inheriting from a common base:

- **2024 Highlanders: Battle Lines & Southern Pride**: A bivariate "Attacking Power vs. Defensive Pressure" analysis of a real Super Rugby season.
- **NZ Screen Time vs Sleep**: A correlation study of digital habits and the trade-off with rest, featuring **COVID-19** pandemic context.

### Extending the Narrative
To add a new story, simply create a directory in `backend/stories/` and implement a class inheriting from `BaseStory`. The system will **automatically discover** and register your new dataset and its unique narration logic.

## 🚀 Quick Start (Docker)

The project is fully containerized for both local development and cloud deployment.

### 1. Launch the App
From the project root:
```bash
docker compose up --build
```

### 2. Access the Stage
- **Unified Stage**: [http://localhost:8000](http://localhost:8000)
- **API Health**: [http://localhost:8000/api](http://localhost:8000/api)

## 📊 Feature Highlights
- **Bivariate Conflict**: Stories like the Highlanders track two metrics simultaneously (e.g., Scored vs Conceded) to show the "Winning Gap."
- **Statistical Personas**: Concept-driven characters (The High Performance Coach, The Match Official) narrate the data using real-world terminology.
- **PyTorch Diagrams**: High-fidelity charts with OLS Regression lines rendered directly from the analytical core.
- **Verified Quizzes**: Every story ends with a mental-model check to ensure the data's "lesson" was understood.

## 🛠️ Technical Stack
- **Frontend**: React, Vite, CSS Modules.
- **Backend**: FastAPI, PyTorch (OLS Regression), Matplotlib, Pandas.
- **Infrastructure**: Single-container Docker, optimized for Google Cloud Run.
- **Deployment**: `deploy-cloud.sh` for one-click GCP deployment.
