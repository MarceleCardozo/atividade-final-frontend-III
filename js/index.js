const api = axios.create({
  baseURL: "https://rickandmortyapi.com/api",
});

let totalPages = 0;
const cardsPerPage = 6;
let currentPage = 1;
let searchQuery = "";
let charactersList = [];
let count;
let routeParameter = 1;
let isResetCharactersList;

async function buscarPersonagens() {
  try {
    if (searchQuery) {
      result = await api.get(`/character?name=${searchQuery}`);
      charactersList = [];
      isResetCharactersList = true;
      result.data.results.forEach((list) => charactersList.push(list));
    } else {
      if (isResetCharactersList) {
        isResetCharactersList = false;
        charactersList = [];
        routeParameter = 1;
      }
      result = await api.get(`/character?page=${routeParameter}`);
      routeParameter++;
      result.data.results.forEach((list) => charactersList.push(list));
      count = result.data.info.count;
    }
  } catch (error) {
    console.log(error);
  }
}

async function showCharactersOnScreen() {
  try {
    await buscarPersonagens();
    const characters = charactersList;

    const amountOfCharacters = count;

    totalPages = searchQuery
      ? Math.ceil(characters.length / cardsPerPage)
      : Math.ceil(amountOfCharacters / cardsPerPage);

    updateTotalCharacters(amountOfCharacters);
    updateTotalLocations();
    updateTotalEpisodes();

    const charactersToShow = getCharactersToShow(characters);

    const cards = document.querySelector("#container-cards");
    cards.innerHTML = "";

    for (let i = 0; i < charactersToShow.length; i++) {
      const character = charactersToShow[i];
      const card = await createCharacterCard(character);
      card.addEventListener("click", () => {
        showCharacterDetails(character);
      });
      cards.appendChild(card);
    }

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

async function createCharacterCard(character) {
  let statusColorClass = "";

  if (character.status === "Alive") {
    statusColorClass = "green-status";
  } else if (character.status === "Dead") {
    statusColorClass = "red-status";
  } else {
    statusColorClass = "gray-status";
  }

  const getLastEpisodeName = async () => {
    try {
      const lastEpisodeId = character.episode[character.episode.length - 1]
        .split("/")
        .pop();
      const episodeResponse = await api.get(`/episode/${lastEpisodeId}`);
      const lastEpisodeName = episodeResponse.data.name;
      return lastEpisodeName;
    } catch (error) {
      console.log(error);
      return "Unknown Episode";
    }
  };

  const lastEpisodeName = await getLastEpisodeName();

  const card = document.createElement("div");
  card.classList.add("col-4");

  const cardContent = `
    <div class="card border-success mt-4">
      <img src="${character.image}" />
      <div class="card-body">
        <h5 class="card-title">${character.name}</h5>
        <div class="statusWrapper">
          <div class="statusColor ${statusColorClass}"></div>
          <p>${character.status} - ${character.species}</p>
        </div>
        <p class="card-text mt-1">Last known location:</p>
        <p>${character.location.name}</p>
        <p class="card-text mt-1">Last seen on:</p>
        <p>${lastEpisodeName}</p>
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

async function showCharacterDetails(character) {
  const modalTitle = document.querySelector("#modalTitle");
  const modalBody = document.querySelector("#modalBody");

  modalTitle.textContent = character.name;

  const lastEpisodeId = character.episode[character.episode.length - 1]
    .split("/")
    .pop();
  const episodeResponse = await api.get(`/episode/${lastEpisodeId}`);
  const lastEpisodeName = episodeResponse.data.name;

  modalBody.innerHTML = `
    <img src="${character.image}" /> 
    <p class="mt-3">Status: ${character.status}</p> 
    <p>Species: ${character.species}</p> 
    <p>Last Known Location: ${character.location.name}</p> 
    <p>Last Seen on: ${lastEpisodeName}</p>
  `;

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
