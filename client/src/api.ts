export type ColorSymbol = 'W' | 'U' | 'B' | 'R' | 'G' | 'C';
export type DeckZone = 'main' | 'sideboard' | 'command';

const API_BASE = '/api';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
};

async function requestJson<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.error) {
        message = `${message} - ${payload.error}`;
      }
    } catch {
      // no-op
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export interface CardImageUris {
  small?: string;
  normal?: string;
  large?: string;
  art_crop?: string;
  png?: string;
}

export interface CardItem {
  scryfallId: string;
  name: string;
  manaCost?: string;
  cmc?: number;
  typeLine?: string;
  colors: ColorSymbol[];
  colorIdentity: ColorSymbol[];
  rarity?: string;
  setCode?: string;
  artCrop?: string;
  priceUsd?: number;
  imageUris?: CardImageUris | null;
}

export interface SearchResponse {
  cards: CardItem[];
  hasMore: boolean;
  totalCards: number;
  page: number;
}

export interface DeckSummary {
  id: number;
  name: string;
  description?: string | null;
  format: string;
  isShared: boolean;
  totalCards: number;
  targetCards?: number | null;
  estimatedPriceUsd?: number;
  colorIdentity: string[];
  commanderName?: string | null;
  coverImage?: string | null;
  updatedAt: string;
}

export interface DeckDetailCard {
  scryfallId: string;
  name: string;
  qty: number;
  zone: DeckZone;
  manaCost?: string;
  cmc?: number;
  typeLine?: string;
  colors?: ColorSymbol[];
  colorIdentity?: ColorSymbol[];
  rarity?: string;
  setCode?: string;
  artCrop?: string;
  priceUsd?: number;
  imageUris?: CardImageUris | null;
}

export interface DeckDetail {
  id: number;
  name: string;
  description?: string | null;
  format: string;
  isShared: boolean;
  shareToken?: string | null;
  createdAt: string;
  updatedAt: string;
  coverImage?: string | null;
  commander?: DeckDetailCard | null;
  cards: DeckDetailCard[];
  stats: DeckStats;
}

export interface DeckStats {
  deckId: number;
  totalCards: number;
  targetCards?: number | null;
  colorIdentity: string[];
  zoneDistribution: {
    main: number;
    sideboard: number;
    command: number;
  };
  manaCurve: Record<number, number>;
  landCount: number;
  estimatedPriceUsd: number;
  averageCmc: number;
  colorPips: Record<'W' | 'U' | 'B' | 'R' | 'G', number>;
}

export interface SharedComment {
  id: number;
  authorName: string;
  message: string;
  createdAt: string;
}

export interface SharedDeck {
  deckId: number;
  shareToken: string;
  name: string;
  description?: string | null;
  format: string;
  cards: DeckDetailCard[];
  comments: SharedComment[];
  stats: Omit<DeckStats, 'deckId'>;
}

export interface ShareLinkResponse {
  deckId: number;
  shareToken: string;
  publicPath: string;
}

export async function searchCards(query: string, page = 1) {
  return requestJson<SearchResponse>(`/cards/search?q=${encodeURIComponent(query)}&page=${page}&pageSize=18`);
}

export async function getDecks() {
  return requestJson<DeckSummary[]>('/decks');
}

export async function getDeck(id: number) {
  return requestJson<DeckDetail>(`/decks/${id}`);
}

export async function getDeckStats(id: number) {
  return requestJson<DeckStats>(`/decks/${id}/stats`);
}

export async function createDeck(payload: { name: string; description?: string; format?: string }) {
  return requestJson<{ id: number; name: string; description?: string | null; format: string }>('/decks', {
    method: 'POST',
    body: payload
  });
}

export async function updateDeckName(id: number, payload: { name?: string; description?: string; format?: string }) {
  return requestJson<unknown>(`/decks/${id}`, {
    method: 'PUT',
    body: payload
  });
}

export async function deleteDeck(id: number) {
  return requestJson<null>(`/decks/${id}`, { method: 'DELETE' });
}

export async function createShareLink(id: number) {
  return requestJson<ShareLinkResponse>(`/decks/${id}/share`, {
    method: 'POST'
  });
}

export async function disableShareLink(id: number) {
  return requestJson<null>(`/decks/${id}/share`, {
    method: 'DELETE'
  });
}

export async function addCardToDeck(id: number, payload: { scryfallId: string; qty: number; zone?: DeckZone }) {
  return requestJson(`/decks/${id}/cards`, {
    method: 'POST',
    body: {
      scryfallId: payload.scryfallId,
      qty: payload.qty,
      zone: payload.zone || 'main'
    }
  });
}

export async function updateDeckCardQty(id: number, scryfallId: string, payload: { qty: number; zone?: DeckZone }) {
  return requestJson<unknown>(`/decks/${id}/cards/${scryfallId}`, {
    method: 'PATCH',
    body: payload
  });
}

export async function removeDeckCard(id: number, scryfallId: string, zone: DeckZone) {
  return requestJson<null>(`/decks/${id}/cards/${scryfallId}?zone=${zone}`, { method: 'DELETE' });
}

export async function getSharedDeck(shareToken: string) {
  return requestJson<SharedDeck>(`/shared/${shareToken}`);
}

export async function postSharedComment(shareToken: string, payload: { authorName: string; message: string }) {
  return requestJson<SharedComment>(`/shared/${shareToken}/comments`, {
    method: 'POST',
    body: payload
  });
}
