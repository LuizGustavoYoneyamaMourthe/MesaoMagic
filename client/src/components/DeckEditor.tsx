import type { CardItem, DeckDetail, DeckDetailCard, DeckZone } from '../api';
import type { DeckGroup, DeckMetrics, DeckViewMode, PreviewCard } from '../deck-builder';
import { canBeCommander, formatDeckLabel, formatUsd, getCardImage, toPreviewCard } from '../deck-builder';
import { DeckPreviewPanel } from './DeckPreviewPanel';
import { ManaCost } from './ManaCost';

type DeckEditorProps = {
  activeDeck: DeckDetail | null;
  groupedCards: DeckGroup[];
  activeCards: DeckDetailCard[];
  commanderCard: DeckDetailCard | null;
  deckNameDraft: string;
  editorMode: DeckViewMode;
  loadingSearch: boolean;
  loadingDeckAction: boolean;
  selectedZone: DeckZone;
  query: string;
  searchTotal: number;
  searchResults: CardItem[];
  previewCard: PreviewCard | null;
  metrics: DeckMetrics;
  onChangeQuery: (value: string) => void;
  onChangeDeckNameDraft: (value: string) => void;
  onSaveDeckName: () => void;
  onSetEditorMode: (mode: DeckViewMode) => void;
  onSetZone: (zone: DeckZone) => void;
  onHoverCard: (card: PreviewCard) => void;
  onAddCard: (card: CardItem) => void;
  onSetCommander: (card: CardItem) => void;
  onClearCommander: () => void;
  onChangeQty: (card: DeckDetailCard, nextQty: number) => void;
  onRemoveCard: (card: DeckDetailCard) => void;
};

