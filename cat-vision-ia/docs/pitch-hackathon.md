# Pitch — CAT Vision IA (CREA-MA)

## Problema

Analistas gastam tempo repetitivo confrontando **Atestados de Capacidade Técnica** com **ARTs**, especialmente em PDFs escaneados e fotos, com risco de inconsistências e indícios documentais passarem sem priorização.

## Solução

**CAT Vision IA** automatiza a **triagem inicial**: OCR robusto, extração estruturada, confronto campo a campo com **semáforo** e **score de risco**, mais **validação de CNPJ** quando a API está disponível. A decisão final continua **sempre humana**.

## Diferenciais

- **Explicável**: cada campo traz justificativa e valores normalizados.
- **Rastreável**: hash SHA-256 e metadados PDF com alerta de origem suspeita.
- **Resiliente**: fallback de OCR e CNPJ “não verificado” sem travar o fluxo.
- **Pronto para integração**: API REST versionada e exportações JSON/CSV.

## Demo sugerida (2 minutos)

1. Painel com métricas e gráficos.
2. **Nova análise**: upload do ACT do **Alexandre** + ART **MA20250929762** → resultado majoritariamente **verde**.
3. Repetir com **MA20250957723** + PDF “saúde indígena” → **divergências** em profissional/local com contrato/valor alinhados — mostra inteligência de negócio, não só “match exato”.

## Próximos passos

- Conector SITAC / filas de processamento.
- Modelo de confiança por campo calibrado com histórico real.
- Políticas LGPD de retenção por ambiente.
