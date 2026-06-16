# SDD - Mesão do Dujour

## 1. Objetivo

Documentar a solução atual do produto reconstruído a partir da referência da pasta `Site de Montar Decks MTG`.

O foco do sistema é:

- montar decks de MTG
- salvar decks localmente com persistência real
- consultar cartas via Scryfall
- exibir estatísticas visuais do deck

## 2. Escopo funcional atual

### Incluído

- dashboard de decks salvos
- criação de deck por formato
- edição de deck
- busca de cartas no Scryfall
- adição, remoção e alteração de quantidade
- comandante separado em deck Commander
- sideboard em deck Standard
- visualização em grade e lista
- preview de carta
- estatísticas de deck
- persistência em SQLite

### Fora do foco principal atual

- compartilhamento público como fluxo principal
- comentários públicos na interface
- autenticação
- múltiplos usuários

## 3. Arquitetura da solução

### Frontend

- React
- Vite
- TypeScript

Responsável por:

- navegação interna entre telas
- estado da interface
- interação com a API
- renderização do layout inspirado na referência

### Backend

- Node.js
- Express
- TypeScript

Responsável por:

- CRUD de decks
- integração com Scryfall
- normalização de cartas
- cálculo e serialização de estatísticas
- persistência via Prisma

### Persistência

- SQLite
- Prisma ORM

## 4. Telas e responsabilidades

### Dashboard

Responsável por:

- listar decks
- iniciar criação
- abrir deck no editor
- abrir deck no viewer
- excluir deck

### Editor

Responsável por:

- buscar cartas
- definir zona ativa de inclusão
- adicionar carta
- definir comandante
- renomear deck
- alterar quantidade
- remover carta
- alternar entre grade e lista
- acompanhar preview e métricas

### Viewer

Responsável por:

- consultar deck sem edição
- alternar entre grade e lista
- visualizar preview e estatísticas

## 5. Modelo de dados

### `Card`

Representa uma carta consultada ou usada.

Campos centrais:

- `scryfallId`
- `name`
- `manaCost`
- `cmc`
- `typeLine`
- `oracleText`
- `colors`
- `colorIdentity`
- `imageUris`
- `artCrop`
- `priceUsd`

### `Deck`

Representa o deck salvo.

Campos centrais:

- `id`
- `name`
- `description`
- `format`
- `isShared`
- `shareToken`
- `createdAt`
- `updatedAt`

### `DeckCard`

Representa a presença de uma carta em um deck e zona.

Campos centrais:

- `deckId`
- `cardId`
- `qty`
- `zone`

Regra:

- unicidade por `deckId + cardId + zone`

## 6. Contratos principais da API

### Saúde

- `GET /api/health`

### Decks

- `GET /api/decks`
- `POST /api/decks`
- `GET /api/decks/:id`
- `PUT /api/decks/:id`
- `DELETE /api/decks/:id`
- `GET /api/decks/:id/stats`

### Cartas no deck

- `POST /api/decks/:id/cards`
- `PATCH /api/decks/:id/cards/:scryfallId`
- `DELETE /api/decks/:id/cards/:scryfallId`

### Busca externa

- `GET /api/cards/search`
- `GET /api/cards/scryfall/:scryfallId`

### Legado ainda exposto no backend

- `POST /api/decks/:id/share`
- `DELETE /api/decks/:id/share`
- `GET /api/shared/:shareToken`
- `POST /api/shared/:shareToken/comments`

## 7. Regras de domínio

### Formatos

`Commander`
- meta de `100`
- aceita zona `command`

`Standard`
- meta de `60`
- aceita `sideboard`

`Generico`
- sem meta fixa

### Comandante

- só existe em deck `commander`
- quantidade sempre `1`
- ao entrar em `command`, sai de `main`

### Quantidade

- se a relação já existe, a quantidade é incrementada
- se `qty <= 0`, a relação é removida

### Estatísticas

Calculadas no backend:

- total de cartas
- distribuição por zona
- curva de mana
- terrenos
- CMC médio
- preço estimado
- identidade de cor
- pips por cor

## 8. Fluxo técnico resumido

### Busca

1. frontend chama `/api/cards/search`
2. backend consulta Scryfall
3. payload é normalizado
4. cartas são persistidas localmente
5. resposta volta pronta para UI

### Edição de deck

1. frontend chama rota de deck
2. backend garante consistência de zona e quantidade
3. Prisma persiste no SQLite
4. frontend recarrega deck e dashboard

## 9. Organização de arquivos

### Frontend

- `client/src/App.tsx`
- `client/src/api.ts`
- `client/src/deck-builder.ts`
- `client/src/components/*`

### Backend

- `server/src/index.ts`
- `server/src/routes/cards.ts`
- `server/src/routes/decks.ts`
- `server/src/routes/shared.ts`
- `server/src/lib/deck-metadata.ts`
- `server/src/lib/storage.ts`
- `server/src/services/scryfall.ts`

### Banco

- `server/prisma/schema.prisma`
- `server/prisma/migrations/*`

## 10. Decisões técnicas importantes

- `scryfallId` é a identidade externa principal das cartas
- a UI usa dados enriquecidos da API, não payload bruto do Scryfall
- a capa do deck prioriza a arte do comandante
- o backend é a fonte oficial para estatísticas persistidas
- o frontend mantém cálculos auxiliares apenas como fallback de renderização

## 11. Operação local

### Setup

```bash
npm run install:all
npm run prisma:generate --prefix server
npm run prisma:migrate --prefix server
npm run dev
```

### Portas padrão

- frontend: `5173`
- backend: `4000`

## 12. Riscos e próximos passos

### Riscos atuais

- ainda existem endpoints e partes de schema fora do núcleo do produto atual
- não há autenticação nem separação por usuário
- não há suíte automatizada de testes neste momento

### Próximos passos recomendados

- limpar contratos legados de compartilhamento se não forem retomados
- adicionar testes de API para regras de comandante e estatísticas
- refinar documentação de deploy se o projeto sair do ambiente local
