import type { CardItem, DeckDetail, DeckDetailCard, DeckZone } from './api';

export type DeckViewMode = 'list' | 'grid';

export type PreviewCard = {
  scryfallId: string;
  name: string;
  manaCost?: string;
  cmc?: number;
  typeLine?: string;
  colors?: string[];
  colorIdentity?: string[];
  rarity?: string;
  setCode?: string;
  artCrop?: string | null;
  priceUsd?: number;
  imageUris?: { normal?: string; small?: string; png?: string; art_crop?: string } | null;
  zone?: DeckZone;
  qty?: number;
};

export type DeckGroup = {
  key: string;
  label: string;
  totalCards: number;
  cards: DeckDetailCard[];
};

export type DeckMetrics = {
  deckCount: number;
  mainCount: number;
  sideCount: number;
  commandCount: number;
  avgCmc: number;
  lands: number;
  deckCurve: Array<{ label: string; count: number }>;
  deckColors: string[];
  colorPips: Record<'W' | 'U' | 'B' | 'R' | 'G', number>;
  deckTarget: number | null;
  estimatedPrice: number;
  progress: number;
};

const GROUP_ORDER = ['Commander', 'Creatures', 'Planeswalkers', 'Artifacts', 'Enchantments', 'Instants', 'Sorceries', 'Lands', 'Other'];

const FORMAT_LABELS: Record<string, string> = {
  commander: 'Commander',
  standard: 'Standard',
  generic: 'Generico'
};

export function getCardImage(card: { imageUris?: { normal?: string; small?: string; png?: string } | null }) {
  return card.imageUris?.normal || card.imageUris?.small || card.imageUris?.png || '';
}

export function getDeckGroupKey(card: DeckDetailCard) {
  if (card.zone === 'command') {
    return 'Commander';
  }

  const typeLine = card.typeLine || '';
  if (typeLine.includes('Creature')) return 'Creatures';
  if (typeLine.includes('Planeswalker')) return 'Planeswalkers';
  if (typeLine.includes('Artifact')) return 'Artifacts';
  if (typeLine.includes('Enchantment')) return 'Enchantments';
  if (typeLine.includes('Instant')) return 'Instants';
  if (typeLine.includes('Sorcery')) return 'Sorceries';
  if (typeLine.includes('Land')) return 'Lands';
  return 'Other';
}

export function groupDeckCards(cards: DeckDetailCard[]): DeckGroup[] {
  const groups = new Map<string, DeckDetailCard[]>();

  cards.forEach((card) => {
    const key = getDeckGroupKey(card);
    const existing = groups.get(key) || [];
    existing.push(card);
    groups.set(key, existing);
  });

  return GROUP_ORDER.map((key) => {
    const groupCards = groups.get(key) || [];
    return {
      key,
      label: key,
      totalCards: groupCards.reduce((acc, card) => acc + card.qty, 0),
      cards: groupCards.sort((a, b) => a.name.localeCompare(b.name))
    };
  }).filter((group) => group.cards.length > 0);
}

export function formatDeckLabel(format: string) {
  return FORMAT_LABELS[format] || format;
}

export function formatUsd(value?: number | null) {
  if (value == null || Number.isNaN(value) || value <= 0) {
    return '—';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

export function getDeckTarget(format: string) {
  if (format === 'commander') return 100;
  if (format === 'standard') return 60;
  return null;
}

export function totalCards(cards: Array<{ qty: number }>) {
  return cards.reduce((acc, item) => acc + item.qty, 0);
}

export function countLands(cards: DeckDetailCard[]) {
  return cards.reduce((acc, card) => acc + (/Land/i.test(card.typeLine || '') ? card.qty : 0), 0);
}

export function averageCmc(cards: DeckDetailCard[]) {
  let total = 0;
  let count = 0;

  cards.forEach((card) => {
    if (/Land/i.test(card.typeLine || '')) {
      return;
    }

    total += (card.cmc || 0) * card.qty;
    count += card.qty;
  });

  return count ? total / count : 0;
}

export function countZone(cards: DeckDetailCard[], zone: DeckZone) {
  return cards.reduce((acc, card) => acc + (card.zone === zone ? card.qty : 0), 0);
}

export function buildCurve(cards: DeckDetailCard[]) {
  const buckets = [0, 1, 2, 3, 4, 5, 6, 7].map((value) => ({
    label: value === 7 ? '7+' : String(value),
    count: 0
  }));

  cards.forEach((card) => {
    if (/Land/i.test(card.typeLine || '')) {
      return;
    }

    const cmc = Math.min(7, Math.floor(card.cmc || 0));
    buckets[cmc].count += card.qty;
  });

  return buckets;
}

export function colorIdentity(cards: DeckDetailCard[]) {
  const colors = new Set<string>();
  cards.forEach((card) => {
    (card.colorIdentity || []).forEach((color) => colors.add(color));
  });
  return Array.from(colors);
}

export function countColorPips(cards: DeckDetailCard[]) {
  const result: Record<'W' | 'U' | 'B' | 'R' | 'G', number> = {
    W: 0,
    U: 0,
    B: 0,
    R: 0,
    G: 0
  };

  cards.forEach((card) => {
    const tokens = card.manaCost?.match(/\{[^}]+\}/g) ?? [];
    tokens.forEach((token) => {
      const symbol = token.slice(1, -1).toUpperCase();
      (['W', 'U', 'B', 'R', 'G'] as const).forEach((color) => {
        if (symbol.includes(color)) {
          result[color] += card.qty;
        }
      });
    });
  });

  return result;
}

export function canBeCommander(card: CardItem | DeckDetailCard) {
  const typeLine = card.typeLine || '';
  return /legendary/i.test(typeLine) && /(creature|planeswalker)/i.test(typeLine);
}

export function toPreviewCard(card: CardItem | DeckDetailCard): PreviewCard {
  return {
    scryfallId: card.scryfallId,
    name: card.name,
    manaCost: card.manaCost,
    cmc: card.cmc,
    typeLine: card.typeLine,
    colors: card.colors,
    colorIdentity: card.colorIdentity,
    rarity: 'rarity' in card ? card.rarity : undefined,
    setCode: 'setCode' in card ? card.setCode : undefined,
    artCrop: 'artCrop' in card ? card.artCrop : undefined,
    priceUsd: 'priceUsd' in card ? card.priceUsd : undefined,
    imageUris: card.imageUris || null,
    zone: 'zone' in card ? card.zone : undefined,
    qty: 'qty' in card ? card.qty : undefined
  };
}

export function pickDefaultPreview(deck: DeckDetail | null) {
  if (!deck) {
    return null;
  }

  const commander = deck.cards.find((card) => card.zone === 'command');
  if (commander) {
    return toPreviewCard(commander);
  }

  return deck.cards[0] ? toPreviewCard(deck.cards[0]) : null;
}
