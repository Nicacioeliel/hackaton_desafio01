import re
from datetime import datetime

from dateutil import parser as date_parser


def normalize_date_string(s: str | None) -> str | None:
    if not s:
        return None
    s = s.strip()
    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y"):
        try:
            return datetime.strptime(s[:10], fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    try:
        dt = date_parser.parse(s, dayfirst=True, fuzzy=True)
        return dt.strftime("%Y-%m-%d")
    except (ValueError, TypeError, OverflowError):
        return None


def extract_period(text: str) -> tuple[str | None, str | None]:
    if not text:
        return None, None
    # dd/mm/yyyy a dd/mm/yyyy
    m = re.search(
        r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s*(?:a|até|-)\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
        text,
        re.IGNORECASE,
    )
    if m:
        return normalize_date_string(m.group(1)), normalize_date_string(m.group(2))
    return None, None
