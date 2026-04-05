# API / Backend Dockerfile
FROM python:3.13-slim

WORKDIR /app

# Install system dependencies for Matplotlib and image processing
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY . .

# Ensure the data directory for quiz results exists and is writable
RUN mkdir -p data

# Default port for Cloud Run is 8080 or the PORT env var
ENV PORT=8080
EXPOSE 8080

# Start the uvicorn server using the PORT environment variable
CMD python3 -m uvicorn main:app --host 0.0.0.0 --port $PORT
