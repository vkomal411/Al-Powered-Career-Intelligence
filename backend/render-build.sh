#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "==> Upgrading pip..."
pip install --upgrade pip

echo "==> Installing Python dependencies..."
pip install --no-cache-dir -r requirements.txt

echo "==> Downloading spaCy language model..."
python -m spacy download en_core_web_sm

echo "==> Build complete!"
