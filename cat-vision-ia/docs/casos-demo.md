# Casos de demonstração

## Caso 1 — Compatível (Alexandre × MA20250929762)

**Artefatos sugeridos**

- ART simulada `MA20250929762` (seed).
- PDF do ACT do **Alexandre de Moraes Bueno Neto** (arquivo real da pasta de trabalho do time, se disponível).

**Expectativa**

- Forte aderência em profissional, CREA/RNP, contratante, CNPJ `36.408.654/0001-04`, contrato `0352015`, ART, objeto com **50 pontos de iluminação**, local **Fazenda PV Curral Velho**, município **Pastos Bons-MA**, período **12/05/2025** a **24/06/2025** (ajustes finos dependem do texto extraído pelo OCR).

**Mensagem para a banca**

> Triagem reconhece documento bem alinhado à ART de referência, reduzindo retrabalho do analista.

## Caso 2 — Divergências (saúde indígena × MA20250957723)

**Artefatos sugeridos**

- ART simulada `MA20250957723` (seed).
- PDF **saude indigena.pdf**.

**Expectativa**

- Possível alinhamento de **contrato** e **valor** (ex.: R$ 818.582,00) com alertas em **empresa executora**, **profissional** e **localidade** (referências **Buriticupu**, **Arame**, **Amarante** no material).

**Mensagem para a banca**

> O sistema destaca **inconsistências contextualmente sensíveis**, úteis para apoio a auditoria e não para decisão automática.

## Roteiro rápido

1. Subir backend + frontend + `python -m app.seeds.seed_arts`.
2. Executar **Nova análise** para cada caso e comparar semáforos lado a lado na projeção.
