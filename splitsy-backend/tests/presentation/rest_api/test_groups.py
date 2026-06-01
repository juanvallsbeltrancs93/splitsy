from httpx import AsyncClient

from tests.conftest import PREFIX, get_token, register_user

EXPENSE_DATE = "2026-01-15T20:00:00Z"
SETTLEMENT_DATE = "2026-01-15T20:00:00Z"


class TestCreateGroup:
    async def test_returns_201_with_group_data(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        resp = await client.post(
            f"{PREFIX}/groups",
            json={"name": "Weekend Trip"},
            headers=auth_headers,
        )

        assert resp.status_code == 201
        body = resp.json()
        assert body["name"] == "weekend trip"
        assert body["currency"] == "USD"
        assert any(p["user_id"] == registered_user["id"] for p in body["participants"])
        assert "id" in body

    async def test_returns_401_without_token(self, client: AsyncClient):
        resp = await client.post(f"{PREFIX}/groups", json={"name": "Weekend Trip"})

        assert resp.status_code == 401

    async def test_returns_422_when_name_empty(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.post(
            f"{PREFIX}/groups", json={"name": ""}, headers=auth_headers
        )

        assert resp.status_code == 422

    async def test_creates_group_with_alias_participants(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        resp = await client.post(
            f"{PREFIX}/groups",
            json={"name": "Trip", "aliases": ["Alice", "Bob"]},
            headers=auth_headers,
        )

        assert resp.status_code == 201
        body = resp.json()
        assert body["currency"] == "USD"
        assert len(body["participants"]) == 3
        registered = [p for p in body["participants"] if p["type"] == "REGISTERED"]
        aliases = [p for p in body["participants"] if p["type"] == "NON_REGISTERED"]
        assert len(registered) == 1
        assert registered[0]["user_id"] == registered_user["id"]
        assert len(aliases) == 2
        assert all(p["user_id"] is None for p in aliases)

    async def test_returns_explicit_currency(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        resp = await client.post(
            f"{PREFIX}/groups",
            json={"name": "Trip", "currency": "EUR"},
            headers=auth_headers,
        )

        assert resp.status_code == 201
        body = resp.json()
        assert body["currency"] == "EUR"

    async def test_returns_422_when_currency_lowercase(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.post(
            f"{PREFIX}/groups",
            json={"name": "Trip", "currency": "usd"},
            headers=auth_headers,
        )

        assert resp.status_code == 422

    async def test_returns_422_when_currency_empty(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.post(
            f"{PREFIX}/groups",
            json={"name": "Trip", "currency": ""},
            headers=auth_headers,
        )

        assert resp.status_code == 422


class TestGetGroup:
    async def test_returns_200_with_group(
        self, client: AsyncClient, auth_headers: dict
    ):
        created = (
            await client.post(
                f"{PREFIX}/groups", json={"name": "Trip"}, headers=auth_headers
            )
        ).json()

        resp = await client.get(
            f"{PREFIX}/groups/{created['id']}", headers=auth_headers
        )

        assert resp.status_code == 200
        body = resp.json()
        assert body["id"] == created["id"]
        assert body["currency"] == "USD"

    async def test_returns_404_when_group_not_found(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.get(
            f"{PREFIX}/groups/00000000-0000-4000-a000-000000000000",
            headers=auth_headers,
        )

        assert resp.status_code == 404


class TestAddParticipant:
    async def test_returns_200_with_updated_participants(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        second = await register_user(
            client, name="Ana", email="ana@example.com", password="Password123!"
        )
        token_resp = await client.post(
            f"{PREFIX}/auth/token",
            data={"username": "ana@example.com", "password": "Password123!"},
        )
        second_headers = {
            "Authorization": f"Bearer {token_resp.json()['access_token']}"
        }

        group = (
            await client.post(
                f"{PREFIX}/groups", json={"name": "Trip"}, headers=auth_headers
            )
        ).json()

        resp = await client.post(
            f"{PREFIX}/groups/{group['id']}/participants",
            json={"type": "registered", "user_id": second["id"]},
            headers=second_headers,
        )

        assert resp.status_code == 200
        body = resp.json()
        assert body["currency"] == "USD"
        assert any(p["user_id"] == second["id"] for p in body["participants"])

    async def test_returns_409_when_user_already_in_group(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        group = (
            await client.post(
                f"{PREFIX}/groups", json={"name": "Trip"}, headers=auth_headers
            )
        ).json()

        resp = await client.post(
            f"{PREFIX}/groups/{group['id']}/participants",
            json={"type": "registered", "user_id": registered_user["id"]},
            headers=auth_headers,
        )

        assert resp.status_code == 409


class TestRemoveParticipant:
    async def test_returns_200_with_participant_removed(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        second = await register_user(
            client, name="Ana", email="ana@example.com", password="Password123!"
        )
        token_resp = await client.post(
            f"{PREFIX}/auth/token",
            data={"username": "ana@example.com", "password": "Password123!"},
        )
        second_headers = {
            "Authorization": f"Bearer {token_resp.json()['access_token']}"
        }

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
        participant_id = next(
            p["id"]
            for p in add_resp.json()["participants"]
            if p.get("user_id") == second["id"]
        )

        resp = await client.delete(
            f"{PREFIX}/groups/{group['id']}/participants/{participant_id}",
            headers=auth_headers,
        )

        assert resp.status_code == 200
        body = resp.json()
        assert body["currency"] == "USD"
        assert not any(p.get("user_id") == second["id"] for p in body["participants"])

    async def test_returns_404_when_user_not_in_group(
        self, client: AsyncClient, auth_headers: dict
    ):
        group = (
            await client.post(
                f"{PREFIX}/groups", json={"name": "Trip"}, headers=auth_headers
            )
        ).json()

        resp = await client.delete(
            f"{PREFIX}/groups/{group['id']}/participants/00000000-0000-4000-a000-000000000000",
            headers=auth_headers,
        )

        assert resp.status_code == 404


class TestGetGroupBalances:
    async def test_returns_200_with_balances_list(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        group = (
            await client.post(
                f"{PREFIX}/groups", json={"name": "Trip"}, headers=auth_headers
            )
        ).json()

        resp = await client.get(
            f"{PREFIX}/groups/{group['id']}/balances", headers=auth_headers
        )

        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_returns_404_when_group_not_found(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.get(
            f"{PREFIX}/groups/00000000-0000-4000-a000-000000000000/balances",
            headers=auth_headers,
        )

        assert resp.status_code == 404


class TestUpdateGroupName:
    async def test_returns_200_with_updated_name(
        self, client: AsyncClient, auth_headers: dict
    ):
        group = (
            await client.post(
                f"{PREFIX}/groups", json={"name": "old name"}, headers=auth_headers
            )
        ).json()

        resp = await client.patch(
            f"{PREFIX}/groups/{group['id']}",
            json={"name": "new name"},
            headers=auth_headers,
        )

        assert resp.status_code == 200
        body = resp.json()
        assert body["name"] == "new name"
        assert body["currency"] == "USD"

    async def test_returns_404_when_group_not_found(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.patch(
            f"{PREFIX}/groups/00000000-0000-4000-a000-000000000000",
            json={"name": "new name"},
            headers=auth_headers,
        )

        assert resp.status_code == 404

    async def test_returns_422_when_name_too_short(
        self, client: AsyncClient, auth_headers: dict
    ):
        group = (
            await client.post(
                f"{PREFIX}/groups", json={"name": "old name"}, headers=auth_headers
            )
        ).json()

        resp = await client.patch(
            f"{PREFIX}/groups/{group['id']}",
            json={"name": "x"},
            headers=auth_headers,
        )

        assert resp.status_code == 422

    async def test_normalizes_name_to_lowercase(
        self, client: AsyncClient, auth_headers: dict
    ):
        group = (
            await client.post(
                f"{PREFIX}/groups", json={"name": "old name"}, headers=auth_headers
            )
        ).json()

        resp = await client.patch(
            f"{PREFIX}/groups/{group['id']}",
            json={"name": "UPPER CASE NAME"},
            headers=auth_headers,
        )

        assert resp.status_code == 200
        assert resp.json()["name"] == "upper case name"


class TestDeleteGroup:
    async def test_returns_204_on_success(
        self, client: AsyncClient, auth_headers: dict
    ):
        group = (
            await client.post(
                f"{PREFIX}/groups", json={"name": "Trip"}, headers=auth_headers
            )
        ).json()

        resp = await client.delete(
            f"{PREFIX}/groups/{group['id']}", headers=auth_headers
        )

        assert resp.status_code == 204
        assert resp.content == b""

    async def test_returns_404_when_group_not_found(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.delete(
            f"{PREFIX}/groups/00000000-0000-4000-a000-000000000000",
            headers=auth_headers,
        )

        assert resp.status_code == 404

    async def test_deletes_linked_expenses_and_settlements(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        second = await register_user(
            client, name="Ana", email="ana@example.com", password="Password123!"
        )
        token_resp = await client.post(
            f"{PREFIX}/auth/token",
            data={"username": "ana@example.com", "password": "Password123!"},
        )
        second_headers = {
            "Authorization": f"Bearer {token_resp.json()['access_token']}"
        }

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

        expense = (
            await client.post(
                f"{PREFIX}/expenses/group/{group['id']}",
                json={
                    "name": "Dinner",
                    "amount": "50.00",
                    "date": EXPENSE_DATE,
                    "paid_by": first_participant_id,
                    "splits": [
                        {"participant_id": first_participant_id, "amount": "50.00"}
                    ],
                },
                headers=auth_headers,
            )
        ).json()

        settlement_resp = await client.post(
            f"{PREFIX}/settlements/group/{group['id']}",
            json={
                "from_participant_id": second_participant_id,
                "to_participant_id": first_participant_id,
                "amount": "25.00",
                "date": SETTLEMENT_DATE,
            },
            headers=auth_headers,
        )
        assert settlement_resp.status_code == 201

        del_resp = await client.delete(
            f"{PREFIX}/groups/{group['id']}", headers=auth_headers
        )
        assert del_resp.status_code == 204

        expense_resp = await client.get(
            f"{PREFIX}/expenses/{expense['id']}", headers=auth_headers
        )
        assert expense_resp.status_code == 404

        settlements_resp = await client.get(
            f"{PREFIX}/settlements/group/{group['id']}", headers=auth_headers
        )
        assert settlements_resp.status_code in (404, 200)
        if settlements_resp.status_code == 200:
            assert settlements_resp.json() == []


class TestListUserGroups:
    async def test_list_user_groups_returns_groups(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        await client.post(
            f"{PREFIX}/groups", json={"name": "Group One"}, headers=auth_headers
        )
        await client.post(
            f"{PREFIX}/groups", json={"name": "Group Two"}, headers=auth_headers
        )

        resp = await client.get(f"{PREFIX}/groups", headers=auth_headers)

        assert resp.status_code == 200
        body = resp.json()
        assert isinstance(body, list)
        assert len(body) == 2
        assert all("currency" in g for g in body)

    async def test_list_user_groups_empty(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.get(f"{PREFIX}/groups", headers=auth_headers)

        assert resp.status_code == 200
        assert resp.json() == []

    async def test_list_user_groups_only_returns_participant_groups(
        self, client: AsyncClient, auth_headers: dict
    ):
        await register_user(client, email="other@example.com")
        other_token = await get_token(client, email="other@example.com")
        other_headers = {"Authorization": f"Bearer {other_token}"}

        await client.post(
            f"{PREFIX}/groups", json={"name": "My Group"}, headers=auth_headers
        )
        await client.post(
            f"{PREFIX}/groups", json={"name": "Other Group"}, headers=other_headers
        )

        resp = await client.get(f"{PREFIX}/groups", headers=auth_headers)

        assert resp.status_code == 200
        body = resp.json()
        assert len(body) == 1
        assert body[0]["name"] == "my group"

    async def test_list_user_groups_unauthorized(self, client: AsyncClient):
        resp = await client.get(f"{PREFIX}/groups")

        assert resp.status_code == 401


class TestClaimParticipant:
    async def test_claim_participant_success(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        second = await register_user(
            client, name="Bob", email="bob@example.com", password="Password123!"
        )
        second_token = (
            await client.post(
                f"{PREFIX}/auth/token",
                data={"username": "bob@example.com", "password": "Password123!"},
            )
        ).json()["access_token"]
        second_headers = {"Authorization": f"Bearer {second_token}"}

        group = (
            await client.post(
                f"{PREFIX}/groups",
                json={"name": "Trip", "aliases": ["Alias Bob"]},
                headers=auth_headers,
            )
        ).json()

        alias = next(p for p in group["participants"] if p["type"] == "NON_REGISTERED")

        resp = await client.post(
            f"{PREFIX}/groups/{group['id']}/claim/{alias['id']}",
            headers=second_headers,
        )

        assert resp.status_code == 200
        body = resp.json()
        assert body["currency"] == "USD"
        claimed = next(p for p in body["participants"] if p["id"] == alias["id"])
        assert claimed["type"] == "REGISTERED"
        assert claimed["user_id"] == second["id"]

    async def test_claim_participant_not_found(
        self, client: AsyncClient, auth_headers: dict
    ):
        group = (
            await client.post(
                f"{PREFIX}/groups", json={"name": "Trip"}, headers=auth_headers
            )
        ).json()

        resp = await client.post(
            f"{PREFIX}/groups/{group['id']}/claim/00000000-0000-4000-a000-000000000000",
            headers=auth_headers,
        )

        assert resp.status_code == 404

    async def test_claim_already_registered(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        await register_user(
            client, name="Bob", email="bob@example.com", password="Password123!"
        )
        second_token = (
            await client.post(
                f"{PREFIX}/auth/token",
                data={"username": "bob@example.com", "password": "Password123!"},
            )
        ).json()["access_token"]
        second_headers = {"Authorization": f"Bearer {second_token}"}

        group = (
            await client.post(
                f"{PREFIX}/groups",
                json={"name": "Trip"},
                headers=auth_headers,
            )
        ).json()

        registered_p = next(
            p for p in group["participants"] if p["type"] == "REGISTERED"
        )

        resp = await client.post(
            f"{PREFIX}/groups/{group['id']}/claim/{registered_p['id']}",
            headers=second_headers,
        )

        assert resp.status_code == 422

    async def test_claim_user_already_in_group(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        await register_user(
            client, name="Bob", email="bob@example.com", password="Password123!"
        )
        second_token = (
            await client.post(
                f"{PREFIX}/auth/token",
                data={"username": "bob@example.com", "password": "Password123!"},
            )
        ).json()["access_token"]
        second_headers = {"Authorization": f"Bearer {second_token}"}

        group = (
            await client.post(
                f"{PREFIX}/groups",
                json={"name": "Trip", "aliases": ["Alias1", "Alias2"]},
                headers=auth_headers,
            )
        ).json()

        aliases = [p for p in group["participants"] if p["type"] == "NON_REGISTERED"]

        await client.post(
            f"{PREFIX}/groups/{group['id']}/claim/{aliases[0]['id']}",
            headers=second_headers,
        )

        resp = await client.post(
            f"{PREFIX}/groups/{group['id']}/claim/{aliases[1]['id']}",
            headers=second_headers,
        )

        assert resp.status_code == 409

    async def test_claim_unauthorized(self, client: AsyncClient, auth_headers: dict):
        group = (
            await client.post(
                f"{PREFIX}/groups",
                json={"name": "Trip", "aliases": ["Bob"]},
                headers=auth_headers,
            )
        ).json()

        alias = next(p for p in group["participants"] if p["type"] == "NON_REGISTERED")

        resp = await client.post(f"{PREFIX}/groups/{group['id']}/claim/{alias['id']}")

        assert resp.status_code == 401
