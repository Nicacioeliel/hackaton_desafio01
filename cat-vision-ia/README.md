# CAT Vision IA

**Triagem inteligente e explicável** para confronto entre **Atestado de Capacidade Técnica (ACT)** e **ART** de referência — hackathon **CREA-MA**. O sistema **não substitui** o analista humano.

## Stack

- **Backend:** Python 3.11+, FastAPI, SQLAlchemy, Alembic, Pydantic, httpx, pandas, PyMuPDF, pdfplumber, Tesseract (opcional), SQLite (MVP) ou PostgreSQL.
- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, Radix/shadcn-style UI, TanStack Query, Zustand, react-pdf, Recharts.

## Pré-requisitos

- Python 3.11+
- Node.js 20+
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) instalado no SO (para PDFs escaneados e imagens). No Windows, adicione ao `PATH` ou configure `TESSERACT_CMD` no `.env`.
- Poppler (para `pdf2image` em PDFs multipágina no Tesseract) — [poppler-windows](https://github.com/oschwartz10612/poppler-windows/releases) ou equivalente.

## Execução rápida

### 1. Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# Opcional: alembic upgrade head  (ou use create_all automático no startup)
python -m app.seeds.seed_arts
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173). A API é proxied para `http://127.0.0.1:8000`.

### 3. Docker (PostgreSQL opcional)

```powershell
docker compose up -d
# Ajuste DATABASE_URL no .env do backend para PostgreSQL conforme serviço.
```

## Scripts úteis

| Script | Descrição |
|--------|-----------|
| `python -m app.seeds.seed_arts` | Insere ARTs `MA20250929762` e `MA20250957723` |
| `pytest app/tests -q` | Testes unitários básicos |
| `alembic upgrade head` | Migrações (pasta `backend`) |

## Documentação

- [docs/arquitetura.md](docs/arquitetura.md)
- [docs/regras-comparacao.md](docs/regras-comparacao.md)
- [docs/api-contract.md](docs/api-contract.md)
- [docs/casos-demo.md](docs/casos-demo.md)
- [docs/pitch-hackathon.md](docs/pitch-hackathon.md)

## LGPD (MVP)

Não versionar uploads reais. Pasta `backend/data/` está no `.gitignore`. Em produção, definir política de retenção e integração com ambiente corporativo (ex.: SITAC).

## Licença

Uso educacional / demonstração hackathon — ajustar conforme organização.
