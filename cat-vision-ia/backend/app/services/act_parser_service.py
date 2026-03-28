import json
import logging
import re
from typing import Any

from app.utils.currency import parse_brl_value
from app.utils.dates import extract_period, normalize_date_string
from app.utils.text import extract_art_number, extract_cnpj

logger = logging.getLogger(__name__)


def _find(patterns: list[str], text: str) -> str | None:
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE | re.DOTALL)
        if m and m.group(1).strip():
            return m.group(1).strip()
    return None


def parse_act(text: str) -> dict[str, Any]:
    """Heurísticas de extração a partir do texto do ACT (OCR ou nativo)."""
    t = text or ""
    profissional = _find(
        [
            r"(?:profissional|engenheiro|eng[ªa]?\.?)\s*[:\-]?\s*([^\n]{5,120})",
            r"nome\s+do\s+profissional\s*[:\-]?\s*([^\n]{5,120})",
        ],
        t,
    )
    crea = _find(
        [
            r"CREA[\s:/-]*([A-Z]{2}\s*\d[\d\.\-/]{4,20})",
            r"registro\s*(?:CREA|no\s*CREA)\s*[:\-]?\s*([A-Z]{2}\s*[\d\.\-/]{4,20})",
            r"\b(\d{7,12})\b(?=.*CREA)",
        ],
        t,
    )
    contratante = _find(
        [
            r"(?:contratante|empresa|contratada)\s*[:\-]?\s*([^\n]{4,200})",
        ],
        t,
    )
    cnpj = extract_cnpj(t) or _find([r"CNPJ\s*[:\-]?\s*([\d./-]{14,20})"], t)
    if cnpj:
        cnpj = re.sub(r"\D", "", cnpj)
        if len(cnpj) == 14:
            cnpj = f"{cnpj[:2]}.{cnpj[2:5]}.{cnpj[5:8]}/{cnpj[8:12]}-{cnpj[12:]}"
    contrato = _find(
        [
            r"(?:contrato|n[º°]\s*do\s*contrato)\s*[:\-]?\s*([^\n]{3,80})",
            r"\b(\d{3,7}/\d{4})\b",
            r"\b(0\d{6,7})\b",
        ],
        t,
    )
    art = extract_art_number(t)
    objeto = _find(
        [
            r"(?:objeto|escopo|atividades)\s*[:\-]?\s*([^\n]{10,500})",
        ],
        t,
    )
    local = _find(
        [
            r"(?:local|endere[çc]o|obra)\s*[:\-]?\s*([^\n]{5,200})",
        ],
        t,
    )
    municipio = _find(
        [
            r"(?:munic[íi]pio|cidade)\s*[:\-]?\s*([^\n]{3,120})",
        ],
        t,
    )
    valor_m = re.search(
        r"R\$\s*([\d]{1,3}(?:\.\d{3})*,\d{2}|\d+[,.]\d{2})",
        t,
    )
    valor = None
    if valor_m:
        valor = str(parse_brl_value(valor_m.group(0)) or valor_m.group(0))

    d1, d2 = extract_period(t)
    if not d1:
        d1 = normalize_date_string(
            _find([r"in[íi]cio\s*[:\-]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})"], t)
        )
    if not d2:
        d2 = normalize_date_string(
            _find([r"(?:t[ée]rmino|fim)\s*[:\-]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})"], t)
        )

    atividades = _find(
        [r"(?:atividades\s+t[ée]cnicas|servi[çc]os)\s*[:\-]?\s*([^\n]{5,400})"],
        t,
    )
    quant = _find(
        [r"(?:quantitativo|quantidades)\s*[:\-]?\s*([^\n]{3,300})"],
        t,
    )

    structured = {
        "profissional_nome": profissional,
        "crea_rnp": crea,
        "contratante_nome": contratante,
        "cnpj": cnpj,
        "numero_contrato": contrato,
        "numero_art": art,
        "objeto": objeto,
        "endereco": local,
        "cidade_uf": municipio,
        "data_inicio": d1,
        "data_fim": d2,
        "valor": valor,
        "atividades_tecnicas": atividades,
        "quantitativos": quant,
    }
    logger.debug("act parsed keys=%s", list(structured.keys()))
    return {"structured": structured, "raw_json": json.dumps(structured, ensure_ascii=False)}
