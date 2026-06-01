from datetime import datetime, timezone
from decimal import Decimal

from src.domain.settlements.entities.settlement import Settlement, SettlementData


class SettlementMother:
    _DEFAULT_GROUP_ID = "660e8400-e29b-41d4-a716-446655440000"
    _DEFAULT_FROM_PARTICIPANT_ID = "550e8400-e29b-41d4-a716-446655440000"
    _DEFAULT_TO_PARTICIPANT_ID = "440e8400-e29b-41d4-a716-446655440000"
    _DEFAULT_AMOUNT = Decimal("20.00")
    _DEFAULT_DATE = datetime(2026, 1, 15, 20, 0, 0, tzinfo=timezone.utc)
    _DEFAULT_ID = "880e8400-e29b-41d4-a716-446655440000"

    @staticmethod
    def create(**overrides) -> Settlement:
        data = SettlementData(
            id=overrides.get("id", SettlementMother._DEFAULT_ID),
            group_id=overrides.get("group_id", SettlementMother._DEFAULT_GROUP_ID),
            from_participant_id=overrides.get(
                "from_participant_id", SettlementMother._DEFAULT_FROM_PARTICIPANT_ID
            ),
            to_participant_id=overrides.get(
                "to_participant_id", SettlementMother._DEFAULT_TO_PARTICIPANT_ID
            ),
            amount=overrides.get("amount", SettlementMother._DEFAULT_AMOUNT),
            date=overrides.get("date", SettlementMother._DEFAULT_DATE),
            note=overrides.get("note", None),
        )
        return Settlement.create(data)
