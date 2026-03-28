"""Constantes de domínio — comparação e relatórios."""

FIELD_STATUS_COMPATIVEL = "COMPATIVEL"
FIELD_STATUS_AUSENTE = "AUSENTE"
FIELD_STATUS_DIVERGENTE = "DIVERGENTE"
FIELD_STATUS_NAO_VERIFICADO = "NAO_VERIFICADO"
FIELD_STATUS_NAO_APLICAVEL = "NAO_APLICAVEL"

OVERALL_VERDE = "VERDE"
OVERALL_AMARELO = "AMARELO"
OVERALL_VERMELHO = "VERMELHO"

CNPJ_STATUS_OK = "OK"
CNPJ_STATUS_NAO_VERIFICADO = "NAO_VERIFICADO"
CNPJ_STATUS_DIVERGENTE = "DIVERGENTE"

# Metadados PDF suspeitos (editores gráficos comuns)
SUSPICIOUS_PDF_CREATORS = (
    "photoshop",
    "gimp",
    "canva",
    "paint",
    "inkscape",
    "figma",
    "coreldraw",
    "microsoft office picture manager",
)
