from app.core.constants import (
    FIELD_STATUS_AUSENTE,
    FIELD_STATUS_COMPATIVEL,
    FIELD_STATUS_DIVERGENTE,
    FIELD_STATUS_NAO_IDENTIFICADO,
    FIELD_STATUS_NAO_VERIFICADO,
    OVERALL_AMARELO,
    OVERALL_VERDE,
    OVERALL_VERMELHO,
)

_AMARELO = (
    FIELD_STATUS_AUSENTE,
    FIELD_STATUS_NAO_VERIFICADO,
    FIELD_STATUS_NAO_IDENTIFICADO,
)


def overall_from_fields(statuses: list[str]) -> str:
    if any(s == FIELD_STATUS_DIVERGENTE for s in statuses):
        return OVERALL_VERMELHO
    if any(s in _AMARELO for s in statuses):
        return OVERALL_AMARELO
    if all(s == FIELD_STATUS_COMPATIVEL for s in statuses):
        return OVERALL_VERDE
    return OVERALL_AMARELO
