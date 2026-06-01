from __future__ import annotations

from src.domain.groups.entities.group import Group, GroupData
from src.domain.groups.entities.participant import ParticipantData
from src.infrastructure.common.mapper import Mapper
from src.infrastructure.groups.relational_db.orm import GroupORM, GroupParticipantORM


class GroupMapper(Mapper[Group, GroupORM]):
    def to_entity(self, orm_model: GroupORM) -> Group:
        return Group.create(
            GroupData(
                id=orm_model.id,
                name=orm_model.name,
                currency=orm_model.currency,
                participants=[
                    ParticipantData(
                        id=p.id,
                        display_name=p.display_name,
                        type=p.type,
                        user_id=p.user_id,
                    )
                    for p in orm_model.participants
                ],
            )
        )

    def to_orm(self, entity: Group) -> GroupORM:
        return GroupORM(
            id=entity.id,
            name=entity.name,
            currency=entity.currency,
            participants=self.to_participants(entity),
        )

    def to_participants(self, entity: Group) -> list[GroupParticipantORM]:
        return [
            GroupParticipantORM(
                id=p.id,
                group_id=entity.id,
                display_name=p.display_name,
                type=p.type.value,
                user_id=p.user_id,
            )
            for p in entity.participants
        ]
