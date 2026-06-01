# Splitsy Backend

![Python](https://img.shields.io/badge/python-3.12%20%7C%203.13-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.123+-009688)
![License](https://img.shields.io/badge/license-MIT-green)
[![CI run tests](https://github.com/juanValls/splitsy-backend/actions/workflows/ci-run-tests.yml/badge.svg?branch=main)](https://github.com/juanValls/splitsy-backend/actions/workflows/ci-run-tests.yml)

Backend API for **Splitsy** — an app to track and split shared expenses among groups of people. Manage groups, add expenses, record settlements, and calculate balances.

## Table of Contents

- [Splitsy Backend](#splitsy-backend)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Getting Started](#getting-started)
  - [Environment Variables](#environment-variables)
  - [Running the Server](#running-the-server)
  - [API Endpoints](#api-endpoints)
    - [Auth](#auth)
    - [Users](#users)
    - [Groups](#groups)
    - [Expenses](#expenses)
    - [Settlements](#settlements)
    - [Health](#health)
  - [API Documentation](#api-documentation)
  - [Testing](#testing)
  - [Architecture](#architecture)
  - [Project Structure](#project-structure)
  - [License](#license)

## Prerequisites

- **Python** 3.12 or 3.13
- **uv** — fast Python package manager ([install guide](https://docs.astral.sh/uv/getting-started/installation/))
- **PostgreSQL** — for production (tests use SQLite in-memory)

## Getting Started

```bash
# Clone the repository
git clone <repository-url>
cd splitsy-backend

# Install dependencies
uv sync --dev

# Copy the example environment file and configure it
cp .env.example .env
```

## Environment Variables

Create a `.env` file in the project root. The only **required** variable is the database URI:

| Variable                       | Required | Default                | Description                          |
| ------------------------------ | -------- | ---------------------- | ------------------------------------ |
| `DATABASE_URI`                 | Yes      | —                      | Database connection string           |
| `SECRET_KEY`                   | No       | `development_secret`   | JWT signing secret                   |
| `ACCESS_TOKEN_EXPIRE_MINUTES`  | No       | `15`                   | JWT access token expiration in minutes |
| `REFRESH_TOKEN_EXPIRE_DAYS`    | No       | `7`                    | JWT refresh token expiration in days |
| `API_BASE_URL`                 | No       | `http://0.0.0.0:8000`  | Base URL for the API                 |
| `CORS_ORIGINS`                 | No       | `["http://localhost:3000", "http://localhost:5173"]` | Allowed CORS origins |
| `ENV`                          | No       | `development`          | Environment name                     |

**Example for local development with PostgreSQL:**

```
DATABASE_URI=postgresql+asyncpg://user:password@localhost:5432/splitsy
SECRET_KEY=your-secret-key
```

## Running the Server

```bash
uv run dev
```

The server starts at `http://0.0.0.0:8000` with hot reload enabled.

## API Endpoints

All endpoints are prefixed with `/api/splitsy/v0`. Authentication uses **Bearer JWT tokens**.

### Auth

| Method | Path             | Description                                   | Auth |
| ------ | ---------------- | --------------------------------------------- | ---- |
| POST   | `/auth/register` | Register a new user                           | No   |
| POST   | `/auth/token`    | Login and get JWT access + refresh tokens     | No   |
| POST   | `/auth/refresh`  | Exchange refresh token for new token pair     | No   |

### Users

| Method | Path         | Description              | Auth |
| ------ | ------------ | ------------------------ | ---- |
| GET    | `/users/me`  | Get current user profile | Yes  |

### Groups

| Method | Path                                        | Description                        | Auth |
| ------ | ------------------------------------------- | ---------------------------------- | ---- |
| GET    | `/groups`                                   | List user's groups                 | Yes  |
| POST   | `/groups`                                   | Create a group                     | Yes  |
| GET    | `/groups/{group_id}`                        | Get group details                  | Yes  |
| PATCH  | `/groups/{group_id}`                        | Update a group                     | Yes  |
| DELETE | `/groups/{group_id}`                        | Delete a group                     | Yes  |
| POST   | `/groups/{group_id}/participants`           | Add a participant to a group       | Yes  |
| DELETE | `/groups/{group_id}/participants/{id}`      | Remove a participant from a group  | Yes  |
| POST   | `/groups/{group_id}/claim/{participant_id}` | Claim an alias participant as user | Yes  |
| GET    | `/groups/{group_id}/balances`               | Get group balances                 | Yes  |

### Expenses

| Method | Path                        | Description                    | Auth |
| ------ | --------------------------- | ------------------------------ | ---- |
| POST   | `/expenses/group/{group_id}` | Create an expense in a group  | Yes  |
| GET    | `/expenses/group/{group_id}` | List expenses for a group     | Yes  |
| GET    | `/expenses/{expense_id}`     | Get expense details           | Yes  |
| PATCH  | `/expenses/{expense_id}`     | Update an expense             | Yes  |
| DELETE | `/expenses/{expense_id}`     | Delete an expense             | Yes  |

### Settlements

| Method | Path                             | Description                      | Auth |
| ------ | -------------------------------- | -------------------------------- | ---- |
| POST   | `/settlements/group/{group_id}`  | Record a settlement in a group   | Yes  |
| GET    | `/settlements/group/{group_id}`  | List settlements for a group     | Yes  |

### Health

| Method | Path              | Description      | Auth |
| ------ | ----------------- | ---------------- | ---- |
| GET    | `/api/splitsy/health` | Health check | No   |

## API Documentation

Once the server is running, interactive docs are available at:

- **Swagger UI** — [http://localhost:8000/api/splitsy/docs](http://localhost:8000/api/splitsy/docs)
- **ReDoc** — [http://localhost:8000/api/splitsy/redoc](http://localhost:8000/api/splitsy/redoc)

## Testing

Tests use an **in-memory SQLite** database — no external services required.

```bash
# Run all tests
uv run pytest

# Run with coverage report
uv run pytest --cov
```

## Architecture

The project follows **Clean Architecture** (Hexagonal) with clearly separated layers:

```
src/
├── domain/           # Entities, value objects, use cases, repository interfaces
├── infrastructure/   # Database, auth, and external service implementations
├── presentation/     # FastAPI routers, DTOs, and HTTP layer
├── common/           # Shared utilities
└── composition_root.py  # Dependency injection wiring
```

- **Domain** — business logic with no framework dependencies. Each bounded context (users, groups, expenses, settlements) is a separate module.
- **Infrastructure** — implements repository interfaces using SQLAlchemy async, JWT token service with PyJWT, and password hashing with Argon2.
- **Presentation** — FastAPI routers, request/response DTOs, and middleware.
- **Composition Root** — wires all dependencies together using a singleton pattern, injected into the app via FastAPI's lifespan.

## Project Structure

```
splitsy-backend/
├── .github/workflows/    # CI pipeline (pytest + coverage)
├── src/
│   ├── domain/
│   │   ├── common/       # Entity and ValueObject base classes
│   │   ├── users/        # User entity, use cases, repository interface
│   │   ├── groups/       # Group entity, participants, balances
│   │   ├── expenses/     # Expense entity, split logic
│   │   └── settlements/  # Settlement entity, payment records
│   ├── infrastructure/   # SQLAlchemy repos, JWT, password hashing
│   ├── presentation/     # FastAPI app, routers, dependencies
│   └── composition_root.py
├── tests/
│   └── mothers/          # Object Mother test factories
├── main.py               # Dev server entry point
├── pyproject.toml        # Project config and dependencies
└── .env                  # Environment variables (not committed)
```

## License

This project is licensed under the [MIT License](LICENSE).
