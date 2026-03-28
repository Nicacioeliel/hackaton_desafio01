import logging
import time
from pathlib import Path

import fitz  # PyMuPDF

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def _pymupdf_text(path: Path) -> str:
    doc = fitz.open(path)
    parts: list[str] = []
    for page in doc:
        parts.append(page.get_text("text") or "")
    doc.close()
    return "\n".join(parts)


def _tesseract_pdf_or_image(path: Path) -> str:
    import pytesseract
    from pdf2image import convert_from_path
    from PIL import Image

    settings = get_settings()
    if settings.tesseract_cmd:
        pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd

    suffix = path.suffix.lower()
    if suffix in (".png", ".jpg", ".jpeg", ".tif", ".tiff", ".webp"):
        img = Image.open(path)
        return pytesseract.image_to_string(img, lang="por+eng") or ""

    images = convert_from_path(str(path), dpi=200, first_page=1, last_page=5)
    texts: list[str] = []
    for im in images:
        texts.append(pytesseract.image_to_string(im, lang="por+eng") or "")
    return "\n".join(texts)


def _try_docling(path: Path) -> str | None:
    settings = get_settings()
    if not settings.use_docling:
        return None
    try:
        # Docling é opcional e pesado; interface pode variar por versão
        from docling.document_converter import DocumentConverter  # type: ignore

        conv = DocumentConverter()
        result = conv.convert(str(path))
        return result.document.export_to_markdown()
    except Exception as e:
        logger.info("docling unavailable or failed: %s", e)
        return None


def extract_text(path: Path, mime: str) -> tuple[str, str, float]:
    """
    Retorna (texto, engine_usado, confiança_heurística 0-1).
    Ordem: texto nativo -> docling (opcional) -> tesseract.
    """
    t0 = time.perf_counter()
    settings = get_settings()
    mode = settings.ocr_primary.lower()

    text = ""
    engine = "none"

    if mode in ("auto", "pymupdf") or mime == "application/pdf":
        try:
            text = _pymupdf_text(path)
            engine = "pymupdf"
        except Exception as e:
            logger.warning("pymupdf failed: %s", e)

    # Pouco texto = provável scan
    if len(text.strip()) < 80 and mime == "application/pdf":
        dl = _try_docling(path)
        if dl and len(dl.strip()) > len(text.strip()):
            text = dl
            engine = "docling"

    if len(text.strip()) < 80:
        try:
            ocr_txt = _tesseract_pdf_or_image(path)
            if len(ocr_txt.strip()) > len(text.strip()):
                text = ocr_txt
                engine = "tesseract"
        except Exception as e:
            logger.warning("tesseract failed: %s", e)

    if mime.startswith("image/") and len(text.strip()) < 40:
        try:
            text = _tesseract_pdf_or_image(path)
            engine = "tesseract"
        except Exception as e:
            logger.warning("tesseract image failed: %s", e)

    elapsed = time.perf_counter() - t0
    confidence = min(1.0, max(0.2, len(text) / 5000))
    logger.info("ocr engine=%s chars=%s time=%.2fs", engine, len(text), elapsed)
    return text, engine, confidence
