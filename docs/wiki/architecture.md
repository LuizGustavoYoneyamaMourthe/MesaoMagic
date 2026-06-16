# Arquitetura

## Visão em camadas

O projeto está dividido em três blocos:

1. `client`
   Interface React e estado de navegação
2. `server`
   API REST, regras de deck e integração com Scryfall
3. `database`
   SQLite via Prisma

## Fluxo de dados

```text
React UI
  -> client/src/api.ts
  -> Express routes
  -> Prisma
  -> SQLite

Busca de cartas:
React UI
  -> /api/cards/search
  -> Scryfall
  -> normalização
  -> cache local em Card
  -> resposta pronta para a UI
```

## Frontend

- [client/src/App.tsx](../../client/src/App.tsx)
  Controla tela ativa, carregamento, preview, busca e ações do deck.
- [client/src/deck-builder.ts](../../client/src/deck-builder.ts)
  Reúne helpers de apresentação e métricas de fallback no cliente.
- [client/src/components](../../client/src/components)
  Separa dashboard, editor, viewer, modal, preview e símbolos.

## Backend

- [server/src/index.ts](../../server/src/index.ts)
  Sobe o servidor, registra middlewares e monta as rotas.
- [server/src/routes/decks.ts](../../server/src/routes/decks.ts)
  Implementa CRUD de deck e manipulação de cartas no deck.
- [server/src/routes/cards.ts](../../server/src/routes/cards.ts)
  Implementa busca e cache de cartas.
- [server/src/lib/deck-metadata.ts](../../server/src/lib/deck-metadata.ts)
  Serializa cartas e calcula estatísticas.
- [server/src/services/scryfall.ts](../../server/src/services/scryfall.ts)
  Encapsula requests e normalização da API externa.

## Persistência

Modelo principal:

- `Deck`
- `Card`
- `DeckCard`

Modelos auxiliares/legado:

- `DeckComment`
- `ScryfallCache`

Observação:
- o projeto hoje usa a tabela `Card` como cache efetivo das cartas consultadas
- a tabela `ScryfallCache` existe no schema, mas o fluxo atual não depende dela diretamente

## Decisões de desenho

- o backend calcula as estatísticas principais para manter consistência
- o frontend ainda possui helpers de fallback para reduzir acoplamento durante o rebuild
- o identificador externo canônico da carta é o `scryfallId`
- a cobertura visual do deck usa o `artCrop` do comandante ou de outra carta válida do deck
