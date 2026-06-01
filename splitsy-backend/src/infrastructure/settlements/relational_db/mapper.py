from __future__ import annotations

from decimal import Decimal

from src.domain.settlements.entities.settlement import Settlement, SettlementData
from src.infrastructure.common.mapper import Mapper
from src.infrastructure.settlements.relational_db.orm import SettlementORM


class SettlementMapper(Mapper[Settlement, SettlementORM]):
    def to_entity(self, orm_model: SettlementORM) -> Settlement:
        return Settlement.create(
            SettlementData(
                id=orm_model.id,
                group_id=orm_model.group_id,
                from_participant_id=orm_model.from_participant_id,
                to_participant_id=orm_model.to_participant_id,
                amount=Decimal(str(orm_model.amount)),
                date=orm_model.date,
                note=orm_model.note,
            )
        )

    def to_orm(self, entity: Settlement) -> SettlementORM:
        return SettlementORM(
            id=entity.id,
            group_id=entity.group_id,
            from_participant_id=entity.from_participant_id,
            to_participant_id=entity.to_participant_id,
            amount=entity.amount,
            date=entity.date,
            note=entity.note,
        )
