from src.domain.common.entities import Entity
from src.domain.common.value_objects.id import Id


class MockEntity(Entity):
    pass


class OtherEntity(Entity):
    pass


class TestEntity:
    def test_identity_assignment(self):
        unique_id = Id.create()
        entity = MockEntity(id=unique_id)

        assert entity.id == unique_id.value
        assert isinstance(entity.id, str)

    def test_equality_same_id_same_class(self):
        unique_id = Id.create()
        entity1 = MockEntity(id=unique_id)
        entity2 = MockEntity(id=unique_id)

        assert entity1.equals(entity2) is True

    def test_equality_same_id_different_class(self):
        unique_id = Id.create()
        entity1 = MockEntity(id=unique_id)
        entity2 = OtherEntity(id=unique_id)

        assert entity1.equals(entity2)
        assert entity1 == entity2

    def test_inequality_different_ids(self):
        entity1 = MockEntity(id=Id.create())
        entity2 = MockEntity(id=Id.create())

        assert entity1 != entity2
        assert entity1.equals(entity2) is False

    def test_inequality_with_non_entity(self):
        entity = MockEntity(id=Id.create())

        assert entity != "not an entity"
        assert entity.equals(None) is False

    def test_hash_consistency(self):
        unique_id = Id.create()
        entity1 = MockEntity(id=unique_id)
        entity2 = MockEntity(id=unique_id)

        assert hash(entity1) == hash(entity2)

        # Test inside a set
        entity_set = {entity1, entity2}
        assert len(entity_set) == 1

    def test_to_dict_no_data(self):
        unique_id = Id.create()
        entity = MockEntity(id=unique_id)

        assert entity.to_dict() == {"id": unique_id.value}

    def test_to_dict_with_data(self):
        from dataclasses import dataclass, field

        class VO:
            def __init__(self, value):
                self.value = value

        @dataclass
        class Data:
            visible: object
            hidden: object = field(repr=False)

        unique_id = Id.create()
        data = Data(visible=VO("visible_value"), hidden=VO("hidden_value"))
        entity = MockEntity(id=unique_id, data=data)

        # `hidden` field has repr=False and must be omitted; visible should be unwrapped
        assert entity.to_dict() == {"visible": "visible_value"}

    def test_repr(self):
        unique_id = Id.create()
        entity = MockEntity(id=unique_id)

        assert repr(entity) == f"MockEntity(id={unique_id.value!r})"
