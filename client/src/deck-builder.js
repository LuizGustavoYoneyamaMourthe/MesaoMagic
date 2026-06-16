const GROUP_ORDER = ['Commander', 'Creatures', 'Planeswalkers', 'Artifacts', 'Enchantments', 'Instants', 'Sorceries', 'Lands', 'Other'];
const FORMAT_LABELS = {
    commander: 'Commander',
    standard: 'Standard',
    generic: 'Generico'
};
export function getCardImage(card) {
    return card.imageUris?.normal || card.imageUris?.small || card.imageUris?.png || '';
}
export function getDeckGroupKey(card) {
    if (card.zone === 'command') {
        return 'Commander';
    }
    const typeLine = card.typeLine || '';
    if (typeLine.includes('Creature'))
        return 'Creatures';
    if (typeLine.includes('Planeswalker'))
        return 'Planeswalkers';
    if (typeLine.includes('Artifact'))
        return 'Artifacts';
    if (typeLine.includes('Enchantment'))
        return 'Enchantments';
    if (typeLine.includes('Instant'))
        return 'Instants';
    if (typeLine.includes('Sorcery'))
        return 'Sorceries';
    if (typeLine.includes('Land'))
        return 'Lands';
    return 'Other';
}
export function groupDeckCards(cards) {
    const groups = new Map();
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
export function formatDeckLabel(format) {
    return FORMAT_LABELS[format] || format;
}
export function formatUsd(value) {
    if (value == null || Number.isNaN(value) || value <= 0) {
        return '—';
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}
export function getDeckTarget(format) {
    if (format === 'commander')
        return 100;
    if (format === 'standard')
        return 60;
    return null;
}
export function totalCards(cards) {
    return cards.reduce((acc, item) => acc + item.qty, 0);
}
export function countLands(cards) {
    return cards.reduce((acc, card) => acc + (/Land/i.test(card.typeLine || '') ? card.qty : 0), 0);
}
export function averageCmc(cards) {
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
export function countZone(cards, zone) {
    return cards.reduce((acc, card) => acc + (card.zone === zone ? card.qty : 0), 0);
}
export function buildCurve(cards) {
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
export function colorIdentity(cards) {
    const colors = new Set();
    cards.forEach((card) => {
        (card.colorIdentity || []).forEach((color) => colors.add(color));
    });
    return Array.from(colors);
}
export function countColorPips(cards) {
    const result = {
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
            ['W', 'U', 'B', 'R', 'G'].forEach((color) => {
                if (symbol.includes(color)) {
                    result[color] += card.qty;
                }
            });
        });
    });
    return result;
}
export function canBeCommander(card) {
    const typeLine = card.typeLine || '';
    return /legendary/i.test(typeLine) && /(creature|planeswalker)/i.test(typeLine);
}
export function toPreviewCard(card) {
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
export function pickDefaultPreview(deck) {
    if (!deck) {
        return null;
    }
    const commander = deck.cards.find((card) => card.zone === 'command');
    if (commander) {
        return toPreviewCard(commander);
    }
    return deck.cards[0] ? toPreviewCard(deck.cards[0]) : null;
}
