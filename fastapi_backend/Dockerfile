FROM python:3.10-slim

WORKDIR /app

# Install system dependencies including git
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --upgrade pip

# Copy requirements first to leverage Docker cache
COPY requirements-backend.txt .

# First install non-private requirements
RUN pip install --no-cache-dir -r requirements-backend.txt

# Copy the rest of the application
COPY . .

# Install local packages in development mode
RUN pip install -e /app/surreal-lite-py  # Update this path if different
RUN pip install -e /app/podcastfy  # Update this path if different

# Expose the port the app runs on
EXPOSE 8001

# Command to run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8001"]
