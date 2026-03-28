# Backend — CAT Vision IA

## Variáveis

Copie `.env.example` para `.env`. Principais chaves:

- `DATABASE_URL` — SQLite padrão ou PostgreSQL.
- `UPLOAD_DIR` — diretório de armazenamento de arquivos.
- `CORS_ORIGINS` — origins do frontend (Vite).
- `BRASIL_API_BASE`, `CNPJ_REQUEST_TIMEOUT_SECONDS`
- `USE_DOCLING` — `true` apenas se `docling` estiver instalado.
- `TESSERACT_CMD` — caminho do executável no Windows, se necessário.

## Testes

```powershell
pytest app/tests -q
```

## Migrações

O startup chama `create_all` para MVP. Para Alembic:

```powershell
alembic upgrade head
```
