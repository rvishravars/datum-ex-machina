# --- STAGE 1: Build the Frontend ---
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# --- STAGE 2: Build the Final App ---
FROM python:3.13-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy Backend Source
COPY backend/ ./backend/

# Copy Frontend Build into Backend Static folder
# This matches our update in main.py to serve from 'static'
COPY --from=frontend-build /app/frontend/dist ./backend/static

# Ensure the data directory for quiz results exists
RUN mkdir -p /app/backend/data

# Default port for Cloud Run and local access
ENV PORT=8080
EXPOSE 8080

WORKDIR /app/backend
CMD python3 -m uvicorn main:app --host 0.0.0.0 --port $PORT
