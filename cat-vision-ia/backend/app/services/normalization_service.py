from app.utils.currency import parse_brl_value
from app.utils.dates import normalize_date_string
from app.utils.text import normalize_generic
from app.utils.validators import only_digits


def normalize_field(field_key: str, value: str | None) -> str:
    if not value:
        return ""
    v = value.strip()
    if field_key in ("cnpj",):
        return only_digits(v)
    if field_key in ("valor",):
        n = parse_brl_value(v)
        return f"{n:.2f}" if n is not None else normalize_generic(v)
    if field_key in ("data_inicio", "data_fim", "periodo_execucao"):
        if "|" in v:
            parts = [normalize_date_string(p.strip()) or normalize_generic(p.strip()) for p in v.split("|")]
            return " | ".join(p for p in parts if p)
        nd = normalize_date_string(v)
        return nd or normalize_generic(v)
    return normalize_generic(v)
