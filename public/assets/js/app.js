console.log("Welcome to your DOOM! Mesão do MTG!");


async function fetchDecks() {
  try {
    const url = "http://localhost:3000/decks";
    console.log("Tentando buscar decks de:", url);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error("Erro na resposta:", response.status, response.statusText);
      return [];
    }
    
    const decks = await response.json();
    console.log("Decks carregados com sucesso:", decks);
    return decks;
  } catch (error) {
    console.error("Erro ao buscar decks:", error);
    console.error("Certifique-se de que o JSON Server está rodando na porta 3000");
    return [];
  }
}


async function initCarousel() {
  const carouselInner = document.getElementById("carousel-inner");
  
  if (carouselInner) {
    const decks = await fetchDecks();
    const carouselDecks = decks.slice(0, 3);
    
    carouselDecks.forEach((deck, index) => {
      const isActive = index === 0 ? "active" : "";
      const carouselItem = document.createElement("div");
      carouselItem.className = `carousel-item ${isActive}`;
      carouselItem.innerHTML = `
        <a href="detalhes.html?id=${deck.id}" class="carousel-link">
          <img src="${deck.imagem}" alt="${deck.titulo}" class="carousel-image">
          <div class="carousel-caption">
            <h3>${deck.titulo}</h3>
            <p>${deck.descricao}</p>
          </div>
        </a>
      `;
      carouselInner.appendChild(carouselItem);
    });
  }
}


async function initCardsContainer() {
  const container = document.getElementById("cards-container");
  
  if (container) {
    const decks = await fetchDecks();
    
    decks.forEach(deck => {
      const card = document.createElement("a");
      card.classList.add("deck");
      card.href = `detalhes.html?id=${deck.id}`;
      card.style.backgroundImage = `url('${deck.imagem}')`;
      
      card.innerHTML = `
        <div class="deck-content">
          <h3>${deck.titulo}</h3>
          <p>${deck.descricao}</p>
        </div>
      `;
      
      container.appendChild(card);
    });
  }
}


async function initDetalhesContainer() {
  const detalhesContainer = document.getElementById("detalhes-container");
  
  if (detalhesContainer) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    
    const decks = await fetchDecks();
    const deck = decks.find(d => d.id === id);
    
    if (deck) {
      let cartasPrincipaisHTML = "";
      
      if (deck.cartas_principais && deck.cartas_principais.length > 0) {
        cartasPrincipaisHTML = `
          <section class="cartas-principais-section">
            <h3>Cartas Principais</h3>
            <div class="cartas-grid">
              ${deck.cartas_principais.map(carta => `
                <div class="carta">
                  <img src="${carta.imagem}" alt="${carta.nome}" class="carta-image">
                  <p class="carta-nome">${carta.nome}</p>
                </div>
              `).join("")}
            </div>
          </section>
        `;
      }
      
      detalhesContainer.innerHTML = `
        <section class="detalhes-header">
          <img src="${deck.imagem}" alt="${deck.titulo}" class="detalhes-image">
          <div class="detalhes-info">
            <h2>${deck.titulo}</h2>
            <p class="descricao"><strong>Descrição:</strong> ${deck.descricao}</p>
            <p class="conteudo">${deck.conteudo}</p>
            <a href="index.html" class="btn-voltar">⬅ Voltar</a>
          </div>
        </section>
        ${cartasPrincipaisHTML}
      `;
    } else {
      detalhesContainer.innerHTML = `<p>Item não encontrado. ID: ${id}</p>`;
    }
  }
}


document.addEventListener("DOMContentLoaded", () => {
  initCarousel();
  initCardsContainer();
  initDetalhesContainer();
});