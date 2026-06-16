import { parseJson, type DeckZoneValue, toDeckZone } from './storage.js';

type SerializableCardRecord = {
  scryfallId: string;
  name: string;
  manaCost: string | null;
  cmc: number | null;
  typeLine: string | null;
  colors: unknown;
  colorIdentity: unknown;
  imageUris: unknown;
  rarity?: string | null;
  setCode?: string | null;
  artCrop?: string | null;
  priceUsd?: number | null;
};

type DeckCardRecord = {
  zone: string;
  qty: number;
  card: SerializableCardRecord;
};

const COLOR_KEYS = ['W', 'U', 'B', 'R', 'G'] as const;

function extractArtCropFromImageUris(raw: unknown) {
  const imageUris = parseJson<Record<string, unknown> | null>(raw as string | null, null);
  const artCrop = imageUris?.art_crop;
  return typeof artCrop === 'string' && artCrop ? artCrop : null;
}

export function serializeCardRecord(card: SerializableCardRecord) {
  return {
    scryfallId: card.scryfallId,
    name: card.name,
    manaCost: card.manaCost,
    cmc: card.cmc,
    typeLine: card.typeLine,
    colors: parseJson<string[]>(card.colors as string | null, []),
    colorIdentity: parseJson<string[]>(card.colorIdentity as string | null, []),
    rarity: card.rarity ?? undefined,
    setCode: card.setCode ?? undefined,
    artCrop: card.artCrop ?? undefined,
    priceUsd: card.priceUsd ?? undefined,
    imageUris: parseJson<Record<string, unknown> | null>(card.imageUris as string | null, null)
  };
}

export function serializeDeckCard(deckCard: DeckCardRecord) {
  return {
    zone: toDeckZone(deckCard.zone),
    qty: deckCard.qty,
    ...serializeCardRecord(deckCard.card)
  };
}

function isLand(typeLine: string | null | undefined) {
  return /land/i.test(typeLine || '');
}

function countManaPips(manaCost: string | null | undefined) {
  const counts: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0 };
  const tokens = manaCost?.match(/\{[^}]+\}/g) ?? [];

  tokens.forEach((token) => {
    const symbol = token.slice(1, -1).toUpperCase();
    COLOR_KEYS.forEach((color) => {
      if (symbol.includes(color)) {
        counts[color] += 1;
      }
    });
  });

  return counts;
}

function getDeckTarget(format: string) {
  if (format === 'commander') return 100;
  if (format === 'standard') return 60;
  return null;
}

export function buildDeckStats(deckCards: DeckCardRecord[], format: string) {
  const colorSet = new Set<string>();
  const zoneDistribution: Record<DeckZoneValue, number> = {
    main: 0,
    sideboard: 0,
    command: 0
  };
  const manaCurve: Record<number, number> = {};
  const colorPips = { W: 0, U: 0, B: 0, R: 0, G: 0 };
  let totalCards = 0;
  let landCount = 0;
  let estimatedPriceUsd = 0;
  let averageCmcPool = 0;
  let nonLandCount = 0;

  deckCards.forEach((entry) => {
    totalCards += entry.qty;
    zoneDistribution[toDeckZone(entry.zone)] += entry.qty;

    const colors = parseJson<string[]>(entry.card.colorIdentity as string | null, []);
    colors.forEach((color) => {
      if (typeof color === 'string' && color) {
        colorSet.add(color);
      }
    });

    const bucket = Math.min(7, Math.max(0, Math.floor(entry.card.cmc ?? 0)));
    manaCurve[bucket] = (manaCurve[bucket] ?? 0) + entry.qty;

    if (isLand(entry.card.typeLine)) {
      landCount += entry.qty;
    } else {
      averageCmcPool += (entry.card.cmc ?? 0) * entry.qty;
      nonLandCount += entry.qty;
    }

    estimatedPriceUsd += (entry.card.priceUsd ?? 0) * entry.qty;

    const pipCounts = countManaPips(entry.card.manaCost);
    COLOR_KEYS.forEach((color) => {
      colorPips[color] += pipCounts[color] * entry.qty;
    });
  });

  return {
    totalCards,
    targetCards: getDeckTarget(format),
    colorIdentity: Array.from(colorSet),
    zoneDistribution,
    manaCurve,
    landCount,
    estimatedPriceUsd: Number(estimatedPriceUsd.toFixed(2)),
    averageCmc: nonLandCount ? Number((averageCmcPool / nonLandCount).toFixed(2)) : 0,
    colorPips
  };
}

export function buildDeckSummaryMeta(deckCards: DeckCardRecord[], format: string) {
  const stats = buildDeckStats(deckCards, format);
  const commander = deckCards.find((entry) => toDeckZone(entry.zone) === 'command');
  const coverSource =
    commander?.card ??
    deckCards.find((entry) => !!entry.card.artCrop || !!extractArtCropFromImageUris(entry.card.imageUris))?.card ??
    deckCards[0]?.card;

  return {
    ...stats,
    commanderName: commander?.card.name ?? null,
    coverImage: coverSource ? coverSource.artCrop || extractArtCropFromImageUris(coverSource.imageUris) : null
  };
}
