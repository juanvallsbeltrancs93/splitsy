from dataclasses import dataclass

from src.domain.common.value_objects import Amount, Id, ValueObject


@dataclass(frozen=True)
class SplitProps:
    participant_id: Id
    amount: Amount


class Split(ValueObject[SplitProps]):
    def __init__(self, props: SplitProps) -> None:
        super().__init__(props)
        self._participant_id = props.participant_id
        self._amount = props.amount

    @property
    def participant_id(self) -> Id:
        return self._participant_id

    @property
    def amount(self) -> Amount:
        return self._amount

    @staticmethod
    def create(participant_id: Id, amount: Amount) -> "Split":
        return Split(SplitProps(participant_id=participant_id, amount=amount))
