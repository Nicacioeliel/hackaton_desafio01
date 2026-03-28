import logging
import shutil
import uuid
from pathlib import Path

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def ensure_dirs() -> Path:
    settings = get_settings()
    base = Path(settings.upload_dir)
    base.mkdir(parents=True, exist_ok=True)
    return base


def save_upload(filename: str, data: bytes) -> tuple[Path, str]:
    """Salva arquivo com nome único; retorna (path, stored_filename)."""
    base = ensure_dirs()
    ext = Path(filename).suffix.lower() or ".bin"
    stored = f"{uuid.uuid4().hex}{ext}"
    dest = base / stored
    dest.write_bytes(data)
    logger.info("saved upload %s -> %s", filename, stored)
    return dest, stored
