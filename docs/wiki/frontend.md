# Frontend

## Entrada

- [client/src/main.tsx](../../client/src/main.tsx)
  Monta o React e importa o CSS global.
- [client/src/App.tsx](../../client/src/App.tsx)
  É o container principal do produto.

## Responsabilidades do `App.tsx`

- alternar entre `dashboard`, `editor` e `viewer`
- carregar decks
- carregar um deck ativo
- executar busca com debounce
- controlar modal de criação
- disparar ações da API
- manter a carta em preview
- transformar stats da API em `DeckMetrics`

## Arquivos e função de cada um

### `client/src/api.ts`

Camada HTTP do frontend.

Responsável por:

- tipos de resposta da API
- `requestJson()`
- CRUD de decks
- busca de cartas
- operações de share/comentários legadas

### `client/src/deck-builder.ts`

Helpers de visualização.

Responsável por:

- agrupar cartas por tipo
- calcular métricas de fallback
- formatar dólar
- decidir a meta do deck
- verificar se uma carta pode ser comandante
- converter itens em `PreviewCard`

### `client/src/components/DeckDashboard.tsx`

Tela inicial com os cards de deck.

### `client/src/components/CreateDeckModal.tsx`

Modal de criação de deck.

### `client/src/components/DeckEditor.tsx`

Tela de edição com:

- busca
- deck
- preview/estatísticas

### `client/src/components/DeckViewer.tsx`

Tela de consulta sem edição.

### `client/src/components/DeckPreviewPanel.tsx`

Painel lateral compartilhado entre editor e viewer.

Mostra:

- preview da carta
- mana cost
- resumo do deck
- curva de mana
- pips por cor

### `client/src/components/ColorSymbols.tsx`

Renderiza os símbolos reais de mana usando SVGs do Scryfall.

### `client/src/components/ManaCost.tsx`

Renderiza o custo de mana das cartas no layout do app.

## Estado principal

Estados mais importantes em `App.tsx`:

- `screen`
- `decks`
- `activeDeckId`
- `activeDeck`
- `showCreateModal`
- `deckNameDraft`
- `editorMode`
- `viewerMode`
- `selectedZone`
- `query`
- `searchResults`
- `previewCard`

## Observações de implementação

- a busca é disparada apenas no editor
- `useDeferredValue` reduz a pressão da digitação sobre a busca
- o frontend recarrega o deck após cada ação relevante em vez de manter reconciliação local complexa
- o backend é a fonte principal para estatísticas e estado persistido
