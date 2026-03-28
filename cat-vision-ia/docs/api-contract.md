# Contrato REST (v1) — resumo

Base: `/api/v1` (exceto `GET /health` na raiz).

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET | `/health` | Saúde do serviço |
| GET | `/arts` | Lista ARTs (`?q=` opcional) |
| GET | `/arts/{id}` | Detalhe ART |
| POST | `/uploads` | Multipart arquivo → metadados + hash |
| GET | `/uploads/{id}/file` | Arquivo original (visualização) |
| POST | `/analyses` | Corpo `{ upload_id, art_id }` → pipeline completo |
| GET | `/analyses` | Lista (`?status=`, `?art_q=`, paginação simples) |
| GET | `/analyses/{id}` | Detalhe com campos e tabelas |
| GET | `/analyses/{id}/report` | Relatório agregado (JSON) |
| GET | `/analyses/{id}/export/json` | Download JSON |
| GET | `/analyses/{id}/export/csv` | Download CSV |
| POST | `/cnpj/validate` | `{ "cnpj": "..." }` — consulta pontual |
| GET | `/dashboard/metrics` | KPIs do painel |

## Erros

- `413` — arquivo acima do limite configurado.
- `404` — ART/upload/análise inexistente.
- `500` — falha no pipeline (mensagem resumida; detalhes no log servidor).

## Cabeçalhos CORS

Configurável via `CORS_ORIGINS` para o origin do Vite (`http://localhost:5173`).
