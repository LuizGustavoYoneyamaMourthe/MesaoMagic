# Fluxos do Produto

## 1. Inicialização da aplicação

1. O frontend monta [App.tsx](../../client/src/App.tsx).
2. `loadDecks()` chama `GET /api/decks`.
3. A aplicação entra na tela `dashboard`.

## 2. Fluxo de dashboard

Arquivo principal:
- [DeckDashboard.tsx](../../client/src/components/DeckDashboard.tsx)

O dashboard:

- renderiza os decks retornados pela API
- abre modal de criação
- abre deck no editor
- abre deck no viewer
- exclui deck

Dados exibidos em cada card:

- nome
- formato
- quantidade atual / meta
- capa do deck
- identidade de cor
- preço estimado

## 3. Fluxo de criação de deck

Arquivos:
- [CreateDeckModal.tsx](../../client/src/components/CreateDeckModal.tsx)
- [client/src/api.ts](../../client/src/api.ts)

Sequência:

1. usuário clica em `+ Novo deck`
2. modal coleta `nome` e `formato`
3. frontend chama `POST /api/decks`
4. ao criar, o deck é recarregado e a tela muda para `editor`

## 4. Fluxo de edição

Arquivo principal:
- [DeckEditor.tsx](../../client/src/components/DeckEditor.tsx)

O editor tem três áreas:

1. busca
   - consulta o Scryfall
   - mostra preview rápido
   - adiciona carta ao deck
   - define comandante quando a carta é válida
2. deck
   - renomeia o deck
   - alterna entre lista e grade
   - mostra grupos por tipo
   - altera quantidade e remove cartas
3. preview e estatísticas
   - mostra carta destacada
   - mostra curva, preço, terrenos, meta e pips por cor

## 5. Fluxo de busca de cartas

Arquivos:
- [client/src/App.tsx](../../client/src/App.tsx)
- [server/src/routes/cards.ts](../../server/src/routes/cards.ts)
- [server/src/services/scryfall.ts](../../server/src/services/scryfall.ts)

Sequência:

1. o usuário digita pelo menos `2` caracteres
2. o frontend aplica debounce simples com `setTimeout`
3. `searchCards()` chama `GET /api/cards/search`
4. o backend consulta o Scryfall
5. o backend normaliza os dados e faz `upsert` local das cartas retornadas
6. o frontend renderiza os resultados

## 6. Fluxo de adicionar carta

1. o usuário clica em `+`
2. o frontend chama `POST /api/decks/:id/cards`
3. o backend garante que a carta exista localmente
4. se a carta não existir, o backend busca por `scryfallId`
5. a relação `DeckCard` é criada ou incrementada
6. o frontend recarrega o deck e o dashboard

## 7. Fluxo de comandante

Regra implementada:

- só decks `commander` aceitam zona `command`
- o comandante fica com `qty = 1`
- ao definir comandante, a mesma carta é removida de `main`

## 8. Fluxo de visualização

Arquivo principal:
- [DeckViewer.tsx](../../client/src/components/DeckViewer.tsx)

O viewer:

- mostra o deck em modo `grid` ou `list`
- mantém preview da carta selecionada
- mantém bloco de estatísticas
- não executa ações de edição

## 9. Fluxo de estatísticas

Arquivo principal:
- [server/src/lib/deck-metadata.ts](../../server/src/lib/deck-metadata.ts)

As métricas são calculadas no backend a partir de `DeckCard + Card`:

- total de cartas
- distribuição por zona
- curva de mana
- CMC médio
- terrenos
- preço estimado
- identidade de cor
- pips por cor

## 10. Fluxo de exclusão

1. o usuário confirma a exclusão
2. o frontend chama `DELETE /api/decks/:id`
3. o backend remove o deck
4. o frontend recarrega a lista
