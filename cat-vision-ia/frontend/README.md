# Frontend — CAT Vision IA

## Desenvolvimento

```powershell
npm install
npm run dev
```

O `vite.config.ts` faz proxy de `/api` e `/health` para o backend em `127.0.0.1:8000`.

## Build

```powershell
npm run build
npm run preview
```

## Estrutura

- `src/app` — router, providers, query client
- `src/pages` — telas principais
- `src/components` — UI, layout, domínio
- `src/services` — chamadas HTTP
- `src/store` — Zustand
- `src/hooks` — TanStack Query wrappers
