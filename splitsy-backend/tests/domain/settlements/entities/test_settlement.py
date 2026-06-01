from collections import defaultdict
from decimal import Decimal

import pytest

from src.domain.common.errors import ValidationError
from src.domain.common.value_objects import Id
from tests.mothers import SettlementMother


class TestSettlementEntity:
    def test_should_create_settlement_successfully(self):
        settlement = SettlementMother.create()

        assert settlement.id is not None
        assert settlement.group_id == "660e8400-e29b-41d4-a716-446655440000"
        assert settlement.from_participant_id == "550e8400-e29b-41d4-a716-446655440000"
        assert settlement.to_participant_id == "440e8400-e29b-41d4-a716-446655440000"
        assert settlement.amount == Decimal("20.00")
        assert settlement.note is None

    def test_create_without_id_should_generate_one(self):
        settlement = SettlementMother.create(id=None)

        assert settlement.id is not None
        assert isinstance(settlement.id, str)

    def test_should_create_with_note(self):
        settlement = SettlementMother.create(note="For the dinner")

        assert settlement.note == "For the dinner"

    def test_note_should_raise_on_empty_string(self):
        with pytest.raises(ValidationError):
            SettlementMother.create(note="")

    def test_note_should_raise_when_exceeds_max_length(self):
        with pytest.raises(ValidationError):
            SettlementMother.create(note="a" * 281)

    def test_note_should_raise_on_invalid_type(self):
        with pytest.raises(ValidationError):
            SettlementMother.create(note=123)

    def test_should_raise_when_from_and_to_user_are_the_same(self):
        same_user_id = Id.create().value

        with pytest.raises(
            ValidationError, match="cannot settle a debt with themselves"
        ):
            SettlementMother.create(
                from_participant_id=same_user_id,
                to_participant_id=same_user_id,
            )

    def test_should_raise_on_negative_amount(self):
        with pytest.raises(ValidationError):
            SettlementMother.create(amount=Decimal("-5.00"))

    def test_equality_between_settlements(self):
        id_1 = Id.create().value
        id_2 = Id.create().value

        s1 = SettlementMother.create(id=id_1)
        s2 = SettlementMother.create(note="Different note", id=id_1)
        s3 = SettlementMother.create(id=id_2)

        assert s1 == s2
        assert s1 != s3
        assert s1 != "not-a-settlement"

    def test_apply_to_balances_credits_payer_and_debits_receiver(self):
        from_user = "550e8400-e29b-41d4-a716-446655440000"
        to_user = "440e8400-e29b-41d4-a716-446655440000"

        settlement = SettlementMother.create(
            from_participant_id=from_user,
            to_participant_id=to_user,
            amount=Decimal("30.00"),
        )

        balances: dict[str, Decimal] = defaultdict(Decimal)
        settlement.apply_to_balances(balances)

        assert balances[from_user] == Decimal("30.00")
        assert balances[to_user] == Decimal("-30.00")

    def test_apply_to_balances_accumulates_on_existing_values(self):
        from_user = "550e8400-e29b-41d4-a716-446655440000"
        to_user = "440e8400-e29b-41d4-a716-446655440000"

        settlement = SettlementMother.create(
            from_participant_id=from_user,
            to_participant_id=to_user,
            amount=Decimal("10.00"),
        )

        balances: dict[str, Decimal] = defaultdict(Decimal)
        balances[from_user] = Decimal("-30.00")
        settlement.apply_to_balances(balances)

        assert balances[from_user] == Decimal("-20.00")
