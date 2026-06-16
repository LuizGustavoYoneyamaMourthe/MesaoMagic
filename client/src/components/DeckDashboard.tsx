import type { DeckSummary } from '../api';
import { formatDeckLabel, formatUsd } from '../deck-builder';
import { ColorSymbols } from './ColorSymbols';

type DeckDashboardProps = {
  decks: DeckSummary[];
  loadingDecks: boolean;
  onOpenCreate: () => void;
  onOpenEditor: (deckId: number) => void;
  onOpenViewer: (deckId: number) => void;
  onDeleteDeck: (deckId: number) => void;
};

export function DeckDashboard(props: DeckDashboardProps) {
  return (
    <section className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Meus Decks</h1>
          <p>{props.decks.length} deck(s) salvos</p>
        </div>
        <button onClick={props.onOpenCreate}>+ Novo deck</button>
      </div>

      {props.loadingDecks && props.decks.length === 0 ? <div className="empty-panel">Carregando decks...</div> : null}

      {!props.loadingDecks && props.decks.length === 0 ? (
        <div className="empty-panel">
          <h2>Seu grimorio esta vazio</h2>
          <p>Crie seu primeiro deck para comecar a montar a colecao.</p>
          <button onClick={props.onOpenCreate}>Criar primeiro deck</button>
        </div>
      ) : null}

      <div className="deck-grid">
        {props.decks.map((deck) => (
          <article className="deck-card" key={deck.id}>
            <button
              className="deck-cover"
              type="button"
              onClick={() => props.onOpenViewer(deck.id)}
              style={
                deck.coverImage
                  ? {
                      backgroundImage: `linear-gradient(180deg, rgba(20,15,8,0.08), rgba(20,15,8,0.55)), url(${deck.coverImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }
                  : undefined
              }
            >
              <span className="deck-badge">{formatDeckLabel(deck.format)}</span>
              <ColorSymbols className="deck-cover__colors" colors={deck.colorIdentity} size="sm" />
              <div className="deck-cover__content">
                <strong>{deck.name}</strong>
                <span>{deck.targetCards ? `${deck.totalCards}/${deck.targetCards} cartas` : `${deck.totalCards} cartas`}</span>
              </div>
            </button>

                <div className="deck-card__body">
                  <div>
                    <h3>{deck.name}</h3>
                    <p>{deck.commanderName || formatDeckLabel(deck.format)}</p>
                    <p>{formatUsd(deck.estimatedPriceUsd)}</p>
                  </div>
              <div className="deck-card__actions">
                <button onClick={() => props.onOpenEditor(deck.id)}>Editar</button>
                <button className="secondary-button" onClick={() => props.onOpenViewer(deck.id)}>Ver</button>
                <button className="danger-button" onClick={() => props.onDeleteDeck(deck.id)}>Excluir</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
