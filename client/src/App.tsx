import { useDeferredValue, useEffect, useState } from 'react';
import {
  type CardItem,
  type DeckDetail,
  type DeckDetailCard,
  type DeckSummary,
  type DeckZone,
  addCardToDeck,
  createDeck,
  deleteDeck,
  getDeck,
  getDecks,
  removeDeckCard,
  searchCards,
  updateDeckCardQty,
  updateDeckName
} from './api';
import {
  type DeckMetrics,
  type DeckViewMode,
  type PreviewCard,
  averageCmc,
  buildCurve,
  canBeCommander,
  colorIdentity,
  countColorPips,
  countLands,
  countZone,
  formatDeckLabel,
  getDeckTarget,
  groupDeckCards,
  pickDefaultPreview,
  toPreviewCard,
  totalCards
} from './deck-builder';
import { CreateDeckModal } from './components/CreateDeckModal';
import { ColorSymbols } from './components/ColorSymbols';
import { DeckDashboard } from './components/DeckDashboard';
import { DeckEditor } from './components/DeckEditor';
import { DeckViewer } from './components/DeckViewer';

type Screen = 'dashboard' | 'editor' | 'viewer';

export default function App() {
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [message, setMessage] = useState('');

  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<number | null>(null);
  const [activeDeck, setActiveDeck] = useState<DeckDetail | null>(null);

  const [loadingDecks, setLoadingDecks] = useState(false);
  const [loadingDeckAction, setLoadingDeckAction] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckFormat, setNewDeckFormat] = useState('commander');

  const [deckNameDraft, setDeckNameDraft] = useState('');
  const [editorMode, setEditorMode] = useState<DeckViewMode>('list');
  const [viewerMode, setViewerMode] = useState<DeckViewMode>('grid');
  const [selectedZone, setSelectedZone] = useState<DeckZone>('main');

  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [searchResults, setSearchResults] = useState<CardItem[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);

  const [previewCard, setPreviewCard] = useState<PreviewCard | null>(null);

  useEffect(() => {
    void loadDecks();
  }, []);

  useEffect(() => {
    if (screen !== 'editor') {
      return;
    }

    const term = deferredQuery.trim();
    if (term.length < 2) {
      setSearchResults([]);
      setSearchTotal(0);
      setLoadingSearch(false);
      return;
    }

    const timer = window.setTimeout(() => {
      void runSearch(term);
    }, 260);

    return () => window.clearTimeout(timer);
  }, [deferredQuery, screen]);

  useEffect(() => {
    setDeckNameDraft(activeDeck?.name || '');
    setPreviewCard((current) => {
      if (!activeDeck) {
        return null;
      }

      if (current && activeDeck.cards.some((card) => card.scryfallId === current.scryfallId && card.zone === (current.zone || card.zone))) {
        return current;
      }

      return pickDefaultPreview(activeDeck);
    });
  }, [activeDeck]);

  async function loadDecks() {
    setLoadingDecks(true);
    try {
      setDecks(await getDecks());
    } catch {
      setMessage('Nao foi possivel carregar os decks.');
    } finally {
      setLoadingDecks(false);
    }
  }

  async function loadDeck(id: number, nextScreen?: Screen) {
    setLoadingDeckAction(true);
    try {
      const deck = await getDeck(id);
      setActiveDeckId(deck.id);
      setActiveDeck(deck);
      setSelectedZone('main');
      if (nextScreen) {
        setScreen(nextScreen);
      }
      setMessage('');
    } catch {
      setMessage('Nao foi possivel abrir o deck selecionado.');
    } finally {
      setLoadingDeckAction(false);
    }
  }

  async function refreshActiveDeck(nextScreen?: Screen) {
    if (!activeDeckId) {
      return;
    }

    await loadDeck(activeDeckId, nextScreen);
    await loadDecks();
  }

  async function runSearch(term: string) {
    setLoadingSearch(true);
    try {
      const result = await searchCards(term, 1);
      setSearchResults(result.cards);
      setSearchTotal(result.totalCards);
      setPreviewCard((current) => current ?? (result.cards[0] ? toPreviewCard(result.cards[0]) : null));
    } catch {
      setMessage('Falha ao buscar cartas.');
    } finally {
      setLoadingSearch(false);
    }
  }

  async function handleCreateDeck() {
    const name = newDeckName.trim();
    if (!name) {
      setMessage('Informe um nome para o deck.');
      return;
    }

    setLoadingDeckAction(true);
    try {
      const deck = await createDeck({ name, format: newDeckFormat });
      setShowCreateModal(false);
      setNewDeckName('');
      setNewDeckFormat('commander');
      await loadDecks();
      await loadDeck(deck.id, 'editor');
      setMessage('');
    } catch {
      setMessage('Nao foi possivel criar o deck.');
    } finally {
      setLoadingDeckAction(false);
    }
  }

  async function handleDeleteDeck(deckId: number) {
    if (!window.confirm('Deseja excluir este deck?')) {
      return;
    }

    setLoadingDeckAction(true);
    try {
      await deleteDeck(deckId);
      if (activeDeckId === deckId) {
        setActiveDeckId(null);
        setActiveDeck(null);
        setPreviewCard(null);
        setScreen('dashboard');
      }
      await loadDecks();
      setMessage('Deck removido.');
    } catch {
      setMessage('Falha ao remover o deck.');
    } finally {
      setLoadingDeckAction(false);
    }
  }

  async function handleRenameDeck() {
    if (!activeDeckId || !activeDeck) {
      return;
    }

    const name = deckNameDraft.trim();
    if (!name) {
      setMessage('Informe um nome para o deck.');
      return;
    }

    setLoadingDeckAction(true);
    try {
      await updateDeckName(activeDeckId, { name });
      await refreshActiveDeck();
      setMessage('Nome do deck atualizado.');
    } catch {
      setMessage('Nao foi possivel salvar o nome do deck.');
    } finally {
      setLoadingDeckAction(false);
    }
  }

  async function handleAddCard(card: CardItem) {
    if (!activeDeckId || !activeDeck) {
      return;
    }

    setLoadingDeckAction(true);
    try {
      await addCardToDeck(activeDeckId, {
        scryfallId: card.scryfallId,
        qty: 1,
        zone: activeDeck.format === 'standard' ? selectedZone : 'main'
      });
      await refreshActiveDeck();
      setMessage('');
    } catch {
      setMessage('Nao foi possivel adicionar a carta.');
    } finally {
      setLoadingDeckAction(false);
    }
  }

  async function handleSetCommander(card: CardItem) {
    if (!activeDeckId || !activeDeck || activeDeck.format !== 'commander' || !canBeCommander(card)) {
      return;
    }

    setLoadingDeckAction(true);
    try {
      await addCardToDeck(activeDeckId, {
        scryfallId: card.scryfallId,
        qty: 1,
        zone: 'command'
      });
      await refreshActiveDeck();
      setMessage('');
    } catch {
      setMessage('Nao foi possivel definir o comandante.');
    } finally {
      setLoadingDeckAction(false);
    }
  }

  async function handleClearCommander() {
    if (!activeDeckId || !activeDeck?.commander) {
      return;
    }

    setLoadingDeckAction(true);
    try {
      await removeDeckCard(activeDeckId, activeDeck.commander.scryfallId, 'command');
      await refreshActiveDeck();
      setMessage('');
    } catch {
      setMessage('Nao foi possivel remover o comandante.');
    } finally {
      setLoadingDeckAction(false);
    }
  }

  async function handleChangeQty(card: DeckDetailCard, nextQty: number) {
    if (!activeDeckId) {
      return;
    }

    setLoadingDeckAction(true);
    try {
      await updateDeckCardQty(activeDeckId, card.scryfallId, { qty: nextQty, zone: card.zone });
      await refreshActiveDeck();
    } catch {
      setMessage('Nao foi possivel atualizar a quantidade.');
    } finally {
      setLoadingDeckAction(false);
    }
  }

  async function handleRemoveCard(card: DeckDetailCard) {
    if (!activeDeckId) {
      return;
    }

    setLoadingDeckAction(true);
    try {
      await removeDeckCard(activeDeckId, card.scryfallId, card.zone);
      await refreshActiveDeck();
    } catch {
      setMessage('Nao foi possivel remover a carta.');
    } finally {
      setLoadingDeckAction(false);
    }
  }

  const activeCards = activeDeck?.cards.filter((card) => card.zone !== 'command') || [];
  const groupedCards = activeDeck ? groupDeckCards(activeCards) : [];
  const commanderCard = activeDeck?.commander || activeDeck?.cards.find((card) => card.zone === 'command') || null;
  const currentStats = activeDeck?.stats;
  const deckCount = currentStats?.totalCards ?? totalCards(activeCards);
  const deckTarget = currentStats?.targetCards ?? (activeDeck ? getDeckTarget(activeDeck.format) : null);
  const metrics: DeckMetrics = {
    deckCount,
    mainCount: currentStats?.zoneDistribution.main ?? countZone(activeCards, 'main'),
    sideCount: currentStats?.zoneDistribution.sideboard ?? countZone(activeCards, 'sideboard'),
    commandCount: currentStats?.zoneDistribution.command ?? countZone(activeCards, 'command'),
    avgCmc: currentStats?.averageCmc ?? averageCmc(activeCards),
    lands: currentStats?.landCount ?? countLands(activeCards),
    deckCurve: currentStats
      ? [0, 1, 2, 3, 4, 5, 6, 7].map((value) => ({
          label: value === 7 ? '7+' : String(value),
          count: currentStats.manaCurve[value] ?? 0
        }))
      : buildCurve(activeCards),
    deckColors: currentStats?.colorIdentity ?? colorIdentity(activeCards),
    colorPips: currentStats?.colorPips ?? countColorPips(activeCards),
    deckTarget,
    estimatedPrice: currentStats?.estimatedPriceUsd ?? 0,
    progress: deckTarget ? Math.min(100, (deckCount / deckTarget) * 100) : 0
  };

  const isWorkspaceScreen = screen === 'editor';

  return (
    <>
      <header className="topbar">
        <div className="topbar__inner">
          <button className="brand" type="button" onClick={() => setScreen('dashboard')}>
            <ColorSymbols className="brand-pips" colors={['W', 'U', 'B', 'R', 'G']} size="sm" />
            <span className="brand-title">Mesão do Dujour</span>
            <span className="brand-subtitle">Construtor de Decks</span>
          </button>

          <div className="topbar-actions">
            {screen === 'editor' ? (
              <>
                <button className="secondary-button" onClick={() => setScreen('dashboard')}>← Decks</button>
                <button onClick={() => setScreen('viewer')} disabled={!activeDeck}>Visualizar</button>
              </>
            ) : null}
            {screen === 'viewer' ? (
              <>
                <button className="secondary-button" onClick={() => setScreen('dashboard')}>← Decks</button>
                <button onClick={() => setScreen('editor')} disabled={!activeDeck}>Editar deck</button>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <main className={`app-shell${isWorkspaceScreen ? ' app-shell--workspace' : ''}`}>
        {screen === 'dashboard' ? (
          <DeckDashboard
            decks={decks}
            loadingDecks={loadingDecks}
            onOpenCreate={() => setShowCreateModal(true)}
            onOpenEditor={(deckId) => void loadDeck(deckId, 'editor')}
            onOpenViewer={(deckId) => void loadDeck(deckId, 'viewer')}
            onDeleteDeck={(deckId) => void handleDeleteDeck(deckId)}
          />
        ) : null}

        {screen === 'editor' ? (
          <DeckEditor
            activeDeck={activeDeck}
            groupedCards={groupedCards}
            activeCards={activeCards}
            commanderCard={commanderCard}
            deckNameDraft={deckNameDraft}
            editorMode={editorMode}
            loadingSearch={loadingSearch}
            loadingDeckAction={loadingDeckAction}
            selectedZone={selectedZone}
            query={query}
            searchTotal={searchTotal}
            searchResults={searchResults}
            previewCard={previewCard}
            metrics={metrics}
            onChangeQuery={setQuery}
            onChangeDeckNameDraft={setDeckNameDraft}
            onSaveDeckName={() => void handleRenameDeck()}
            onSetEditorMode={setEditorMode}
            onSetZone={setSelectedZone}
            onHoverCard={setPreviewCard}
            onAddCard={(card) => void handleAddCard(card)}
            onSetCommander={(card) => void handleSetCommander(card)}
            onClearCommander={() => void handleClearCommander()}
            onChangeQty={(card, nextQty) => void handleChangeQty(card, nextQty)}
            onRemoveCard={(card) => void handleRemoveCard(card)}
          />
        ) : null}

        {screen === 'viewer' ? (
          <DeckViewer
            activeDeck={activeDeck}
            activeCards={activeCards}
            commanderCard={commanderCard}
            groupedCards={groupedCards}
            viewerMode={viewerMode}
            previewCard={previewCard}
            metrics={metrics}
            onSetViewerMode={setViewerMode}
            onHoverCard={setPreviewCard}
          />
        ) : null}

        {showCreateModal ? (
          <CreateDeckModal
            loading={loadingDeckAction}
            newDeckName={newDeckName}
            newDeckFormat={newDeckFormat}
            onClose={() => setShowCreateModal(false)}
            onChangeName={setNewDeckName}
            onChangeFormat={setNewDeckFormat}
            onCreate={() => void handleCreateDeck()}
          />
        ) : null}

        {message ? <div className="message-banner">{message}</div> : null}
      </main>
    </>
  );
}
