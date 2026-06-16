# Wiki do Projeto

Esta wiki descreve como o Mesão do Dujour funciona hoje, com foco no fluxo real implementado no código.

## Leitura sugerida

1. [Visão geral](overview.md)
2. [Fluxos do produto](flows.md)
3. [Arquitetura](architecture.md)
4. [Frontend](frontend.md)
5. [Backend](backend.md)
6. [Execução local](runbook.md)

## Mapa rápido

- `dashboard`: lista os decks salvos
- `editor`: busca cartas, monta deck e salva no banco
- `viewer`: consulta o deck de forma limpa, sem edição
- `Scryfall`: origem dos dados de carta
- `SQLite`: persistência local dos decks e cache básico das cartas
