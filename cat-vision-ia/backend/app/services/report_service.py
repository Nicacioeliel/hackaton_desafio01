import json
from typing import Any

from app.core.constants import (
    CNPJ_STATUS_NAO_VERIFICADO,
    CRITICALITY_BAIXA,
    CRITICALITY_CRITICA,
    CRITICALITY_MEDIA,
    FIELD_STATUS_AUSENTE,
    FIELD_STATUS_COMPATIVEL,
    FIELD_STATUS_DIVERGENTE,
    FIELD_STATUS_NAO_IDENTIFICADO,
    FIELD_STATUS_NAO_VERIFICADO,
)
from app.services.comparison_service import FieldCompareResult
from app.utils.semaforo import overall_from_fields


def build_score_breakdown(
    fields: list[FieldCompareResult],
    risk_score: float,
    suspicious_pdf: bool,
    cnpj_api_failed: bool,
) -> dict[str, Any]:
    div_crit = [
        f
        for f in fields
        if f.status == FIELD_STATUS_DIVERGENTE and f.criticality == CRITICALITY_CRITICA
    ]
    div_med = [
        f
        for f in fields
        if f.status == FIELD_STATUS_DIVERGENTE and f.criticality == CRITICALITY_MEDIA
    ]
    div_baixa = [
        f
        for f in fields
        if f.status == FIELD_STATUS_DIVERGENTE and f.criticality == CRITICALITY_BAIXA
    ]
    aus = [f for f in fields if f.status == FIELD_STATUS_AUSENTE]
    nao_id = [f for f in fields if f.status == FIELD_STATUS_NAO_IDENTIFICADO]
    nao_ver = [f for f in fields if f.status == FIELD_STATUS_NAO_VERIFICADO]

    lines: list[str] = [
        f"Score documental {risk_score:.1f}/100, composto por impactos ponderados por campo.",
    ]
    if div_crit:
        lines.append(
            f"• {len(div_crit)} divergência(ões) em criticidade alta (ex.: CNPJ, profissional, ART, contrato)."
        )
    if div_med:
        lines.append(
            f"• {len(div_med)} divergência(ões) em criticidade média (localização, valores, prazo)."
        )
    if div_baixa:
        lines.append(
            f"• {len(div_baixa)} divergência(ões) em criticidade baixa (objeto/atividades com variação textual)."
        )
    if aus:
        lines.append(f"• {len(aus)} campo(s) ausente(s) no texto extraído do ACT.")
    if nao_id:
        lines.append(
            f"• {len(nao_id)} campo(s) não identificado(s) pelo OCR/parser com segurança suficiente."
        )
    if nao_ver:
        lines.append(
            f"• {len(nao_ver)} campo(s) não verificado(s) por falta de dado na ART ou dependência externa."
        )
    if suspicious_pdf:
        lines.append("• Alerta de integridade: metadados do PDF sugerem edição gráfica.")
    if cnpj_api_failed:
        lines.append(
            "• Validação de CNPJ na Receita (BrasilAPI) indisponível ou inconclusiva — sem penalização plena no campo CNPJ."
        )

    return {
        "risk_score": risk_score,
        "lines": lines,
        "counts": {
            "divergencias_criticas": len(div_crit),
            "divergencias_medias": len(div_med),
            "divergencias_baixas": len(div_baixa),
            "ausentes": len(aus),
            "nao_identificados": len(nao_id),
            "nao_verificados": len(nao_ver),
            "alerta_metadado": suspicious_pdf,
            "cnpj_api_indisponivel": cnpj_api_failed,
        },
        "fields_criticos": [f.field_name for f in div_crit],
    }


