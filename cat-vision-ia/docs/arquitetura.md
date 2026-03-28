# Arquitetura — CAT Vision IA

## Visão geral

Monorepo com **frontend** (React + Vite + TypeScript) e **backend** (FastAPI + SQLAlchemy). O produto posiciona-se como **primeira camada de triagem** para confronto entre **ART** (referência no banco simulado) e **ACT** (documento enviado), com **OCR**, **normalização**, **comparação em camadas** e **consulta opcional de CNPJ** (BrasilAPI).

## Backend (camadas)

| Camada | Responsabilidade |
|--------|------------------|
| `app/api` | Rotas REST versionadas (`/api/v1`), validação de entrada, respostas HTTP |
| `app/core` | Configuração, banco, logging, constantes de domínio |
| `app/models` | Entidades SQLAlchemy (ART, uploads, extrações, análises, resultados por campo, tabelas, CNPJ, auditoria) |
| `app/schemas` | Modelos Pydantic (leitura/escrita API) |
| `app/repositories` | Acesso a dados e agregações (ex.: métricas do painel) |
| `app/services` | Regras: hash, metadados PDF, OCR, parsing ACT/ART, normalização, comparação, risco, relatório |
| `app/workers` | Orquestração síncrona do pipeline de análise (MVP) |
| `app/utils` | Texto, datas, moeda, fuzzy, semáforo agregado |
| `app/seeds` | Carga inicial de ARTs de demonstração |

## Frontend

SPA com **React Router**, **TanStack Query** para servidor e **Zustand** para estado local de rascunho (upload + ART selecionada). Componentes estilo **shadcn** (Radix + CVA + Tailwind). Visualização de PDF com **react-pdf**; imagens via `<img>` com a mesma URL assinada pelo backend.

## Fluxo de dados (análise)

1. `POST /api/v1/uploads` — persiste arquivo, calcula **SHA-256**, lê **metadados PDF** e marca **alerta** se Creator/Producer sugerirem editor gráfico.
2. Usuário escolhe ART (`GET /api/v1/arts`).
3. `POST /api/v1/analyses` — cria registro e executa pipeline: OCR (PyMuPDF → Docling opcional → Tesseract), parsing heurístico do ACT, extração de tabelas (pdfplumber), comparação campo a campo, consulta CNPJ (não bloqueante), persistência de resultados e score.
4. Painel exibe documento + tabela comparativa + score + devolutiva sugerida; exportações **JSON/CSV**.

## LGPD e segurança (MVP)

- Diretório `data/` ignorado no Git; evitar versionar documentos reais.
- Logs podem ser mascarados via config (`MASK_LOGS`).
- Retenção mínima necessária para demo; em produção integrar política de ciclo de vida e ambiente SITAC.

## Escalabilidade

- Trocar `DATABASE_URL` para PostgreSQL (ver `docker-compose.yml`).
- Extrair worker para fila (Redis/RQ ou Celery) se o tempo de OCR ultrapassar SLA.
- OCR principal **Docling/SmolDocling** opcional via `USE_DOCLING=true` quando o ambiente suportar dependências pesadas.
