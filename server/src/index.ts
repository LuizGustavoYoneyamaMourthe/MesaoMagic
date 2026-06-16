import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { prisma } from './lib/prisma.js';
import cardsRouter from './routes/cards.js';
import decksRouter from './routes/decks.js';
import sharedRouter from './routes/shared.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(
  cors({
    origin: '*'
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'magic-deck-builder-api' });
});

app.use('/api/cards', cardsRouter);
app.use('/api/decks', decksRouter);
app.use('/api/shared', sharedRouter);

app.use('*', (_req, res) => {
  res.status(404).json({ error: 'route not found' });
});

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando: http://localhost:${PORT}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
