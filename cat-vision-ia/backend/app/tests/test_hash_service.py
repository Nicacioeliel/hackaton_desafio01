import hashlib

from app.services.hash_service import sha256_bytes


def test_sha256_bytes():
    assert sha256_bytes(b"test") == hashlib.sha256(b"test").hexdigest()
    assert len(sha256_bytes(b"")) == 64
