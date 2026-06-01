import pytest
from httpx import ASGITransport, AsyncClient
from starlette.testclient import TestClient

from src.infrastructure.common.base_orm import Base
from src.presentation.rest_api.main import app

PREFIX = "/api/splitsy/v0"


@pytest.fixture(scope="session", autouse=True)
def lifespan():
    with TestClient(app):
        yield


@pytest.fixture(autouse=True)
async def clean_db(lifespan):
    root = app.state.composition_root
    async with root._engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)


@pytest.fixture(scope="session")
async def client(lifespan):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


async def register_user(
    client: AsyncClient,
    *,
    name: str = "Nicolas",
    email: str = "nicolas@example.com",
    password: str = "Password123!",
) -> dict:
    resp = await client.post(
        f"{PREFIX}/auth/register",
        json={"name": name, "email": email, "password": password},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


async def get_token(
    client: AsyncClient,
    *,
    email: str = "nicolas@example.com",
    password: str = "Password123!",
) -> str:
    resp = await client.post(
        f"{PREFIX}/auth/token",
        data={"username": email, "password": password},
    )
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


@pytest.fixture
async def auth_headers(client: AsyncClient) -> dict:
    await register_user(client)
    token = await get_token(client)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def registered_user(client: AsyncClient, auth_headers: dict) -> dict:
    resp = await client.get(f"{PREFIX}/users/me", headers=auth_headers)
    assert resp.status_code == 200, resp.text
    return resp.json()
