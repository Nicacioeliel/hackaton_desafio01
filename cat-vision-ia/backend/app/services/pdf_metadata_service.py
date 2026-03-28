import logging
from pathlib import Path
from typing import Any

from pypdf import PdfReader

from app.core.constants import SUSPICIOUS_PDF_CREATORS

logger = logging.getLogger(__name__)


def read_pdf_metadata(path: Path) -> dict[str, Any]:
    out: dict[str, Any] = {
        "creator": None,
        "producer": None,
        "created_at_pdf": None,
        "modified_at_pdf": None,
        "suspicious_metadata_flag": False,
    }
    try:
        reader = PdfReader(str(path))
        meta = reader.metadata
        if meta:
            out["creator"] = meta.get("/Creator")
            out["producer"] = meta.get("/Producer")
            out["created_at_pdf"] = str(meta.get("/CreationDate") or "")
            out["modified_at_pdf"] = str(meta.get("/ModDate") or "")
        combined = " ".join(
            str(x).lower() for x in (out["creator"], out["producer"]) if x
        )
        for bad in SUSPICIOUS_PDF_CREATORS:
            if bad in combined:
                out["suspicious_metadata_flag"] = True
                break
    except Exception as e:
        logger.warning("pdf metadata read failed: %s", e)
    return out
