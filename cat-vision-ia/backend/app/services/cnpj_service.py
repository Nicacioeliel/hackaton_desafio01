import json
import logging
from typing import Any

import httpx

from app.core.config import get_settings
from app.core.constants import CNPJ_STATUS_NAO_VERIFICADO, CNPJ_STATUS_OK
from app.utils.validators import only_digits

logger = logging.getLogger(__name__)


async def consultar_cnpj(cnpj: str) -> dict[str, Any]:
    """Consulta BrasilAPI com timeout; nunca levanta exceção para o fluxo principal."""
    digits = only_digits(cnpj)
    settings = get_settings()
    url = f"{settings.brasil_api_base.rstrip('/')}/cnpj/v1/{digits}"
    out: dict[str, Any] = {
        "cnpj": digits,
        "razao_social": None,
        "situacao_cadastral": None,
        "raw": None,
        "status": CNPJ_STATUS_NAO_VERIFICADO,
        "error": None,
    }
    try:
        async with httpx.AsyncClient(
            timeout=settings.cnpj_request_timeout_seconds
        ) as client:
            r = await client.get(url)
            if r.status_code != 200:
                out["error"] = f"HTTP {r.status_code}"
                return out
            data = r.json()
            out["raw"] = json.dumps(data, ensure_ascii=False)[:8000]
            out["razao_social"] = data.get("razao_social") or data.get("nome_fantasia")
            out["situacao_cadastral"] = (
                data.get("descricao_situacao_cadastral")
                or data.get("situacao_cadastral")
            )
            out["status"] = CNPJ_STATUS_OK
    except Exception as e:
        logger.warning("cnpj api fail: %s", e)
        out["error"] = str(e)[:200]
    return out
