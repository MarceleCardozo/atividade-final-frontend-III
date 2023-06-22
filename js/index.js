const api = axios.create({
  baseURL: "https://rickandmortyapi.com/api",
});

async function showCharactersOnScreen(ev) {
  ev.preventDefault();

  try {
    const characterResponse = await api.get(
      "https://rickandmortyapi.com/api/character"
    );

    const characters = characterResponse.data.results;

    const cards = document.querySelector("#container-cards");

    console.log(characters);

    characters.forEach((character) => {
      cards.innerHTML += `
      <div class="col-4 p-2">
        <div class="card border-info mt-5"" style="width: 14rem;">
        <img src="https://rickandmortyapi.com/api/character/avatar/${character.id}.jpeg"/>
          <div class="card-body">
            <h5 class="card-title">${character.name}</h5>
            <p>
            ${character.status} - ${character.species}
            </p>
            <p class="card-text ">
            Last known location:
            <br>
            <span>${character.location.name}</span>
            </p>
            <p class="card-text">
            Last seen on:
            <span></span>
            </p>
          </div>
        </div>
      </div>`;
    });
  } catch (error) {
    console.log(error);
  }
}

document.addEventListener("DOMContentLoaded", showCharactersOnScreen);
