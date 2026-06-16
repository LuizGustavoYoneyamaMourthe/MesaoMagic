# Mesão do Dujour

Deck builder de Magic: The Gathering inspirado na referência da pasta `Site de Montar Decks MTG`, com interface em React, API em Express e persistência local em SQLite via Prisma.

## O que o projeto entrega hoje

- dashboard com decks salvos
- criação de deck por formato
- editor com busca no Scryfall
- suporte a `Commander`, `Standard` e `Generico`
- comandante separado em decks Commander
- sideboard em decks Standard
- visualização em grade e lista
- estatísticas do deck
- salvamento real no banco local

## Stack

- `client`: React + Vite + TypeScript
- `server`: Express + TypeScript
- `database`: SQLite + Prisma
- `external source`: Scryfall API

## Como iniciar

1. Instale tudo:

```bash
npm run install:all
```

2. Gere o client Prisma:

```bash
npm run prisma:generate --prefix server
```

3. Aplique as migrations no SQLite local:

```bash
npm run prisma:migrate --prefix server
```

4. Suba frontend e backend:

```bash
npm run dev
```

## Endereços locais

- frontend: `http://localhost:5173`
- backend: `http://localhost:4000`
- healthcheck: `http://localhost:4000/api/health`

## Estrutura rápida

- [client/src/App.tsx](client/src/App.tsx) centraliza navegação e estado principal
- [client/src/components](client/src/components) contém as telas e blocos visuais
- [client/src/api.ts](client/src/api.ts) define o contrato HTTP do frontend
- [server/src/routes](server/src/routes) expõe decks, cartas e compartilhamento
- [server/src/lib/deck-metadata.ts](server/src/lib/deck-metadata.ts) calcula estatísticas e serialização
- [server/src/services/scryfall.ts](server/src/services/scryfall.ts) integra com o Scryfall
- [server/prisma/schema.prisma](server/prisma/schema.prisma) define o modelo do banco

## Documentação

- [SDD](docs/sdd.md)
- [Wiki](docs/wiki/README.md)
- [Fluxos](docs/wiki/flows.md)
- [Frontend](docs/wiki/frontend.md)
- [Backend](docs/wiki/backend.md)
- [Arquitetura](docs/wiki/architecture.md)
- [Execução local](docs/wiki/runbook.md)

## Observações

- O core atual do produto é o construtor de decks salvo localmente.
- As rotas de compartilhamento e comentários ainda existem no backend, mas não fazem parte do fluxo principal da interface atual.
