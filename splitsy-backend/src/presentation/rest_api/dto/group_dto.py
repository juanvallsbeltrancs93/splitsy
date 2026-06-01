from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel, Field

from src.domain.groups.entities.participant import Participant


class GroupCreateDTO(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Group name",
        example="Weekend Trip",
    )
    aliases: list[str] = []
    currency: str = Field(default="USD", pattern=r"^[A-Z]{3}$")


class AddParticipantDTO(BaseModel):
    type: str
    user_id: str | None = None
    display_name: str | None = None


class UpdateGroupNameDTO(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)


class ParticipantResponseDTO(BaseModel):
    id: str
    display_name: str
    type: str
    user_id: str | None = None

    @classmethod
    def from_entity(cls, participant: Participant) -> ParticipantResponseDTO:
        return cls(
            id=participant.id,
            display_name=participant.display_name,
            type=participant.type.value,
            user_id=participant.user_id,
        )


class GroupResponseDTO(BaseModel):
    id: str
    name: str
    currency: str = Field(description="ISO 4217 currency code of the group (e.g., USD, EUR, ARS).")
    participants: list[ParticipantResponseDTO]

    @classmethod
    def from_entity(cls, group) -> GroupResponseDTO:
        return cls(
            id=group.id,
            name=group.name,
            currency=group.currency,
            participants=[ParticipantResponseDTO.from_entity(p) for p in group.participants],
        )


class ParticipantBalanceDTO(BaseModel):
    participant_id: str
    balance: Decimal

    @classmethod
    def from_domain(cls, balance) -> ParticipantBalanceDTO:
        return cls(participant_id=balance.participant_id, balance=balance.balance)


class GroupBalancesResponseDTO(BaseModel):
    balances: list[ParticipantBalanceDTO]
