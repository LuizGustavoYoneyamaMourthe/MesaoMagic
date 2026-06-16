import { Request, Response, Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializeCardRecord } from '../lib/deck-metadata.js';
import { stringifyJson } from '../lib/storage.js';
import {
  fetchCardByScryfallIdFromAPI,
  normalizeCardPayload,
  searchCardsFromScryfall
} from '../services/scryfall.js';

const router = Router();

function serializeStoredCard(card: {
  scryfallId: string;
  name: string;
  manaCost: string | null;
  cmc: number | null;
  typeLine: string | null;
  colors: string | null;
  colorIdentity: string | null;
  rarity: string | null;
  setCode: string | null;
  imageUris: string | null;
  artCrop: string | null;
  priceUsd: number | null;
}) {
  return serializeCardRecord(card);
}

router.get('/search', async (req: Request, res: Response) => {
  const query = String(req.query.q || '').trim();
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 24);

  if (!query) {
    return res.status(400).json({ error: 'query is required' });
  }

  try {
    const payload = await searchCardsFromScryfall(query, page, pageSize);
    const limitedCards = payload.data.slice(0, pageSize);

    const upsertOps = limitedCards.map((card) => {
      const normalized = normalizeCardPayload(card);
      return prisma.card.upsert({
        where: { scryfallId: normalized.scryfallId },
        update: {
          name: normalized.name,
          manaCost: normalized.manaCost,
          cmc: normalized.cmc,
          typeLine: normalized.typeLine,
          oracleText: normalized.oracleText,
          colors: stringifyJson(normalized.colors),
          colorIdentity: stringifyJson(normalized.colorIdentity),
          rarity: normalized.rarity,
          setCode: normalized.setCode,
          imageUris: stringifyJson(normalized.imageUris),
          artCrop: normalized.artCrop,
          priceUsd: normalized.priceUsd,
          legalities: stringifyJson(normalized.legalities),
          lastFetchedAt: new Date()
        },
        create: {
          scryfallId: normalized.scryfallId,
          name: normalized.name,
          manaCost: normalized.manaCost,
          cmc: normalized.cmc,
          typeLine: normalized.typeLine,
          oracleText: normalized.oracleText,
          colors: stringifyJson(normalized.colors),
          colorIdentity: stringifyJson(normalized.colorIdentity),
          rarity: normalized.rarity,
          setCode: normalized.setCode,
          imageUris: stringifyJson(normalized.imageUris),
          artCrop: normalized.artCrop,
          priceUsd: normalized.priceUsd,
          legalities: stringifyJson(normalized.legalities),
          lastFetchedAt: new Date()
        }
      });
    });

    await Promise.allSettled(upsertOps);

    return res.json({
      query,
      page,
      hasMore: payload.has_more || payload.data.length > pageSize,
      totalCards: payload.total_cards ?? 0,
      cards: limitedCards.map((card) => {
        const normalized = normalizeCardPayload(card);
        return {
          scryfallId: normalized.scryfallId,
          name: normalized.name,
          manaCost: normalized.manaCost,
          cmc: normalized.cmc,
          typeLine: normalized.typeLine,
          colors: normalized.colors,
          colorIdentity: normalized.colorIdentity,
          rarity: normalized.rarity,
          setCode: normalized.setCode,
          artCrop: normalized.artCrop,
          priceUsd: normalized.priceUsd,
          imageUris: normalized.imageUris
        };
      })
    });
  } catch (error) {
    return res.status(502).json({ error: 'Falha ao consultar Scryfall', message: String(error) });
  }
});

router.get('/scryfall/:scryfallId', async (req: Request, res: Response) => {
  const scryfallId = String(req.params.scryfallId || '').trim();
  if (!scryfallId) {
    return res.status(400).json({ error: 'scryfallId is required' });
  }

  const cached = await prisma.card.findUnique({
    where: { scryfallId }
  });

  if (cached) {
    return res.json(serializeStoredCard(cached));
  }

  try {
    const payload = await fetchCardByScryfallIdFromAPI(scryfallId);
    const normalized = normalizeCardPayload(payload);

    const card = await prisma.card.create({
      data: {
        scryfallId: normalized.scryfallId,
        name: normalized.name,
        manaCost: normalized.manaCost,
        cmc: normalized.cmc,
        typeLine: normalized.typeLine,
        oracleText: normalized.oracleText,
        colors: stringifyJson(normalized.colors),
        colorIdentity: stringifyJson(normalized.colorIdentity),
        rarity: normalized.rarity,
        setCode: normalized.setCode,
        imageUris: stringifyJson(normalized.imageUris),
        artCrop: normalized.artCrop,
        priceUsd: normalized.priceUsd,
        legalities: stringifyJson(normalized.legalities)
      }
    });

    return res.status(201).json(serializeStoredCard(card));
  } catch (error) {
    return res.status(502).json({ error: 'Falha ao buscar carta no Scryfall', message: String(error) });
  }
});

export default router;
