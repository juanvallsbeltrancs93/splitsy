from decimal import Decimal

from src.domain.common.value_objects import Amount, Id
from src.domain.expenses.value_objects import Split


class TestSplit:
    def test_create_split(self):
        participant_id = Id.create()
        amount = Amount.create(Decimal("12.50"))

        split = Split.create(participant_id=participant_id, amount=amount)

        assert split.participant_id == participant_id
        assert split.amount == amount
