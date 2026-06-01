#!/bin/sh
set -e

# Run database migrations
uv run alembic upgrade head

if [ "$ENVIRONMENT" = "development" ]; then
    exec uv run uvicorn src.presentation.rest_api.main:app --host 0.0.0.0 --port 8000 --reload
else
    exec uv run uvicorn src.presentation.rest_api.main:app --host 0.0.0.0 --port 8000
fi
