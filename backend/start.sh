#!/bin/bash
# Start the Vedic Astro Backend Server
# Run this script from the backend directory: ./start.sh

export PYTHONPATH="$(dirname "$0")"
echo "Starting Vedic Astro Backend Server..."
echo "PYTHONPATH set to: $PYTHONPATH"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
