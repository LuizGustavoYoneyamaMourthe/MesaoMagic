const API_BASE = '/api';
async function requestJson(url, options = {}) {
    const response = await fetch(`${API_BASE}${url}`, {
        method: options.method || 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        body: options.body ? JSON.stringify(options.body) : undefined
    });
    if (!response.ok) {
        let message = `Request failed: ${response.status}`;
        try {
            const payload = await response.json();
            if (payload?.error) {
                message = `${message} - ${payload.error}`;
            }
        }
        catch {
            // no-op
        }
        throw new Error(message);
    }
    if (response.status === 204) {
        return null;
    }
    return (await response.json());
}
export async function searchCards(query, page = 1) {
    return requestJson(`/cards/search?q=${encodeURIComponent(query)}&page=${page}&pageSize=18`);
}
export async function getDecks() {
    return requestJson('/decks');
}
export async function getDeck(id) {
    return requestJson(`/decks/${id}`);
}
export async function getDeckStats(id) {
    return requestJson(`/decks/${id}/stats`);
}
export async function createDeck(payload) {
    return requestJson('/decks', {
        method: 'POST',
        body: payload
    });
}
export async function updateDeckName(id, payload) {
    return requestJson(`/decks/${id}`, {
        method: 'PUT',
        body: payload
    });
}
export async function deleteDeck(id) {
    return requestJson(`/decks/${id}`, { method: 'DELETE' });
}
export async function createShareLink(id) {
    return requestJson(`/decks/${id}/share`, {
        method: 'POST'
    });
}
export async function disableShareLink(id) {
    return requestJson(`/decks/${id}/share`, {
        method: 'DELETE'
    });
}
export async function addCardToDeck(id, payload) {
    return requestJson(`/decks/${id}/cards`, {
        method: 'POST',
        body: {
            scryfallId: payload.scryfallId,
            qty: payload.qty,
            zone: payload.zone || 'main'
        }
    });
}
export async function updateDeckCardQty(id, scryfallId, payload) {
    return requestJson(`/decks/${id}/cards/${scryfallId}`, {
        method: 'PATCH',
        body: payload
    });
}
export async function removeDeckCard(id, scryfallId, zone) {
    return requestJson(`/decks/${id}/cards/${scryfallId}?zone=${zone}`, { method: 'DELETE' });
}
export async function getSharedDeck(shareToken) {
    return requestJson(`/shared/${shareToken}`);
}
export async function postSharedComment(shareToken, payload) {
    return requestJson(`/shared/${shareToken}/comments`, {
        method: 'POST',
        body: payload
    });
}
