# Regras de comparação — ART × ACT

## Camadas

1. **Literal** — comparação direta quando já há equivalência óbvia.
2. **Normalizada** — remoção de acentos, caixa, pontuação; normalização de CNPJ, datas e valores monetários; colapso de espaços.
3. **Semântica leve** — similaridade por tokens (**rapidfuzz**) para **objeto**, **atividades** e **quantitativos**; endereço com **partial ratio**.

## Campos monitorados

- Número da ART, profissional, CREA/RNP, contratante, CNPJ, contrato, objeto, período (datas início/fim), endereço, município/UF, valor, atividades técnicas, quantitativos.

## Status por campo

| Status | Significado |
|--------|-------------|
| `COMPATIVEL` | Igualdade literal ou após normalização / similaridade acima do limiar |
| `AUSENTE` | Não extraído do documento (OCR/parsing) |
| `DIVERGENTE` | Conflito após normalização / baixa similaridade semântica |
| `NAO_VERIFICADO` | Falta de dado na ART de referência |
| `NAO_APLICAVEL` | (reservado) |

## Semáforo geral

- **Vermelho** se qualquer campo `DIVERGENTE` (regra agregada base).
- **Amarelo** se houver `AUSENTE` ou `NAO_VERIFICADO`.
- Ajuste por **score de risco** numérico: valores altos podem forçar **VERMELHO** mesmo com semáforo intermediário.

## Score de risco (0–100)

Pesos exemplificativos (ver `risk_scoring_service.py`):

- CNPJ, profissional/CREA, contrato e ART: **alto**
- Município/local: **médio-alto**
- Valor: **médio**
- Ausência de obrigatório: **médio-alto** (via peso × 0,75)
- Metadado suspeito no PDF: **bônus** fixo
- Falha da BrasilAPI: **redução** do peso no campo CNPJ (não penalizar indisponibilidade externa)

## Integração futura SITAC

Contratos JSON estáveis em `/api/v1/analyses/{id}/report` e exportações facilitam adaptadores para o barramento corporativo sem acoplar UI.
