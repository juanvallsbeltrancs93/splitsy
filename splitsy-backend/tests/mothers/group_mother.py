from src.domain.groups.entities import Group, GroupData, ParticipantData


class GroupMother:
    _DEFAULT_NAME = "splitsy group"
    _DEFAULT_CURRENCY = "USD"
    _DEFAULT_PARTICIPANTS = [
        ParticipantData(
            display_name="Alice",
            type="NON_REGISTERED",
            id="550e8400-e29b-41d4-a716-446655440000",
        )
    ]
    _DEFAULT_ID = "660e8400-e29b-41d4-a716-446655440000"

    @staticmethod
    def create(**overrides) -> Group:
        data = GroupData(
            name=overrides.get("name", GroupMother._DEFAULT_NAME),
            currency=overrides.get("currency", GroupMother._DEFAULT_CURRENCY),
            participants=overrides.get(
                "participants", GroupMother._DEFAULT_PARTICIPANTS
            ),
            id=overrides.get("id", GroupMother._DEFAULT_ID),
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
                        id="550e8400-e29b-41d4-a716-446655440000",
                    )
                ],
                id=GroupMother._DEFAULT_ID,
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
            )
        )
