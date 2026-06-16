import type { DeckDetail, DeckDetailCard } from '../api';
import type { DeckGroup, DeckMetrics, DeckViewMode, PreviewCard } from '../deck-builder';
import { formatDeckLabel, formatUsd, getCardImage, toPreviewCard } from '../deck-builder';
import { DeckPreviewPanel } from './DeckPreviewPanel';
import { ManaCost } from './ManaCost';

type DeckViewerProps = {
  activeDeck: DeckDetail | null;
  activeCards: DeckDetailCard[];
  commanderCard: DeckDetailCard | null;
  groupedCards: DeckGroup[];
  viewerMode: DeckViewMode;
  previewCard: PreviewCard | null;
  metrics: DeckMetrics;
  onSetViewerMode: (mode: DeckViewMode) => void;
  onHoverCard: (card: PreviewCard) => void;
};

export function DeckViewer(props: DeckViewerProps) {
  return (
    <section className="viewer-layout">
      <section className="panel viewer-main">
        <div className="viewer-header">
          <div>
            <h1>{props.activeDeck?.name || 'Deck'}</h1>
            <p>
              {props.activeDeck ? formatDeckLabel(props.activeDeck.format) : ''} · {props.metrics.deckCount} cartas · CMC medio{' '}
              {props.metrics.avgCmc.toFixed(2)} · {formatUsd(props.metrics.estimatedPrice)}
            </p>
          </div>
          <div className="mode-toggle">
            <button className={props.viewerMode === 'grid' ? 'is-active' : ''} onClick={() => props.onSetViewerMode('grid')}>
              Grade
            </button>
            <button className={props.viewerMode === 'list' ? 'is-active' : ''} onClick={() => props.onSetViewerMode('list')}>
              Lista
            </button>
          </div>
        </div>

        {props.commanderCard ? (
          <article
            className="commander-card viewer-commander"
            onMouseEnter={() => props.onHoverCard(toPreviewCard(props.commanderCard))}
            onClick={() => props.onHoverCard(toPreviewCard(props.commanderCard))}
          >
            <img className="commander-card__image" src={getCardImage(props.commanderCard)} alt={props.commanderCard.name} />
            <div className="commander-card__copy">
              <div className="commander-card__type">Comandante</div>
              <strong>{props.commanderCard.name}</strong>
            </div>
          </article>
        ) : null}

        {props.viewerMode === 'grid' ? (
          <div className="card-grid">
            {props.activeCards.map((card) => (
              <article
                className="card-tile readonly"
                key={`${card.scryfallId}-${card.zone}`}
                onMouseEnter={() => props.onHoverCard(toPreviewCard(card))}
                onClick={() => props.onHoverCard(toPreviewCard(card))}
              >
                <img src={getCardImage(card)} alt={card.name} />
                <span className="card-tile__badge">{card.qty}x</span>
              </article>
            ))}
          </div>
        ) : null}

        {props.viewerMode === 'list' ? (
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
                      className="group-row readonly"
                      key={`${card.scryfallId}-${card.zone}`}
                      onMouseEnter={() => props.onHoverCard(toPreviewCard(card))}
                      onClick={() => props.onHoverCard(toPreviewCard(card))}
                    >
                      <span className="group-row__qty-label">{card.qty}x</span>
                      <div className="group-row__copy">
                        <strong className="group-row__name">{card.name}</strong>
                        {card.zone !== 'main' ? <span className="group-row__zone">{card.zone === 'command' ? 'Command' : 'Sideboard'}</span> : null}
                      </div>
                      <div className="group-row__trailing">
                        <ManaCost value={card.manaCost} />
                        <span className="group-row__price">{formatUsd(card.priceUsd)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : null}
      </section>

      <DeckPreviewPanel
        format={props.activeDeck?.format}
        previewCard={props.previewCard}
        fallbackName={props.activeDeck?.name}
        metrics={props.metrics}
        mode="viewer"
      />
    </section>
  );
}
