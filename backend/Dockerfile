# Use an official Python runtime as parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get clean && apt-get update --fix-missing && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy the current directory contents into the container at /app
COPY . /app

# Install the required Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Download YOLOv5 repo and install dependencies
RUN git clone https://github.com/ultralytics/yolov5.git /app/yolov5
RUN pip install -r /app/yolov5/requirements.txt

# Set environment variable
ENV PYTHONUNBUFFERED=1

# Expose port 8000 for the FastAPI app
EXPOSE 8000

# Run the FastAPI app using Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
