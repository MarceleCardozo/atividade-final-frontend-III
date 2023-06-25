const api = axios.create({
  baseURL: "https://rickandmortyapi.com/api",
});

let totalCharacters = 0;
let totalPages = 0;
const cardsPerPage = 6;
let currentPage = 1;
let searchQuery = "";

async function showCharactersOnScreen() {
  try {
    let characterResponse;
    if (searchQuery) {
      characterResponse = await api.get(`/character?name=${searchQuery}`);
    } else {
      characterResponse = await api.get("/character");
    }
    const characters = characterResponse.data.results;
    const qtdPersonagens = characterResponse.data.info.count;

    totalPages = Math.ceil(qtdPersonagens / cardsPerPage);

    updateTotalCharacters(qtdPersonagens);
    updateTotalLocations();
    updateTotalEpisodes();

    const cards = document.querySelector("#container-cards");
    cards.innerHTML = "";

    const charactersToShow = getCharactersToShow(characters);

    charactersToShow.forEach((character) => {
      const card = createCharacterCard(character);
      card.addEventListener("click", () => {
        showCharacterDetails(character);
      });
      cards.appendChild(card);
    });

    updatePagination();
  } catch (error) {
    console.log(error);
  }
}

function updateTotalCharacters(totalCharacters) {
  const totalCharactersElement = document.querySelector("#totalCharacters");
  totalCharactersElement.textContent = totalCharacters;
}

async function updateTotalLocations() {
  const locationResponse = await api.get("/location");
  const totalLocations = locationResponse.data.info.count;

  const totalLocationsElement = document.querySelector("#totalLocations");
  totalLocationsElement.textContent = totalLocations;
}

async function updateTotalEpisodes() {
  const episodeResponse = await api.get("/episode");
  const totalEpisodes = episodeResponse.data.info.count;

  const totalEpisodesElement = document.querySelector("#totalEpisodes");
  totalEpisodesElement.textContent = totalEpisodes;
}

function getCharactersToShow(characters) {
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;

  return characters.slice(startIndex, endIndex);
}

function createCharacterCard(character) {
  let statusColorClass = "";

  if (character.status === "Alive") {
    statusColorClass = "green-status";
  } else if (character.status === "Dead") {
    statusColorClass = "red-status";
  } else {
    statusColorClass = "gray-status";
  }

  const card = document.createElement("div");
  card.classList.add("col-4");

  const cardContent = `
    <div class="card border-info mt-4" style="width: 10rem; height: 13.5rem">
      <img src="${character.image}" />
      <div class="card-body">
        <h5 class="card-title">${character.name}</h5>
        <div class="statusWrapper">
          <div class="statusColor ${statusColorClass}"></div>
          <p>${character.status} - ${character.species}</p>
        </div>
        <p class="card-text">Last known location:</p>
        <p>${character.location.name}</p>
        <p class="card-text">Last seen on:</p>
        <p></p>
      </div>
    </div>
  `;

  card.innerHTML = cardContent;
  return card;
}

function updatePagination() {
  const pagination = document.querySelector(".pagination");
  pagination.innerHTML = "";

  const previousButton = createPageButton("Previous", currentPage > 1);
  previousButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      showCharactersOnScreen();
    }
  });
  pagination.appendChild(previousButton);

  const pageButton = createPageButton(currentPage, false);
  pagination.appendChild(pageButton);

  const nextButton = createPageButton("Next", currentPage < totalPages);
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      showCharactersOnScreen();
    }
  });
  pagination.appendChild(nextButton);
}

function createPageButton(label, enabled) {
  const button = document.createElement("li");
  button.classList.add("page-item");
  if (!enabled) {
    button.classList.add("disabled");
  }

  const link = document.createElement("a");
  link.classList.add("page-link");
  link.href = "#";
  link.innerHTML = label;

  button.appendChild(link);

  return button;
}

function showCharacterDetails(character) {
  const modalTitle = document.querySelector("#modalTitle");
  const modalBody = document.querySelector("#modalBody");

  modalTitle.textContent = character.name;
  modalBody.innerHTML = `
  <img src="${character.image}" /> 
  <p>Status: ${character.status}</p> 
  <p>Species: ${character.species}</p> 
  <p>Last Known Location: ${character.location.name}</p> 
  <p>Last Seen on: ${character.episode[character.episode.length - 1]}</p>`;

  const characterModal = new bootstrap.Modal(
    document.querySelector("#characterModal")
  );
  characterModal.show();
}

document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.querySelector("form");
  const searchInput = document.querySelector("input[type=search]");

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchQuery = searchInput.value.trim();
    currentPage = 1;
    showCharactersOnScreen();
  });

  showCharactersOnScreen();
});
