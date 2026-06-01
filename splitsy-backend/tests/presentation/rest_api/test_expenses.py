from httpx import AsyncClient

from tests.conftest import PREFIX

EXPENSE_DATE = "2026-01-15T20:00:00Z"


async def _create_group(client: AsyncClient, headers: dict) -> dict:
    resp = await client.post(f"{PREFIX}/groups", json={"name": "Trip"}, headers=headers)
    assert resp.status_code == 201
    return resp.json()


def _get_participant_id(group: dict, user_id: str) -> str:
    return next(p["id"] for p in group["participants"] if p.get("user_id") == user_id)


async def _create_expense(
    client: AsyncClient, headers: dict, group_id: str, participant_id: str
) -> dict:
    resp = await client.post(
        f"{PREFIX}/expenses/group/{group_id}",
        json={
            "name": "Dinner",
            "amount": "50.00",
            "date": EXPENSE_DATE,
            "paid_by": participant_id,
            "splits": [{"participant_id": participant_id, "amount": "50.00"}],
        },
        headers=headers,
    )
    assert resp.status_code == 201
    return resp.json()


class TestCreateExpense:
    async def test_returns_201_with_expense_data(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        group = await _create_group(client, auth_headers)
        participant_id = _get_participant_id(group, registered_user["id"])

        resp = await client.post(
            f"{PREFIX}/expenses/group/{group['id']}",
            json={
                "name": "Dinner",
                "amount": "50.00",
                "date": EXPENSE_DATE,
                "paid_by": participant_id,
                "splits": [{"participant_id": participant_id, "amount": "50.00"}],
            },
            headers=auth_headers,
        )

        assert resp.status_code == 201
        body = resp.json()
        assert body["name"] == "Dinner"
        assert body["group_id"] == group["id"]
        assert body["paid_by"] == participant_id
        assert len(body["splits"]) == 1
        assert "id" in body

    async def test_returns_201_with_optional_description(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        group = await _create_group(client, auth_headers)
        participant_id = _get_participant_id(group, registered_user["id"])

        resp = await client.post(
            f"{PREFIX}/expenses/group/{group['id']}",
            json={
                "name": "Dinner",
                "amount": "50.00",
                "date": EXPENSE_DATE,
                "paid_by": participant_id,
                "splits": [{"participant_id": participant_id, "amount": "50.00"}],
                "description": "Shared meal",
            },
            headers=auth_headers,
        )

        assert resp.status_code == 201
        assert resp.json()["description"] == "Shared meal"

    async def test_returns_401_without_token(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        group = await _create_group(client, auth_headers)
        participant_id = _get_participant_id(group, registered_user["id"])

        resp = await client.post(
            f"{PREFIX}/expenses/group/{group['id']}",
            json={
                "name": "Dinner",
                "amount": "50.00",
                "date": EXPENSE_DATE,
                "paid_by": participant_id,
                "splits": [{"participant_id": participant_id, "amount": "50.00"}],
            },
        )

        assert resp.status_code == 401

    async def test_returns_422_when_amount_is_zero(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        group = await _create_group(client, auth_headers)
        participant_id = _get_participant_id(group, registered_user["id"])

        resp = await client.post(
            f"{PREFIX}/expenses/group/{group['id']}",
            json={
                "name": "Dinner",
                "amount": "0",
                "date": EXPENSE_DATE,
                "paid_by": participant_id,
                "splits": [{"participant_id": participant_id, "amount": "0"}],
            },
            headers=auth_headers,
        )

        assert resp.status_code == 422


class TestListGroupExpenses:
    async def test_returns_200_with_expenses_list(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        group = await _create_group(client, auth_headers)
        participant_id = _get_participant_id(group, registered_user["id"])
        await _create_expense(client, auth_headers, group["id"], participant_id)
        await _create_expense(client, auth_headers, group["id"], participant_id)

        resp = await client.get(
            f"{PREFIX}/expenses/group/{group['id']}", headers=auth_headers
        )

        assert resp.status_code == 200
        assert len(resp.json()) == 2

    async def test_returns_empty_list_when_no_expenses(
        self, client: AsyncClient, auth_headers: dict
    ):
        group = await _create_group(client, auth_headers)

        resp = await client.get(
            f"{PREFIX}/expenses/group/{group['id']}", headers=auth_headers
        )

        assert resp.status_code == 200
        assert resp.json() == []


class TestGetExpense:
    async def test_returns_200_with_expense(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        group = await _create_group(client, auth_headers)
        participant_id = _get_participant_id(group, registered_user["id"])
        expense = await _create_expense(
            client, auth_headers, group["id"], participant_id
        )

        resp = await client.get(
            f"{PREFIX}/expenses/{expense['id']}", headers=auth_headers
        )

        assert resp.status_code == 200
        assert resp.json()["id"] == expense["id"]

    async def test_returns_404_when_expense_not_found(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.get(
            f"{PREFIX}/expenses/00000000-0000-4000-a000-000000000000",
            headers=auth_headers,
        )

        assert resp.status_code == 404


class TestUpdateExpense:
    async def test_returns_200_with_updated_name(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        group = await _create_group(client, auth_headers)
        participant_id = _get_participant_id(group, registered_user["id"])
        expense = await _create_expense(
            client, auth_headers, group["id"], participant_id
        )

        resp = await client.patch(
            f"{PREFIX}/expenses/{expense['id']}",
            json={"name": "Lunch"},
            headers=auth_headers,
        )

        assert resp.status_code == 200
        assert resp.json()["name"] == "Lunch"

    async def test_returns_200_updating_description(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        group = await _create_group(client, auth_headers)
        participant_id = _get_participant_id(group, registered_user["id"])
        expense = await _create_expense(
            client, auth_headers, group["id"], participant_id
        )

        resp = await client.patch(
            f"{PREFIX}/expenses/{expense['id']}",
            json={"description": "Updated note"},
            headers=auth_headers,
        )

        assert resp.status_code == 200
        assert resp.json()["description"] == "Updated note"

    async def test_returns_404_when_expense_not_found(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.patch(
            f"{PREFIX}/expenses/00000000-0000-4000-a000-000000000000",
            json={"name": "Lunch"},
            headers=auth_headers,
        )

        assert resp.status_code == 404


class TestDeleteExpense:
    async def test_returns_204_on_success(
        self, client: AsyncClient, auth_headers: dict, registered_user: dict
    ):
        group = await _create_group(client, auth_headers)
        participant_id = _get_participant_id(group, registered_user["id"])
        expense = await _create_expense(
            client, auth_headers, group["id"], participant_id
        )

        resp = await client.delete(
            f"{PREFIX}/expenses/{expense['id']}", headers=auth_headers
        )

        assert resp.status_code == 204
        assert resp.content == b""

    async def test_returns_404_when_expense_not_found(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.delete(
            f"{PREFIX}/expenses/00000000-0000-4000-a000-000000000000",
            headers=auth_headers,
        )

        assert resp.status_code == 404
