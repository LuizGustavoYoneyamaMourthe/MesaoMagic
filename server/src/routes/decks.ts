import { randomBytes } from 'node:crypto';
import { Request, Response, Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { buildDeckStats, buildDeckSummaryMeta, serializeDeckCard } from '../lib/deck-metadata.js';
import { parseJson, stringifyJson, type DeckZoneValue, toDeckFormat, toDeckZone } from '../lib/storage.js';
import { fetchCardByScryfallIdFromAPI, normalizeCardPayload } from '../services/scryfall.js';

const router = Router();

type DeckWithCards = {
  id: number;
  name: string;
  description: string | null;
  format: string;
  isShared: boolean;
  shareToken: string | null;
  updatedAt: Date;
  createdAt: Date;
  deckCards: Array<{
    zone: string;
    qty: number;
    card: {
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
    };
  }>;
};

function serializeDeck(deck: DeckWithCards) {
  const cards = deck.deckCards.map(serializeDeckCard);
  const stats = buildDeckStats(deck.deckCards, deck.format);
  const commander = cards.find((card) => card.zone === 'command') ?? null;
  const coverImage = commander?.artCrop || cards.find((card) => card.artCrop)?.artCrop || null;

  return {
    id: deck.id,
    name: deck.name,
    description: deck.description,
    format: deck.format,
    isShared: deck.isShared,
    shareToken: deck.shareToken,
    updatedAt: deck.updatedAt,
    createdAt: deck.createdAt,
    coverImage,
    commander,
    cards,
    stats
  };
}

router.get('/', async (_req: Request, res: Response) => {
  const decks = await prisma.deck.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      deckCards: {
        include: {
          card: true
        }
      }
    }
  });

  return res.json(
    decks.map((deck) => {
      const summary = buildDeckSummaryMeta(deck.deckCards, deck.format);
      return {
        id: deck.id,
        name: deck.name,
        description: deck.description,
        format: deck.format,
        isShared: deck.isShared,
        totalCards: summary.totalCards,
        targetCards: summary.targetCards,
        estimatedPriceUsd: summary.estimatedPriceUsd,
        colorIdentity: summary.colorIdentity,
        commanderName: summary.commanderName,
        coverImage: summary.coverImage,
        updatedAt: deck.updatedAt
      };
    })
  );
});

router.get('/:id/stats', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const deck = await prisma.deck.findUnique({
    where: { id },
    include: {
      deckCards: {
        include: { card: true }
      }
    }
  });

  if (!deck) {
    return res.status(404).json({ error: 'Deck não encontrado' });
  }

  return res.json({
    deckId: deck.id,
    ...buildDeckStats(deck.deckCards, deck.format)
  });
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const deck = await prisma.deck.findUnique({
    where: { id },
    include: {
      deckCards: {
        include: { card: true },
        orderBy: { id: 'desc' }
      }
    }
  });

  if (!deck) {
    return res.status(404).json({ error: 'Deck não encontrado' });
  }

  return res.json(serializeDeck(deck));
});

router.post('/', async (req: Request, res: Response) => {
  const { name, description = null, format = 'commander' } = req.body ?? {};

  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'name is required' });
  }

  const deck = await prisma.deck.create({
    data: {
      name: String(name).trim(),
      description: description ? String(description) : null,
      format: toDeckFormat(String(format))
    }
  });

  return res.status(201).json({
    id: deck.id,
    name: deck.name,
    format: deck.format,
    description: deck.description
  });
});

router.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name, description, format } = req.body ?? {};

  const deck = await prisma.deck.update({
    where: { id },
    data: {
      ...(name ? { name: String(name).trim() } : {}),
      ...(description !== undefined ? { description: description ? String(description) : null } : {}),
      ...(format ? { format: toDeckFormat(String(format)) } : {})
    }
  });

  return res.json(deck);
});

router.post('/:id/share', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const existingDeck = await prisma.deck.findUnique({ where: { id } });

  if (!existingDeck) {
    return res.status(404).json({ error: 'Deck não encontrado' });
  }

  const shareToken = existingDeck.shareToken ?? randomBytes(12).toString('hex');
  const deck = await prisma.deck.update({
    where: { id },
    data: {
      isShared: true,
      shareToken
    }
  });

  return res.json({
    deckId: deck.id,
    shareToken,
    publicPath: `/share/${shareToken}`
  });
});

router.delete('/:id/share', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await prisma.deck.update({
    where: { id },
    data: {
      isShared: false
    }
  });

  return res.sendStatus(204);
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await prisma.deck.delete({ where: { id } });
  return res.sendStatus(204);
});

