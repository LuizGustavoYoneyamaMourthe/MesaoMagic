-- CreateTable
CREATE TABLE "Card" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scryfallId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "manaCost" TEXT,
    "cmc" REAL,
    "typeLine" TEXT,
    "oracleText" TEXT,
    "colors" TEXT,
    "colorIdentity" TEXT,
    "rarity" TEXT,
    "setCode" TEXT,
    "imageUris" TEXT,
    "legalities" TEXT,
    "lastFetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Deck" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "format" TEXT NOT NULL DEFAULT 'commander',
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "shareToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DeckCard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deckId" INTEGER NOT NULL,
    "cardId" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "zone" TEXT NOT NULL DEFAULT 'main',
    CONSTRAINT "DeckCard_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DeckCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScryfallCache" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cacheKey" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DeckComment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deckId" INTEGER NOT NULL,
    "authorName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeckComment_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Card_scryfallId_key" ON "Card"("scryfallId");

-- CreateIndex
CREATE UNIQUE INDEX "Deck_shareToken_key" ON "Deck"("shareToken");

-- CreateIndex
CREATE UNIQUE INDEX "DeckCard_deckId_cardId_zone_key" ON "DeckCard"("deckId", "cardId", "zone");

-- CreateIndex
CREATE UNIQUE INDEX "ScryfallCache_cacheKey_key" ON "ScryfallCache"("cacheKey");
