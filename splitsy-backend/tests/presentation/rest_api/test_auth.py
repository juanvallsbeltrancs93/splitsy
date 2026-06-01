from httpx import AsyncClient

from tests.conftest import PREFIX, register_user


class TestRegister:
    async def test_returns_201_with_user_data(self, client: AsyncClient):
        resp = await client.post(
            f"{PREFIX}/auth/register",
            json={
                "name": "Nicolas",
                "email": "nicolas@example.com",
                "password": "Password123!",
            },
        )

        assert resp.status_code == 201
        body = resp.json()
        assert body["name"] == "nicolas"
        assert body["email"] == "nicolas@example.com"
        assert "id" in body
        assert "password" not in body

    async def test_returns_409_when_email_already_registered(self, client: AsyncClient):
        await register_user(client)

        resp = await client.post(
            f"{PREFIX}/auth/register",
            json={
                "name": "Other",
                "email": "nicolas@example.com",
                "password": "Password123!",
            },
        )

        assert resp.status_code == 409

    async def test_returns_422_when_password_too_short(self, client: AsyncClient):
        resp = await client.post(
            f"{PREFIX}/auth/register",
            json={"name": "Nicolas", "email": "nicolas@example.com", "password": "abc"},
        )

        assert resp.status_code == 422

    async def test_returns_422_when_email_invalid(self, client: AsyncClient):
        resp = await client.post(
            f"{PREFIX}/auth/register",
            json={
                "name": "Nicolas",
                "email": "not-an-email",
                "password": "Password123!",
            },
        )

        assert resp.status_code == 422


class TestLogin:
    async def test_returns_200_with_token(self, client: AsyncClient):
        await register_user(client)

        resp = await client.post(
            f"{PREFIX}/auth/token",
            data={"username": "nicolas@example.com", "password": "Password123!"},
        )

        assert resp.status_code == 200
        body = resp.json()
        assert "access_token" in body
        assert "refresh_token" in body
        assert body["token_type"] == "bearer"

    async def test_returns_401_when_password_wrong(self, client: AsyncClient):
        await register_user(client)

        resp = await client.post(
            f"{PREFIX}/auth/token",
            data={"username": "nicolas@example.com", "password": "WrongPassword!"},
        )

        assert resp.status_code == 401

    async def test_returns_401_when_user_does_not_exist(self, client: AsyncClient):
        resp = await client.post(
            f"{PREFIX}/auth/token",
            data={"username": "ghost@example.com", "password": "Password123!"},
        )

        assert resp.status_code == 401


class TestRefreshToken:
    async def test_returns_200_with_new_tokens_when_refresh_valid(
        self, client: AsyncClient
    ):
        await register_user(client)

        login_resp = await client.post(
            f"{PREFIX}/auth/token",
            data={"username": "nicolas@example.com", "password": "Password123!"},
        )
        refresh_token = login_resp.json()["refresh_token"]

        resp = await client.post(
            f"{PREFIX}/auth/refresh", json={"refresh_token": refresh_token}
        )

        assert resp.status_code == 200
        body = resp.json()
        assert "access_token" in body
        assert "refresh_token" in body
        assert body["token_type"] == "bearer"

    async def test_returns_401_when_refresh_token_invalid(self, client: AsyncClient):
        resp = await client.post(
            f"{PREFIX}/auth/refresh", json={"refresh_token": "invalid_token"}
        )

        assert resp.status_code == 401

    async def test_returns_401_when_refresh_token_is_access_token(
        self, client: AsyncClient
    ):
        await register_user(client)

        login_resp = await client.post(
            f"{PREFIX}/auth/token",
            data={"username": "nicolas@example.com", "password": "Password123!"},
        )
        access_token = login_resp.json()["access_token"]

        resp = await client.post(
            f"{PREFIX}/auth/refresh", json={"refresh_token": access_token}
        )

        assert resp.status_code == 401