def build_technical_opinion(
    fields: list[FieldCompareResult],
    risk_score: float,
    overall: str,
    cnpj_status: str | None,
    suspicious_pdf: bool,
) -> str:
    """Parecer técnico formal para registro interno / devolutiva."""
    divs = [f for f in fields if f.status == FIELD_STATUS_DIVERGENTE]
    aus = [f for f in fields if f.status == FIELD_STATUS_AUSENTE]
    nid = [f for f in fields if f.status == FIELD_STATUS_NAO_IDENTIFICADO]

    parts: list[str] = [
        "PARECER TÉCNICO AUTOMATIZADO (TRIAGEM — CAT VISION IA)",
        "",
        "1. Síntese",
        f"Status do semáforo: {overall}. Índice de risco documental: {risk_score:.1f}/100.",
        "Esta triagem é explicável e rastreável; não substitui o julgamento profissional do CREA-MA.",
        "",
        "2. Confronto ART × ACT",
    ]
    if not divs and not aus and not nid:
        parts.append(
            "Não foram registradas divergências relevantes nem ausências críticas na comparação automatizada."
        )
    else:
        if divs:
            parts.append("Divergências:")
            for f in divs[:12]:
                parts.append(
                    f"  — {f.field_name} ({f.category}, criticidade {f.criticality}): "
                    f"ART «{f.art_value}» / ACT «{f.extracted_value}»."
                )
            if len(divs) > 12:
                parts.append(f"  (… +{len(divs) - 12} divergência(ões))")
        if aus:
            parts.append(
                f"Ausências aparentes no texto do ACT ({len(aus)}): {', '.join(x.field_name for x in aus[:10])}."
            )
        if nid:
            parts.append(
                f"Campos não identificados com segurança pelo OCR ({len(nid)}): "
                f"{', '.join(x.field_name for x in nid[:10])}."
            )

    parts.extend(
        [
            "",
            "3. Integridade e validações externas",
        ]
    )
    if suspicious_pdf:
        parts.append(
            "Metadados do arquivo sugerem origem ou edição em software gráfico — recomenda-se verificação de autenticidade."
        )
    else:
        parts.append("Sem alertas automáticos de metadados para o PDF.")
    parts.append(f"Validação de CNPJ (BrasilAPI): {cnpj_status or 'não verificada'}.")

    parts.extend(
        [
            "",
            "4. Recomendação",
            "Proceder à revisão humana dos campos em divergência ou não identificados, "
            "priorizando criticidade alta (CNPJ, identificação profissional, ART e contrato). "
            "Caso aplicável, solicitar retificação do documento ao profissional responsável.",
        ]
    )
    return "\n".join(parts)


def build_report_payload(
    analysis_id: int,
    fields: list[FieldCompareResult],
    overall: str,
    risk_score: float,
    cnpj_status: str | None,
    suspicious_pdf: bool,
    cnpj_api_failed: bool = False,
) -> dict:
    compat = [f.field_name for f in fields if f.status == FIELD_STATUS_COMPATIVEL]
    ausentes = [
        f.field_name
        for f in fields
        if f.status in (FIELD_STATUS_AUSENTE, FIELD_STATUS_NAO_IDENTIFICADO)
    ]
    div = [f.field_name for f in fields if f.status == FIELD_STATUS_DIVERGENTE]
    meta_alerts: list[str] = []
    if suspicious_pdf:
        meta_alerts.append(
            "Metadados do PDF sugerem edição em software gráfico — verificar autenticidade."
        )

    n_id = len([f for f in fields if f.status == FIELD_STATUS_NAO_IDENTIFICADO])
    n_au = len([f for f in fields if f.status == FIELD_STATUS_AUSENTE])

    summary_parts = [
        f"Status geral: {overall}.",
        f"Score de risco documental: {risk_score}/100.",
        f"Compatíveis: {len(compat)}; divergentes: {len(div)}; "
        f"ausentes no texto: {n_au}; não identificados pelo OCR: {n_id}.",
    ]
    if cnpj_status:
        summary_parts.append(f"Validação CNPJ (BrasilAPI): {cnpj_status}.")

    executive = " ".join(summary_parts)

    feedback_lines = [
        "Prezado(a) profissional,",
        "",
        "Na triagem automatizada de apoio à análise documental da CAT, constataram-se os seguintes pontos:",
    ]
    for f in fields:
        if f.status == FIELD_STATUS_DIVERGENTE:
            feedback_lines.append(
                f"- Divergência em «{f.field_name}» ({f.category}): na ART consta «{f.art_value}»; "
                f"no atestado (texto extraído) consta «{f.extracted_value}»."
            )
        elif f.status == FIELD_STATUS_AUSENTE:
            feedback_lines.append(
                f"- Ausência aparente em «{f.field_name}»: a informação não foi encontrada no texto do documento enviado."
            )
        elif f.status == FIELD_STATUS_NAO_IDENTIFICADO:
            feedback_lines.append(
                f"- Não identificado em «{f.field_name}»: o sistema não localizou o dado com segurança no OCR — "
                "pode haver ilegibilidade ou necessidade de conferência visual."
            )
        elif f.status == FIELD_STATUS_NAO_VERIFICADO:
            feedback_lines.append(
                f"- Não verificado em «{f.field_name}»: confronto automático indisponível "
                "(falta de dado na ART ou validação externa)."
            )
    feedback_lines.extend(
        [
            "",
            "Esta devolutiva é sugestiva e não substitui a análise humana do CREA-MA.",
        ]
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
                "criticality": f.criticality,
                "category": f.category,
                "evidence_excerpt": f.evidence_excerpt,
                "evidence_page": f.evidence_page,
                "score_impact": f.score_impact,
            }
            for f in fields
        ],
    }


