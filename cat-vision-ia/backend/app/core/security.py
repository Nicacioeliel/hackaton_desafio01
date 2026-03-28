"""Utilitários de segurança e mascaramento (LGPD)."""

import re


def mask_cnpj(value: str | None) -> str | None:
    if not value:
        return value
    digits = re.sub(r"\D", "", value)
    if len(digits) != 14:
        return "***"
    return f"{digits[:2]}.***.***/****-{digits[-2:]}"


def mask_name(value: str | None, keep_last: int = 4) -> str | None:
    if not value or len(value) <= keep_last:
        return "***"
    return f"***{value[-keep_last:]}"


def safe_log_fragment(text: str | None, max_len: int = 80) -> str:
    if not text:
        return ""
    t = text.replace("\n", " ").strip()
    if len(t) > max_len:
        return t[: max_len - 3] + "..."
    return t
