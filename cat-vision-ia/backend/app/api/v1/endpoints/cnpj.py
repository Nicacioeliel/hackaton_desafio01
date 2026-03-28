from fastapi import APIRouter

from app.core.constants import CNPJ_STATUS_NAO_VERIFICADO, CNPJ_STATUS_OK
from app.schemas.analysis import CnpjValidateRequest, CnpjValidateResponse
from app.services.cnpj_service import consultar_cnpj

router = APIRouter()


@router.post("/validate", response_model=CnpjValidateResponse)
async def validate_cnpj(body: CnpjValidateRequest):
    res = await consultar_cnpj(body.cnpj)
    if res["status"] == CNPJ_STATUS_OK:
        return CnpjValidateResponse(
            cnpj=res["cnpj"],
            razao_social=res.get("razao_social"),
            situacao_cadastral=res.get("situacao_cadastral"),
            status=CNPJ_STATUS_OK,
            message=None,
        )
    return CnpjValidateResponse(
        cnpj=res.get("cnpj", ""),
        status=CNPJ_STATUS_NAO_VERIFICADO,
        message=res.get("error") or "Não verificado",
    )
