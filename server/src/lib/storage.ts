export const DECK_FORMATS = ['commander', 'standard', 'generic', 'pioneer', 'modern', 'legacy', 'premodern', 'vintage', 'custom'] as const;
export const DECK_ZONES = ['main', 'sideboard', 'command'] as const;

export type DeckFormatValue = (typeof DECK_FORMATS)[number];
export type DeckZoneValue = (typeof DECK_ZONES)[number];

const deckFormats = new Set<string>(DECK_FORMATS);
const deckZones = new Set<string>(DECK_ZONES);

export function toDeckFormat(value: string): DeckFormatValue {
  return deckFormats.has(value) ? (value as DeckFormatValue) : 'commander';
}

export function toDeckZone(value: string): DeckZoneValue {
  return deckZones.has(value) ? (value as DeckZoneValue) : 'main';
}

export function stringifyJson(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  return JSON.stringify(value);
}

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