router.post('/:id/cards', async (req: Request, res: Response) => {
  const deckId = Number(req.params.id);
  const scryfallId = String(req.body?.scryfallId || '').trim();
  const qty = Number(req.body?.qty || 1);
  const zone = toDeckZone(String(req.body?.zone || 'main'));

  if (!scryfallId) {
    return res.status(400).json({ error: 'scryfallId is required' });
  }

  if (!qty || qty < 1) {
    return res.status(400).json({ error: 'qty must be >= 1' });
  }

  const deck = await prisma.deck.findUnique({ where: { id: deckId } });
  if (!deck) {
    return res.status(404).json({ error: 'Deck não encontrado' });
  }

  let card = await prisma.card.findUnique({ where: { scryfallId } });
  if (!card) {
    try {
      const apiCard = await fetchCardByScryfallIdFromAPI(scryfallId);
      const normalized = normalizeCardPayload(apiCard);
      card = await prisma.card.create({
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
          legalities: stringifyJson(normalized.legalities),
          lastFetchedAt: new Date()
        }
      });
    } catch (error) {
      return res.status(502).json({ error: 'Falha ao carregar carta da Scryfall', message: String(error) });
    }
  }

  if (zone === 'command') {
    if (deck.format !== 'commander') {
      return res.status(400).json({ error: 'A zona command so pode ser usada em decks commander' });
    }

    await prisma.$transaction([
      prisma.deckCard.deleteMany({
        where: {
          deckId,
          zone: 'command'
        }
      }),
      prisma.deckCard.deleteMany({
        where: {
          deckId,
          cardId: card.id,
          zone: 'main'
        }
      }),
      prisma.deckCard.upsert({
        where: {
          deckId_cardId_zone: {
            deckId,
            cardId: card.id,
            zone: 'command'
          }
        },
        update: {
          qty: 1
        },
        create: {
          deckId,
          cardId: card.id,
          qty: 1,
          zone: 'command'
        }
      })
    ]);

    return res.status(201).json({ deckId, scryfallId, qty: 1, zone: 'command' });
  }

  const relation = await prisma.deckCard.upsert({
    where: {
      deckId_cardId_zone: {
        deckId,
        cardId: card.id,
        zone
      }
    },
    update: {
      qty: { increment: qty }
    },
    create: {
      deckId,
      cardId: card.id,
      qty,
      zone
    }
  });

  return res.status(201).json(relation);
});

router.patch('/:id/cards/:scryfallId', async (req: Request, res: Response) => {
  const deckId = Number(req.params.id);
  const scryfallId = String(req.params.scryfallId || '').trim();
  const qty = Number(req.body?.qty);
  const zone = toDeckZone(String(req.body?.zone || 'main'));

  if (!scryfallId) {
    return res.status(400).json({ error: 'scryfallId is required' });
  }

  if (!Number.isFinite(qty)) {
    return res.status(400).json({ error: 'qty is required' });
  }

  const card = await prisma.card.findUnique({ where: { scryfallId } });
  if (!card) {
    return res.status(404).json({ error: 'Carta não encontrada' });
  }

  if (zone === 'command') {
    const deck = await prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck) {
      return res.status(404).json({ error: 'Deck não encontrado' });
    }

    if (deck.format !== 'commander') {
      return res.status(400).json({ error: 'A zona command so pode ser usada em decks commander' });
    }
  }

  if (qty <= 0) {
    await prisma.deckCard.deleteMany({
      where: {
        deckId,
        cardId: card.id,
        zone
      }
    });
    return res.sendStatus(204);
  }

  const updated = await prisma.deckCard.updateMany({
    where: {
      deckId,
      cardId: card.id,
      zone
    },
    data: { qty: zone === 'command' ? 1 : qty }
  });

  if (updated.count === 0) {
    return res.status(404).json({ error: 'Relação não encontrada no deck' });
  }

  return res.json({ deckId, scryfallId, qty: zone === 'command' ? 1 : qty, zone });
});

router.delete('/:id/cards/:scryfallId', async (req: Request, res: Response) => {
  const deckId = Number(req.params.id);
  const scryfallId = String(req.params.scryfallId || '').trim();
  const zone = toDeckZone(String(req.query.zone || 'main'));

  const card = await prisma.card.findUnique({ where: { scryfallId } });
  if (!card) {
    return res.status(404).json({ error: 'Carta não encontrada' });
  }

  await prisma.deckCard.deleteMany({
    where: {
      deckId,
      cardId: card.id,
      zone
    }
  });

  return res.sendStatus(204);
});

export default router;
