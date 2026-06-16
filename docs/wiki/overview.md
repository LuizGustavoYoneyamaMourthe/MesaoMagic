# Visão Geral

## Objetivo

O projeto reconstrói o fluxo de um site de montagem de decks de MTG tomando a pasta `Site de Montar Decks MTG` como referência funcional e visual, mas com uma base organizada e persistência real.

## Proposta atual

O sistema é um deck builder local com três experiências principais:

1. `Dashboard`
   Lista os decks salvos, mostra capa, formato, quantidade de cartas, identidade de cor e preço estimado.
2. `Editor`
   Permite buscar cartas no Scryfall, adicionar ao deck, definir comandante, trocar quantidades e acompanhar estatísticas.
3. `Viewer`
   Mostra o deck de forma enxuta para consulta, mantendo preview e métricas.

## Regras centrais

- `Commander`
  - meta de `100` cartas
  - usa zona `command`
  - o comandante fica separado do restante
- `Standard`
  - meta de `60` cartas
  - usa `main` e `sideboard`
- `Generico`
  - sem meta rígida

## Persistência

Toda alteração importante é persistida no backend:

- criar deck
- renomear deck
- adicionar carta
- alterar quantidade
- remover carta
- definir ou remover comandante

## Escopo atual versus legado

O fluxo principal atual é deck building local. O backend ainda mantém endpoints de compartilhamento e comentários, mas isso está fora do núcleo do produto hoje.