export function DeckEditor(props: DeckEditorProps) {
  const isStandard = props.activeDeck?.format === 'standard';
  const isCommander = props.activeDeck?.format === 'commander';
  const hasSearchQuery = props.query.trim().length >= 2;
  const deckCountLabel = props.metrics.deckTarget
    ? `${props.metrics.deckCount} / ${props.metrics.deckTarget} cartas`
    : `${props.metrics.deckCount} cartas`;
  const priceLabel = formatUsd(props.metrics.estimatedPrice);

  return (
    <section className="editor-layout">
      <aside className="panel search-panel">
        <div className="search-panel__top">
          <div className="panel-header search-panel__header">
            <div className="search-panel__header-copy">
              <h2>Buscar cartas</h2>
              {isStandard ? <span className="search-panel__zone-label">{props.selectedZone === 'main' ? 'Main' : 'Sideboard'}</span> : null}
            </div>
          </div>

          <div className="search-panel__controls">
            <div className="search-panel__input-wrap">
              <input
                className="search-panel__input"
                value={props.query}
                onChange={(event) => props.onChangeQuery(event.target.value)}
                placeholder="Ex: lightning bolt, t:creature c:r"
              />
            </div>

            {isStandard ? (
              <div className="zone-switch search-panel__zones">
                <button className={props.selectedZone === 'main' ? 'is-active' : ''} onClick={() => props.onSetZone('main')}>
                  Main
                </button>
                <button className={props.selectedZone === 'sideboard' ? 'is-active' : ''} onClick={() => props.onSetZone('sideboard')}>
                  Sideboard
                </button>
              </div>
            ) : null}

            <div className="panel-note search-panel__status">
              {props.loadingSearch ? (
                <span className="search-panel__status-primary">Buscando...</span>
              ) : hasSearchQuery ? (
                <>
                  <span className="search-panel__status-primary">{props.searchTotal} resultado(s)</span>
                  <span className="search-panel__status-secondary">Cartas, imagens e precos reais.</span>
                </>
              ) : (
                <>
                  <span className="search-panel__status-primary">Digite o nome de uma carta para buscar no Scryfall.</span>
                  <span className="search-panel__status-secondary">Ex.: lightning bolt, t:creature c:r</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="search-results search-panel__results">
          {!props.loadingSearch && !hasSearchQuery ? (
            <div className="search-empty search-empty--hint">
              Digite ao menos 2 caracteres para ver cartas, imagens e precos.
            </div>
          ) : null}

          {!props.loadingSearch && hasSearchQuery && props.searchResults.length === 0 ? (
            <div className="search-empty">Nenhuma carta encontrada para essa busca.</div>
          ) : null}

          {props.searchResults.map((card) => (
            <article
              className="search-card search-results__item"
              key={card.scryfallId}
              onMouseEnter={() => props.onHoverCard(toPreviewCard(card))}
              onClick={() => props.onHoverCard(toPreviewCard(card))}
            >
              <img className="search-card__image" src={getCardImage(card)} alt={card.name} />
              <div className="search-card__body">
                <div className="search-card__copy">
                  <strong>{card.name}</strong>
                  <div className="search-card__meta">
                    <ManaCost value={card.manaCost} />
                    <span>{card.typeLine || 'Carta sem tipo'}</span>
                  </div>
                </div>
              </div>
              <div className="search-card__actions search-card__actions--stacked">
                <span className="search-card__price">{formatUsd(card.priceUsd)}</span>
                <div className="search-card__buttons">
                  {isCommander && canBeCommander(card) ? (
                    <button className="icon-button icon-button--command" onClick={() => props.onSetCommander(card)} title="Tornar comandante">
                      ♛
                    </button>
                  ) : null}
                  <button className="icon-button icon-button--add" onClick={() => props.onAddCard(card)}>+</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </aside>

      <section className="panel deck-panel">
        <div className="deck-panel__top deck-panel__top--editor">
          <div className="deck-panel__identity">
            <div className="deck-panel__title-row">
              <input
                className="deck-name-input deck-panel__name-input"
                value={props.deckNameDraft}
                onChange={(event) => props.onChangeDeckNameDraft(event.target.value)}
                placeholder="Nome do deck"
              />
              <span className="deck-badge deck-panel__format-badge">{props.activeDeck ? formatDeckLabel(props.activeDeck.format) : 'Deck'}</span>
            </div>
            <div className="deck-meta deck-panel__meta">
              <span>{props.metrics.avgCmc.toFixed(2)} CMC medio</span>
              <span>{props.metrics.lands} terrenos</span>
              {!props.metrics.deckTarget ? <span>{deckCountLabel}</span> : null}
              {!props.metrics.deckTarget ? <span>{priceLabel}</span> : null}
            </div>
          </div>

          <div className="deck-panel__actions">
            <button className="secondary-button" onClick={props.onSaveDeckName} disabled={props.loadingDeckAction}>
              Salvar nome
            </button>
            <div className="mode-toggle">
              <button className={props.editorMode === 'list' ? 'is-active' : ''} onClick={() => props.onSetEditorMode('list')}>
                Lista
              </button>
              <button className={props.editorMode === 'grid' ? 'is-active' : ''} onClick={() => props.onSetEditorMode('grid')}>
                Grade
              </button>
            </div>
          </div>
        </div>

        {props.metrics.deckTarget ? (
          <div className="progress-block deck-panel__progress">
            <div className="progress-label deck-panel__progress-label">
              <span>{deckCountLabel}</span>
              <span>{priceLabel}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar__fill" style={{ width: `${props.metrics.progress}%` }} />
            </div>
          </div>
        ) : null}

        {isCommander ? (
          <div className="commander-block commander-block--editor">
            <div className="panel-header commander-block__header">
              <h3>Comandante</h3>
            </div>

            {props.commanderCard ? (
              <article
                className="commander-card commander-card--editor"
                onMouseEnter={() => props.onHoverCard(toPreviewCard(props.commanderCard))}
                onClick={() => props.onHoverCard(toPreviewCard(props.commanderCard))}
              >
                <img className="commander-card__image" src={getCardImage(props.commanderCard)} alt={props.commanderCard.name} />
                <div className="commander-card__copy">
                  <div className="commander-card__header">
                    <strong>{props.commanderCard.name}</strong>
                    <span className="commander-card__type">{props.commanderCard.typeLine || 'Sem tipo'}</span>
                  </div>
                  <div className="commander-card__meta">
                    <ManaCost value={props.commanderCard.manaCost} />
                  </div>
                </div>
                <div className="commander-card__actions">
                  <button className="secondary-button" onClick={props.onClearCommander}>Remover</button>
                </div>
              </article>
            ) : (
              <div className="commander-empty commander-empty--editor">
                Busque uma criatura lendaria e clique em <span className="commander-empty__icon">♛</span> para defini-la como comandante.
              </div>
            )}
          </div>
        ) : null}

        {props.activeCards.length === 0 ? (
          <div className="empty-panel compact">
            <h2>Deck vazio</h2>
            <p>Use a coluna de busca para adicionar cartas.</p>
          </div>
        ) : null}

        {props.editorMode === 'list' ? (
          <div className="group-stack">
            {props.groupedCards.map((group) => (
              <section className="group-section" key={group.key}>
                <div className="group-header">
                  <strong className="group-header__label">{group.label}</strong>
                  <span className="group-header__count">{group.totalCards}</span>
                  <span className="group-header__line" />
                </div>
                <div className="group-list">
                  {group.cards.map((card) => (
                    <article
                      className="group-row"
                      key={`${card.scryfallId}-${card.zone}`}
                      onMouseEnter={() => props.onHoverCard(toPreviewCard(card))}
                      onClick={() => props.onHoverCard(toPreviewCard(card))}
                    >
                      <div className="qty-controls">
                        <button onClick={() => props.onChangeQty(card, card.qty - 1)}>−</button>
                        <span>{card.qty}</span>
                        <button onClick={() => props.onChangeQty(card, card.qty + 1)}>+</button>
                      </div>
                      <div className="group-row__copy">
                        <strong className="group-row__name">{card.name}</strong>
                        {card.zone !== 'main' ? <span className="group-row__zone">{card.zone === 'sideboard' ? 'Sideboard' : 'Command'}</span> : null}
                      </div>
                      <div className="group-row__trailing">
                        <ManaCost value={card.manaCost} />
                        <span className="group-row__price">{formatUsd(card.priceUsd)}</span>
                        <button className="danger-button icon-button" onClick={() => props.onRemoveCard(card)}>✕</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : null}

        {props.editorMode === 'grid' ? (
          <div className="card-grid">
            {props.activeCards.map((card) => (
              <article
                className="card-tile"
                key={`${card.scryfallId}-${card.zone}`}
                onMouseEnter={() => props.onHoverCard(toPreviewCard(card))}
                onClick={() => props.onHoverCard(toPreviewCard(card))}
              >
                <img src={getCardImage(card)} alt={card.name} />
                <div className="card-tile__footer">
                  <span>{card.qty}x</span>
                  <div className="qty-controls">
                    <button onClick={() => props.onChangeQty(card, card.qty - 1)}>−</button>
                    <button onClick={() => props.onChangeQty(card, card.qty + 1)}>+</button>
                    <button className="danger-button" onClick={() => props.onRemoveCard(card)}>✕</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <DeckPreviewPanel
        format={props.activeDeck?.format}
        previewCard={props.previewCard}
        fallbackName={props.activeDeck?.name}
        metrics={props.metrics}
        mode="editor"
      />
    </section>
  );
}
