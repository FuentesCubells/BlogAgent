# Agent — Backend

Servidor NestJS

## Requisitos

- Node 20+
- pnpm 9+

## Arranque

```bash
cp .env.example .env   # ajusta las variables si es necesario
pnpm install
pnpm start:dev         # http://localhost:3000/api/health
```

## Scripts

| Comando           | Descripción                |
| ----------------- | -------------------------- |
| `pnpm start:dev`  | Desarrollo con hot-reload  |
| `pnpm build`      | Compilación de producción  |
| `pnpm start:prod` | Arranca el build compilado |
| `pnpm test`       | Tests unitarios            |
| `pnpm test:e2e`   | Tests end-to-end           |
| `pnpm lint`       | ESLint + Prettier          |

## Estructura

```
src/
├── config/      # Validación de entorno y ConfigModule global
├── common/      # Filtros, interceptores y pipes globales
├── health/      # GET /api/health — liveness probe
└── main.ts      # Bootstrap (Helmet, CORS, ValidationPipe, HTTPS opcional)
```
