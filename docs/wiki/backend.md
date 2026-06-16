# Backend

## Entrada

- [server/src/index.ts](../../server/src/index.ts)

Responsabilidades:

- carregar variáveis de ambiente
- habilitar `cors`
- habilitar `express.json()`
- montar rotas
- expor `GET /api/health`

## Rotas

### `server/src/routes/cards.ts`

Responsável por:

- `GET /api/cards/search`
- `GET /api/cards/scryfall/:scryfallId`

Como funciona:

- chama o Scryfall
- normaliza o payload
- salva ou atualiza a carta localmente
- devolve uma resposta pronta para o frontend

### `server/src/routes/decks.ts`

Responsável por:

- `GET /api/decks`
- `POST /api/decks`
- `GET /api/decks/:id`
- `PUT /api/decks/:id`
- `DELETE /api/decks/:id`
- `GET /api/decks/:id/stats`
- `POST /api/decks/:id/cards`
- `PATCH /api/decks/:id/cards/:scryfallId`
- `DELETE /api/decks/:id/cards/:scryfallId`

Regras importantes:

- `command` só é válido em deck `commander`
- comandante é único e fica com quantidade `1`
- ao definir comandante, a cópia em `main` é removida
- `qty <= 0` remove a relação da carta com o deck

### `server/src/routes/shared.ts`

Responsável por:

- `GET /api/shared/:shareToken`
- `POST /api/shared/:shareToken/comments`

Status:

- funcional no backend
- fora do fluxo principal da interface atual

## Biblioteca de apoio

### `server/src/lib/deck-metadata.ts`

Responsável por:

- serializar `Card`
- serializar `DeckCard`
- calcular estatísticas
- montar metadados resumidos para o dashboard

### `server/src/lib/storage.ts`

Responsável por:

- normalizar formato e zona
- serializar e parsear JSON persistido em colunas texto

### `server/src/lib/prisma.ts`

Cria e exporta a instância única do Prisma Client.

## Integração com Scryfall

Arquivo:
- [server/src/services/scryfall.ts](../../server/src/services/scryfall.ts)

O serviço:

- encapsula `fetch`
- tenta até `3` vezes em caso de falha
- normaliza `manaCost`, `colors`, `imageUris`, `artCrop` e `priceUsd`
- ordena busca por `edhrec desc`

## Banco de dados

Arquivo:
- [server/prisma/schema.prisma](../../server/prisma/schema.prisma)

### Tabelas principais

#### `Card`

Cache local das cartas usadas ou buscadas.

Campos relevantes:

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

#### `Deck`

Entidade principal do produto.

Campos relevantes:

- `name`
- `description`
- `format`
- `isShared`
- `shareToken`
- `createdAt`
- `updatedAt`

#### `DeckCard`

Tabela relacional entre deck e carta.

Campos relevantes:

- `deckId`
- `cardId`
- `qty`
- `zone`

Restrição importante:

- `@@unique([deckId, cardId, zone])`

## Migrations atuais

- `20260616011507_sqlite_compat`
- `20260616171410_phase2_card_metadata_stats`
