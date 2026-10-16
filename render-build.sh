#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "==> Upgrading pip..."
pip install --upgrade pip

echo "==> Installing Python dependencies..."
if [ -f "backend/requirements.txt" ]; then
    pip install --no-cache-dir -r backend/requirements.txt
else
    pip install --no-cache-dir -r requirements.txt
fi

echo "==> Downloading spaCy language model..."
python -m spacy download en_core_web_sm

echo "==> Build complete!"
