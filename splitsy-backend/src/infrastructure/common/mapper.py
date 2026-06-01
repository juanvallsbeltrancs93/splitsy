from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Generic, TypeVar

DomainEntity = TypeVar("DomainEntity")
ORMModel = TypeVar("ORMModel")


class Mapper(ABC, Generic[DomainEntity, ORMModel]):
    @abstractmethod
    def to_entity(self, orm_model: ORMModel) -> DomainEntity: ...

    @abstractmethod
    def to_orm(self, entity: DomainEntity) -> ORMModel: ...
