"""Relatório PDF simples (MVP) — texto puro, sem dependência de fontes Unicode."""

import unicodedata

from fpdf import FPDF

from app.models.analysis import Analysis


def _ascii_fold(text: str) -> str:
    return (
        unicodedata.normalize("NFKD", text)
        .encode("ascii", "ignore")
        .decode("ascii")
    )


def build_analysis_pdf_bytes(a: Analysis) -> bytes:
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=14)
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, _ascii_fold("CAT Vision IA — Relatorio de triagem"), ln=True)
    pdf.set_font("Helvetica", size=10)
    pdf.cell(0, 6, _ascii_fold(f"Analise #{a.id} | Status: {a.overall_status} | Risco: {a.risk_score:.1f}/100"), ln=True)
    pdf.ln(4)

    blocks = [
        ("Resumo executivo", a.executive_summary or ""),
        ("Parecer tecnico automatizado", a.technical_opinion or ""),
        ("Devolutiva sugerida", a.suggested_feedback or ""),
    ]
    for title, body in blocks:
        if not body.strip():
            continue
        pdf.set_font("Helvetica", "B", 11)
        pdf.multi_cell(0, 6, _ascii_fold(title))
        pdf.set_font("Helvetica", size=9)
        for line in body.split("\n"):
            pdf.multi_cell(0, 5, _ascii_fold(line) or " ")
        pdf.ln(2)

    return bytes(pdf.output())
