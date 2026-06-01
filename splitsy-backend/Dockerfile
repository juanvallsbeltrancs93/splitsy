# ── Build stage ─────────────────────────────────────────────────────────────
FROM python:3.13-slim AS builder

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy dependency files
COPY pyproject.toml uv.lock ./
COPY README.md ./

# Install production dependencies only
RUN uv sync --frozen --no-dev

# ── Production stage ────────────────────────────────────────────────────────
FROM python:3.13-slim

WORKDIR /app

# Install uv (needed to run the app)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy installed dependencies from builder
COPY --from=builder /app/.venv /app/.venv

# Copy source code
COPY src ./src
COPY main.py ./
COPY alembic.ini ./
COPY migrations ./migrations
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
