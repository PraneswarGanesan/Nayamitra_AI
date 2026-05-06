# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
# PYTHONDONTWRITEBYTECODE: Prevents Python from writing pyc files to disc (equivalent to python -B option)
# PYTHONUNBUFFERED: Prevents Python from buffering stdout and stderr (equivalent to python -u option)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    # Optional: set a default port if the hosting provider doesn't pass one
    PORT=8000

# Set work directory
WORKDIR /app

# Install system dependencies
# We need libpq-dev and gcc for psycopg2, and poppler-utils for pymupdf if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files into the container
COPY . .

# Expose the port (Render/Heroku will dynamically assign the PORT env variable)
EXPOSE $PORT

# Command to run the application using Uvicorn
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
