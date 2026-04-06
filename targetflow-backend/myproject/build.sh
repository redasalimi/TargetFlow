#!/usr/bin/env bash
# Build script for Render.com - Django Backend

set -o errexit  # Exit on error

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