def derive_overall(fields: list[FieldCompareResult]) -> str:
    return overall_from_fields([f.status for f in fields])


def build_normative_opinion_block_from_breakdown(br: dict | None) -> str:
    """Texto de parecer a partir do JSON/dict de breakdown normativo."""
    if not br:
        return ""
    score = br.get("normative_score")
    stat = br.get("normative_status", "—")
    lines = [
        "",
        "5. Conformidade normativa (parametrização CONFEA — Resolução 1.137/2023 e demais regras ativas)",
        f"Índice de conformidade normativa: {score}/100 — classificação: {stat}.",
        "Conforme a Resolução 1.137 do CONFEA, identificaram-se os seguintes contadores automáticos "
        f"(obrigatórias atendidas: {br.get('obligatory_met')}/{max(br.get('obligatory_total') or 1, 1)}; "
        f"violações: {br.get('violations_critical', 0)} críticas, "
        f"{br.get('violations_medium', 0)} médias, {br.get('violations_low', 0)} leves).",
    ]
    for L in br.get("lines") or []:
        if L and L not in lines:
            lines.append(L)
    fails = [x for x in br.get("top_violations") or [] if x.get("status") != "ATENDIDA"]
    if fails:
        lines.append("Principais apontamentos normativos:")
        for t in fails[:8]:
            lines.append(f"  — [{t.get('rule_id')}] {t.get('nome')}: {t.get('status')}.")
    lines.append(
        "Recomenda-se revisão humana dos itens não conformes ou em atenção, com possível "
        "impacto na validação da CAT junto ao acervo técnico."
    )
    return "\n".join(lines)


def build_normative_opinion_block(analysis) -> str:
    """Seção de parecer sobre conformidade normativa (dados persistidos no ORM)."""
    if not getattr(analysis, "normative_breakdown_json", None):
        return ""
    try:
        br = json.loads(analysis.normative_breakdown_json)
    except json.JSONDecodeError:
        return ""
    return build_normative_opinion_block_from_breakdown(br)


def regenerate_stored_opinion_from_analysis(analysis) -> tuple[str, str]:
    """Recalcula parecer e breakdown a partir dos registros persistidos."""
    from app.services.field_result_adapter import orm_to_compare_results

    fields = orm_to_compare_results(analysis.field_results or [])
    suspicious = bool(analysis.upload and analysis.upload.suspicious_metadata_flag)
    cnpj_failed = analysis.cnpj_status == CNPJ_STATUS_NAO_VERIFICADO and (
        analysis.cnpj_validation is None
    )
    bd = build_score_breakdown(
        fields,
        float(analysis.risk_score or 0),
        suspicious,
        cnpj_failed,
    )
    opinion = build_technical_opinion(
        fields,
        float(analysis.risk_score or 0),
        analysis.overall_status,
        analysis.cnpj_status,
        suspicious,
    )
    opinion += build_normative_opinion_block(analysis)
    return opinion, json.dumps(bd, ensure_ascii=False)
