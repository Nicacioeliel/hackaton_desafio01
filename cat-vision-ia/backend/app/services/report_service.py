from app.core.constants import (
    FIELD_STATUS_AUSENTE,
    FIELD_STATUS_COMPATIVEL,
    FIELD_STATUS_DIVERGENTE,
    FIELD_STATUS_NAO_VERIFICADO,
)
from app.services.comparison_service import FieldCompareResult
from app.utils.semaforo import overall_from_fields


def build_report_payload(
    analysis_id: int,
    fields: list[FieldCompareResult],
    overall: str,
    risk_score: float,
    cnpj_status: str | None,
    suspicious_pdf: bool,
) -> dict:
    compat = [f.field_name for f in fields if f.status == FIELD_STATUS_COMPATIVEL]
    ausentes = [f.field_name for f in fields if f.status == FIELD_STATUS_AUSENTE]
    div = [f.field_name for f in fields if f.status == FIELD_STATUS_DIVERGENTE]
    meta_alerts: list[str] = []
    if suspicious_pdf:
        meta_alerts.append(
            "Metadados do PDF sugerem edição em software gráfico — verificar autenticidade."
        )

    summary_parts = [
        f"Status geral: {overall}.",
        f"Score de risco documental: {risk_score}/100.",
        f"Campos compatíveis: {len(compat)}; ausentes: {len(ausentes)}; divergentes: {len(div)}.",
    ]
    if cnpj_status:
        summary_parts.append(f"Validação CNPJ (BrasilAPI): {cnpj_status}.")

    executive = " ".join(summary_parts)

    feedback_lines = [
        "Prezado(a) profissional,",
        "",
        "Em análise automatizada de apoio (triagem), foram observados os seguintes pontos:",
    ]
    for f in fields:
        if f.status == FIELD_STATUS_DIVERGENTE:
            feedback_lines.append(
                f"- Divergência em '{f.field_name}': consta na ART '{f.art_value}' e no documento '{f.extracted_value}'."
            )
        elif f.status == FIELD_STATUS_AUSENTE:
            feedback_lines.append(
                f"- Ausência/incompleteza em '{f.field_name}': não foi possível extrair do documento de forma confiável."
            )
    feedback_lines.append(
        "",
        "Esta mensagem é sugestiva e não substitui a análise humana do CREA-MA.",
    )
    suggested = "\n".join(feedback_lines)

    return {
        "analysis_id": analysis_id,
        "overall_status": overall,
        "risk_score": risk_score,
        "executive_summary": executive,
        "suggested_feedback": suggested,
        "cnpj_status": cnpj_status,
        "compatibles": compat,
        "ausentes": ausentes,
        "divergentes": div,
        "metadata_alerts": meta_alerts,
        "field_results": [
            {
                "field_name": f.field_name,
                "art_value": f.art_value,
                "extracted_value": f.extracted_value,
                "normalized_art_value": f.normalized_art,
                "normalized_extracted_value": f.normalized_extracted,
                "status": f.status,
                "confidence": f.confidence,
                "justification": f.justification,
            }
            for f in fields
        ],
    }


def derive_overall(fields: list[FieldCompareResult]) -> str:
    return overall_from_fields([f.status for f in fields])
