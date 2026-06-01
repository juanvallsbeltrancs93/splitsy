from httpx import AsyncClient

from tests.conftest import PREFIX, register_user

SETTLEMENT_DATE = "2026-01-15T20:00:00Z"


async def _create_group_with_two_users(
    client: AsyncClient, auth_headers: dict, registered_user: dict
) -> tuple[dict, dict, str, str]:
    second = await register_user(
        client, name="Ana", email="ana@example.com", password="Password123!"
    )
    token_resp = await client.post(
        f"{PREFIX}/auth/token",
        data={"username": "ana@example.com", "password": "Password123!"},
    )
    second_headers = {"Authorization": f"Bearer {token_resp.json()['access_token']}"}

    group = (
        await client.post(
            f"{PREFIX}/groups", json={"name": "Trip"}, headers=auth_headers
        )
    ).json()
    add_resp = await client.post(
        f"{PREFIX}/groups/{group['id']}/participants",
        json={"type": "registered", "user_id": second["id"]},
        headers=second_headers,
    )
    participants = add_resp.json()["participants"]
    first_participant_id = next(
        p["id"] for p in participants if p.get("user_id") == registered_user["id"]
    )
    second_participant_id = next(
        p["id"] for p in participants if p.get("user_id") == second["id"]
    )
    return group, second, first_participant_id, second_participant_id


async def _create_settlement(
    client: AsyncClient,
    headers: dict,
    group_id: str,
    from_participant_id: str,
    to_participant_id: str,
) -> dict:
    resp = await client.post(
        f"{PREFIX}/settlements/group/{group_id}",
        json={
            "from_participant_id": from_participant_id,
            "to_participant_id": to_participant_id,
            "amount": "20.00",
            "date": SETTLEMENT_DATE,
        },
        headers=headers,
    )
    assert resp.status_code == 201
    return resp.json()


class TestCreateSettlement:
    async def test_returns_201_with_settlement_data(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        group, second, first_participant_id, second_participant_id = (
            await _create_group_with_two_users(client, auth_headers, registered_user)
        )

        resp = await client.post(
            f"{PREFIX}/settlements/group/{group['id']}",
            json={
                "from_participant_id": first_participant_id,
                "to_participant_id": second_participant_id,
                "amount": "20.00",
                "date": SETTLEMENT_DATE,
            },
            headers=auth_headers,
        )

        assert resp.status_code == 201
        body = resp.json()
        assert body["group_id"] == group["id"]
        assert body["from_participant_id"] == first_participant_id
        assert body["to_participant_id"] == second_participant_id
        assert "id" in body

    async def test_returns_201_with_optional_note(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        group, second, first_participant_id, second_participant_id = (
            await _create_group_with_two_users(client, auth_headers, registered_user)
        )

        resp = await client.post(
            f"{PREFIX}/settlements/group/{group['id']}",
            json={
                "from_participant_id": first_participant_id,
                "to_participant_id": second_participant_id,
                "amount": "20.00",
                "date": SETTLEMENT_DATE,
                "note": "Paying back for dinner",
            },
            headers=auth_headers,
        )

        assert resp.status_code == 201
        assert resp.json()["note"] == "Paying back for dinner"

    async def test_returns_401_without_token(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        group, second, first_participant_id, second_participant_id = (
            await _create_group_with_two_users(client, auth_headers, registered_user)
        )

        resp = await client.post(
            f"{PREFIX}/settlements/group/{group['id']}",
            json={
                "from_participant_id": first_participant_id,
                "to_participant_id": second_participant_id,
                "amount": "20.00",
                "date": SETTLEMENT_DATE,
            },
        )

        assert resp.status_code == 401

    async def test_returns_422_when_amount_is_zero(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        group, second, first_participant_id, second_participant_id = (
            await _create_group_with_two_users(client, auth_headers, registered_user)
        )

        resp = await client.post(
            f"{PREFIX}/settlements/group/{group['id']}",
            json={
                "from_participant_id": first_participant_id,
                "to_participant_id": second_participant_id,
                "amount": "0",
                "date": SETTLEMENT_DATE,
            },
            headers=auth_headers,
        )

        assert resp.status_code == 422


class TestListGroupSettlements:
    async def test_returns_200_with_settlements_list(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        group, second, first_participant_id, second_participant_id = (
            await _create_group_with_two_users(client, auth_headers, registered_user)
        )
        await _create_settlement(
            client, auth_headers, group["id"], first_participant_id, second_participant_id
        )
        await _create_settlement(
            client, auth_headers, group["id"], first_participant_id, second_participant_id
        )

        resp = await client.get(
            f"{PREFIX}/settlements/group/{group['id']}", headers=auth_headers
        )

        assert resp.status_code == 200
        assert len(resp.json()) == 2

    async def test_returns_empty_list_when_no_settlements(
        self, client: AsyncClient, auth_headers: dict
    ):
        group = (
            await client.post(
                f"{PREFIX}/groups", json={"name": "Trip"}, headers=auth_headers
            )
        ).json()

        resp = await client.get(
            f"{PREFIX}/settlements/group/{group['id']}", headers=auth_headers
        )

        assert resp.status_code == 200
        assert resp.json() == []

    async def test_returns_404_when_group_not_found(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.get(
            f"{PREFIX}/settlements/group/00000000-0000-4000-a000-000000000000",
            headers=auth_headers,
        )

        assert resp.status_code == 404
