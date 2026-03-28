import re


def parse_brl_value(s: str | None) -> float | None:
    if not s:
        return None
    t = re.sub(r"[^\d,.-]", "", s.replace(".", "").replace(",", "."))
    try:
        return float(t)
    except ValueError:
        return None


def format_brl(value: float | None) -> str | None:
    if value is None:
        return None
    return f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
