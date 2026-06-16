const SCRYFALL_API = 'https://api.scryfall.com';
const SCRYFALL_USER_AGENT = 'MesaoMagicDeckBuilder/0.1 (local development)';

type JsonData = Record<string, unknown> | unknown[] | string | number | boolean | null;

export interface ScryfallSearchResultCard {
  id: string;
  name: string;
  mana_cost?: string;
  cmc?: number;
  type_line?: string;
  oracle_text?: string;
  colors?: string[];
  color_identity?: string[];
  rarity?: string;
  set?: string;
  image_uris?: {
    small?: string;
    normal?: string;
    large?: string;
    png?: string;
    art_crop?: string;
  };
  card_faces?: Array<{
    mana_cost?: string;
    colors?: string[];
    image_uris?: ScryfallSearchResultCard['image_uris'];
  }>;
  prices?: {
    usd?: string | null;
    usd_foil?: string | null;
  };
  legalities?: JsonData;
}

export interface ScryfallSearchResponse {
  data: ScryfallSearchResultCard[];
  has_more: boolean;
  total_cards?: number;
}

export interface NormalizedCard {
  scryfallId: string;
  name: string;
  manaCost?: string;
  cmc?: number;
  typeLine?: string;
  oracleText?: string;
  colors: string[];
  colorIdentity: string[];
  rarity?: string;
  setCode?: string;
  imageUris?: JsonData;
  artCrop?: string | null;
  priceUsd?: number | null;
  legalities?: JsonData;
  lastFetchedAt?: string;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractImageUris(card: ScryfallSearchResultCard): JsonData {
  if (card.image_uris) {
    return card.image_uris;
  }

  if (card.card_faces && card.card_faces[0]?.image_uris) {
    return card.card_faces[0].image_uris as JsonData;
  }

  return null;
}

function extractArtCrop(card: ScryfallSearchResultCard) {
  if (card.image_uris?.art_crop) {
    return card.image_uris.art_crop;
  }

  if (card.card_faces?.[0]?.image_uris?.art_crop) {
    return card.card_faces[0].image_uris.art_crop;
  }

  return null;
}

function extractManaCost(card: ScryfallSearchResultCard) {
  if (card.mana_cost) {
    return card.mana_cost;
  }

  const faces = card.card_faces?.map((face) => face.mana_cost).filter(Boolean) ?? [];
  return faces.length ? faces.join(' // ') : undefined;
}

function extractColors(card: ScryfallSearchResultCard) {
  if (card.colors) {
    return card.colors;
  }

  const faceColors = card.card_faces?.flatMap((face) => face.colors ?? []) ?? [];
  return faceColors.length ? Array.from(new Set(faceColors)) : [];
}

function extractPriceUsd(card: ScryfallSearchResultCard) {
  const raw = card.prices?.usd ?? card.prices?.usd_foil ?? null;
  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeCard(card: ScryfallSearchResultCard): NormalizedCard {
  return {
    scryfallId: card.id,
    name: card.name,
    manaCost: extractManaCost(card),
    cmc: card.cmc,
    typeLine: card.type_line,
    oracleText: card.oracle_text,
    colors: extractColors(card),
    colorIdentity: card.color_identity ?? [],
    rarity: card.rarity,
    setCode: card.set,
    imageUris: extractImageUris(card),
    artCrop: extractArtCrop(card),
    priceUsd: extractPriceUsd(card),
    legalities: card.legalities ?? {},
    lastFetchedAt: new Date().toISOString()
  };
}

async function requestJson<T>(url: string): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': SCRYFALL_USER_AGENT
        }
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Scryfall retornou ${response.status}: ${text}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        await sleep(350 * (attempt + 1));
      }
    }
  }

  throw lastError;
}

export async function searchCardsFromScryfall(
  query: string,
  page = 1,
  _pageSize = 24
): Promise<ScryfallSearchResponse> {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    order: 'edhrec',
    dir: 'desc',
    unique: 'cards'
  });

  return requestJson<ScryfallSearchResponse>(`${SCRYFALL_API}/cards/search?${params.toString()}`);
}

export async function fetchCardByScryfallIdFromAPI(scryfallId: string): Promise<ScryfallSearchResultCard> {
  return requestJson<ScryfallSearchResultCard>(`${SCRYFALL_API}/cards/${encodeURIComponent(scryfallId)}`);
}

export function normalizeCardPayload(card: ScryfallSearchResultCard): NormalizedCard {
  return normalizeCard(card);
}
