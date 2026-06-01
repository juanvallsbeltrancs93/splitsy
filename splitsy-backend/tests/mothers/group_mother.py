from uuid import uuid4

from src.domain.groups.entities import Group, GroupData, ParticipantData

_DEFAULT_PARTICIPANT_ID = "550e8400-e29b-41d4-a716-446655440000"


class GroupMother:
    _DEFAULT_NAME = "splitsy group"
    _DEFAULT_CURRENCY = "USD"
    _DEFAULT_PARTICIPANTS = [
        ParticipantData(
            display_name="Alice",
            type="NON_REGISTERED",
            id=_DEFAULT_PARTICIPANT_ID,
        )
    ]
    _DEFAULT_ID = "660e8400-e29b-41d4-a716-446655440000"

    @staticmethod
    def create(**overrides) -> Group:
        participants = overrides.get("participants", GroupMother._DEFAULT_PARTICIPANTS)
        # owner_id must be a participant.id — default to the first participant's id
        default_owner_id = participants[0].id if participants else str(uuid4())
        data = GroupData(
            name=overrides.get("name", GroupMother._DEFAULT_NAME),
            currency=overrides.get("currency", GroupMother._DEFAULT_CURRENCY),
            participants=participants,
            id=overrides.get("id", GroupMother._DEFAULT_ID),
            owner_id=overrides.get("owner_id", default_owner_id),
        )
        return Group.create(data)

    @staticmethod
    def with_single_participant() -> Group:
        return Group.create(
            GroupData(
                name=GroupMother._DEFAULT_NAME,
                currency=GroupMother._DEFAULT_CURRENCY,
                participants=[
                    ParticipantData(
                        display_name="Alice",
                        type="NON_REGISTERED",
                        id=_DEFAULT_PARTICIPANT_ID,
                    )
                ],
                id=GroupMother._DEFAULT_ID,
                owner_id=_DEFAULT_PARTICIPANT_ID,
            )
        )

    @staticmethod
    def create_with_two_participants() -> Group:
        return Group.create(
            GroupData(
                name=GroupMother._DEFAULT_NAME,
                currency=GroupMother._DEFAULT_CURRENCY,
                participants=[
                    ParticipantData(
                        display_name="Alice",
                        type="NON_REGISTERED",
                        id="550e8400-e29b-41d4-a716-446655440000",
                    ),
                    ParticipantData(
                        display_name="Bob",
                        type="NON_REGISTERED",
                        id="550e8400-e29b-41d4-a716-446655440001",
                    ),
                ],
                id=GroupMother._DEFAULT_ID,
                owner_id="550e8400-e29b-41d4-a716-446655440000",
            )
        )

    @staticmethod
    def create_with_registered_owner(owner_user_id: str, owner_participant_id: str | None = None, **overrides) -> Group:
        """Create a group with a REGISTERED participant as owner.

        The group's owner_id is the participant's id (not the user_id).
        Use this factory when tests need to exercise ownership checks via user_id.
        """
        p_id = owner_participant_id or str(uuid4())
        owner_participant = ParticipantData(
            display_name="Owner",
            type="REGISTERED",
            user_id=owner_user_id,
            id=p_id,
        )
        extra_participants = overrides.pop("extra_participants", [])
        participants = [owner_participant] + extra_participants
        data = GroupData(
            name=overrides.get("name", GroupMother._DEFAULT_NAME),
            currency=overrides.get("currency", GroupMother._DEFAULT_CURRENCY),
            participants=participants,
            id=overrides.get("id", GroupMother._DEFAULT_ID),
            owner_id=p_id,
        )
        return Group.create(data)
