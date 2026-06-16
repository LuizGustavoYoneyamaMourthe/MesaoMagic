import { Request, Response, Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { buildDeckStats, serializeDeckCard } from '../lib/deck-metadata.js';

const router = Router();

router.get('/:shareToken', async (req: Request, res: Response) => {
  const shareToken = String(req.params.shareToken || '').trim();

  const deck = await prisma.deck.findFirst({
    where: {
      shareToken,
      isShared: true
    },
    include: {
      deckCards: {
        include: { card: true },
        orderBy: { id: 'desc' }
      },
      comments: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!deck) {
    return res.status(404).json({ error: 'Deck compartilhado não encontrado' });
  }

  return res.json({
    deckId: deck.id,
    shareToken: deck.shareToken,
    name: deck.name,
    description: deck.description,
    format: deck.format,
    cards: deck.deckCards.map(serializeDeckCard),
    comments: deck.comments,
    stats: buildDeckStats(deck.deckCards, deck.format)
  });
});

router.post('/:shareToken/comments', async (req: Request, res: Response) => {
  const shareToken = String(req.params.shareToken || '').trim();
  const authorName = String(req.body?.authorName || '').trim();
  const message = String(req.body?.message || '').trim();

  if (!authorName) {
    return res.status(400).json({ error: 'authorName is required' });
  }

  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }

  const deck = await prisma.deck.findFirst({
    where: {
      shareToken,
      isShared: true
    }
  });

  if (!deck) {
    return res.status(404).json({ error: 'Deck compartilhado não encontrado' });
  }

  const comment = await prisma.deckComment.create({
    data: {
      deckId: deck.id,
      authorName,
      message
    }
  });

  return res.status(201).json(comment);
});

export default router;
