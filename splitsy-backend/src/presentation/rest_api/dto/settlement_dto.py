from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class SettlementCreateDTO(BaseModel):
    from_participant_id: str = Field(..., description="UUID of the participant who is paying")
    to_participant_id: str = Field(
        ..., description="UUID of the participant who receives the payment"
    )
    amount: Decimal = Field(..., gt=0, description="Amount being settled")
    date: datetime = Field(..., description="Date of the settlement")
    note: str | None = Field(None, max_length=500, description="Optional note")


class SettlementResponseDTO(BaseModel):
    id: str
    group_id: str
    from_participant_id: str
    to_participant_id: str
    amount: Decimal
    date: datetime
    note: str | None

    @classmethod
    def from_entity(cls, settlement) -> SettlementResponseDTO:
        return cls(
            id=settlement.id,
            group_id=settlement.group_id,
            from_participant_id=settlement.from_participant_id,
            to_participant_id=settlement.to_participant_id,
            amount=settlement.amount,
            date=settlement.date,
            note=settlement.note,
        )
