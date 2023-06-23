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

    totalCharacters = characters.length;
    totalPages = Math.ceil(totalCharacters / cardsPerPage);

    const cards = document.querySelector("#container-cards");
    cards.innerHTML = "";

    let statusColorClass = "";

    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;

    const charactersToShow = characters.slice(startIndex, endIndex);

    charactersToShow.forEach((character) => {
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
        <div class="card border-info mt-3" style="width: 10rem; height: 13.5rem">
          <img src="${character.image}" />
          <div class="card-body">
            <h5 class="card-title">${character.name}</h5>
            <div class="statusWrapper">
              <div class="statusColor ${statusColorClass}"></div>
              <p>${character.status} - ${character.species}</p>
            </div>
            <p class="card-text">
              Last known location:<br>
              <span>${character.location.name}</span>
            </p>
            <p class="card-text">
              Last seen on:
              <span></span>
            </p>
          </div>
        </div>
      `;

      card.innerHTML = cardContent;
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

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = createPageButton(i, currentPage !== i);
    pageButton.addEventListener("click", () => {
      if (currentPage !== i) {
        currentPage = i;
        showCharactersOnScreen();
      }
    });
    pagination.appendChild(pageButton);
  }

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
    <p>Status: ${character.status}</p>
    <p>Species: ${character.species}</p>
    <p>Last Known Location: ${character.location.name}</p>
    <p>Last Seen on: ${character.episode[character.episode.length - 1]}</p>
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
