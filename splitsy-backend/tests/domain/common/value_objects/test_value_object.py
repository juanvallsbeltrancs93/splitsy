from dataclasses import dataclass, field

import pytest

from src.domain.common.value_objects import ValueObject


@dataclass(frozen=True)
class SimpleProps:
    value: str


class NameVO(ValueObject[SimpleProps]):
    pass


@dataclass(frozen=True)
class MultiProps:
    id: int
    role: str
    optional: None = None


class UserRoleVO(ValueObject[MultiProps]):
    pass


@dataclass(frozen=True)
class SecretProps:
    password: str = field(repr=False)


class PasswordVO(ValueObject[SecretProps]):
    pass


class VOTest(ValueObject):
    pass


class TestValueObject:
    def test_value_is_stored(self):
        vo = VOTest(10)

        assert vo.props == 10

    def test_equals_same_value(self):
        vo1 = VOTest(10)
        vo2 = VOTest(10)

        assert vo1.equals(vo2) is True

    def test_equals_different_value(self):
        vo1 = VOTest(10)
        vo2 = VOTest(20)

        assert vo1.equals(vo2) is False

    def test_equals_with_none(self):
        vo = VOTest(10)

        assert vo.equals(None) is False

    def test_equals_without_value_attr(self):
        class NoValue:
            pass

        vo = VOTest(10)
        other = NoValue()

        assert vo.equals(other) is False

    def test_equals_with_none_value(self):
        vo1 = VOTest(10)
        vo2 = VOTest(None)

        assert vo1.equals(vo2) is False

    def test_equals_with_complex_object(self):
        vo1 = VOTest({"a": 1, "b": 2})
        vo2 = VOTest({"b": 2, "a": 1})

        assert vo1.equals(vo2) is True

    def test_eq_same_value(self):
        vo1 = VOTest("abc")
        vo2 = VOTest("abc")

        assert vo1 == vo2

    def test_eq_different_value(self):
        vo1 = VOTest("abc")
        vo2 = VOTest("xyz")

        assert vo1 != vo2

    def test_eq_with_other_type(self):
        vo = VOTest(10)

        assert (vo == 10) is False

    def test_eq_is_symmetric(self):
        vo = VOTest(10)

        assert (vo == 10) == (10 == vo)

    def test_hash_same_value(self):
        vo1 = VOTest(100)
        vo2 = VOTest(100)

        assert hash(vo1) == hash(vo2)

    def test_hash_different_value(self):
        vo1 = VOTest(100)
        vo2 = VOTest(200)

        assert hash(vo1) != hash(vo2)

    def test_value_object_in_set(self):
        vo1 = VOTest("a")
        vo2 = VOTest("a")
        vo3 = VOTest("b")

        s = {vo1, vo2, vo3}

        assert len(s) == 2

    @pytest.mark.parametrize(
        "vo_instance, expected_repr",
        [
            (NameVO(SimpleProps(value="nicolas")), "NameVO('nicolas')"),
            (PasswordVO(SecretProps(password="12345")), "PasswordVO(<hidden>)"),
            (NameVO("direct_string"), "NameVO('direct_string')"),
            (
                UserRoleVO(MultiProps(id=1, role="admin")),
                "UserRoleVO(id=1, role='admin', optional=None)",
            ),
        ],
    )
    def test_repr_output(self, vo_instance: ValueObject, expected_repr: str):
        assert repr(vo_instance) == expected_repr
