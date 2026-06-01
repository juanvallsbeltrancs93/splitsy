import pytest

from src.infrastructure.security.argon2_password_hasher import Argon2PasswordHasher


@pytest.fixture
def hasher() -> Argon2PasswordHasher:
    return Argon2PasswordHasher()


class TestArgon2PasswordHasher:
    def test_hash_returns_string(self, hasher: Argon2PasswordHasher):
        result = hasher.hash("Password123!")

        assert isinstance(result, str)

    def test_hash_is_not_plain_password(self, hasher: Argon2PasswordHasher):
        plain = "Password123!"
        result = hasher.hash(plain)

        assert result != plain

    def test_verify_returns_true_for_correct_password(
        self, hasher: Argon2PasswordHasher
    ):
        plain = "Password123!"
        hashed = hasher.hash(plain)

        assert hasher.verify(plain, hashed) is True

    def test_verify_returns_false_for_wrong_password(
        self, hasher: Argon2PasswordHasher
    ):
        plain = "Password123!"
        hashed = hasher.hash(plain)

        assert hasher.verify("WrongPassword!", hashed) is False

    def test_two_hashes_of_same_password_are_different(
        self, hasher: Argon2PasswordHasher
    ):
        plain = "Password123!"
        hash1 = hasher.hash(plain)
        hash2 = hasher.hash(plain)

        assert hash1 != hash2
