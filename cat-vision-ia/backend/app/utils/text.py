import re

from unidecode import unidecode


def collapse_ws(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip())


def strip_punctuation_keep_digits(s: str) -> str:
    return re.sub(r"[^\w\s\d]", " ", s or "", flags=re.UNICODE)


def normalize_generic(s: str | None) -> str:
    if not s:
        return ""
    t = unidecode(s).lower()
    t = strip_punctuation_keep_digits(t)
    t = collapse_ws(t)
    t = t.replace(" s n ", " sn ").replace(" sn ", " ")
    return t


def extract_cnpj(text: str) -> str | None:
    if not text:
        return None
    m = re.search(r"\b\d{2}\.?\d{3}\.?\d{3}/?\d{4}-?\d{2}\b", text)
    if not m:
        m = re.search(r"\b\d{14}\b", text)
    if not m:
        return None
    return re.sub(r"\D", "", m.group(0))


def extract_art_number(text: str) -> str | None:
    if not text:
        return None
    m = re.search(r"\bMA\d{8,12}\b", text, re.IGNORECASE)
    if m:
        return m.group(0).upper()
    m = re.search(r"ART\s*[Nº°:]?\s*([A-Z]{2}\d{6,14})", text, re.IGNORECASE)
    if m:
        return m.group(1).upper()
    return None
