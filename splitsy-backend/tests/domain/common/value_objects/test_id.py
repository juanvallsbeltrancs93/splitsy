from uuid import UUID

import pytest

from src.domain.common.errors import ValidationError
from src.domain.common.value_objects import Id


class TestId:
    @pytest.mark.parametrize(
        "param",
        [
            "00089ea4-d892-4af9-b465-20827d6541a4",
            "1ad81dbb-b919-4e3e-b5b8-afa1b60200dc",
            "1eb0d218-eb09-4390-a10c-ca6e4307a7da",
            None,
        ],
    )
    def test_valid_case(self, param: str):
        id = Id.create(param)

        assert isinstance(id, Id)
        assert id.equals(id) is True
        assert isinstance(id.to_uuid(), UUID)

    @pytest.mark.parametrize(
        "param",
        [
            "",
            "12345ABC",
            True,
            12345678,
        ],
    )
    def test_invalid_case(self, param: str):
        with pytest.raises(ValidationError):
            Id.create(param)
