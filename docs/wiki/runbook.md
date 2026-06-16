# Execução Local

## Pré-requisitos

- Node.js 18+
- npm

## Arquivos de ambiente

Arquivo atual:
- [server/.env](../../server/.env)

Valores usados localmente:

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=4000
NODE_ENV=development
```

## Instalação

```bash
npm run install:all
```

## Banco e Prisma

Gerar o client:

```bash
npm run prisma:generate --prefix server
```

Aplicar migrations:

```bash
npm run prisma:migrate --prefix server
```

Abrir Prisma Studio, se quiser inspecionar o banco:

```bash
npm run prisma:studio --prefix server
```

## Desenvolvimento

Subir tudo:

```bash
npm run dev
```

Subir apenas backend:

```bash
npm run dev:server
```

Subir apenas frontend:

```bash
npm run dev:client
```

## Build

Frontend:

```bash
npm run build --prefix client
```

Backend:

```bash
npm run build --prefix server
```

## Endpoints úteis

- `GET /api/health`
- `GET /api/decks`
- `GET /api/decks/:id`
- `GET /api/decks/:id/stats`
- `GET /api/cards/search?q=sol%20ring`

## Problemas comuns

### Porta ocupada

Altere `PORT` no `server/.env` ou encerre o processo anterior.

### Banco não atualizado

Rode novamente:

```bash
npm run prisma:migrate --prefix server
```

### Frontend sem comunicação com a API

Confirme se:

- o backend está em `http://localhost:4000`
- o frontend está rodando pelo Vite
- a rota `GET /api/health` responde
