from httpx import AsyncClient

from tests.conftest import PREFIX


class TestGetMe:
    async def test_returns_200_with_user_profile(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.get(f"{PREFIX}/users/me", headers=auth_headers)

        assert resp.status_code == 200
        body = resp.json()
        assert body["name"] == "nicolas"
        assert body["email"] == "nicolas@example.com"
        assert "id" in body
        assert "password" not in body

    async def test_returns_401_without_token(self, client: AsyncClient):
        resp = await client.get(f"{PREFIX}/users/me")

        assert resp.status_code == 401

    async def test_returns_401_with_invalid_token(self, client: AsyncClient):
        resp = await client.get(
            f"{PREFIX}/users/me",
            headers={"Authorization": "Bearer invalid.token.here"},
        )

        assert resp.status_code == 401
