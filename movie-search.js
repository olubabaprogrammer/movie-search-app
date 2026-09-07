let searchInput = document.getElementById('search-input');
let searchButton = document.getElementById('search-button');
let resultTab = document.getElementById('result-tab');
let watchlistTab = document.getElementById('watchlist-tab');
let resultContainer = document.getElementById('result-container');
let watchlistContainer = document.getElementById('watchlist-container');
let errorMessage = document.getElementById('error-message');
let modalOverlay = document.getElementById('modal-overlay');
let modalContent = document.getElementById('modal-content');
let modalBody = document.getElementById('modal-body');
let closeModal = document.getElementById('close-modal');
let toast = document.getElementById("toast");
   


let baseUrl = "https://www.omdbapi.com/?apikey=e504590c&s=";

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 1500);
}

async function movieSearch() {
  let query = searchInput.value.trim();
  let data = await fetch(baseUrl + query);
  let result = await data.json();
  console.log(result);

  if (result.Response === "False") {
    errorMessage.textContent = result.Error;
    errorMessage.style.display = "block";
    resultContainer.innerHTML = "";
    currentResults = [];
    return;
  }

  errorMessage.style.display = "none";

  currentResults = result.Search;

  resultContainer.innerHTML = "";

  result.Search.forEach(function(movie) {
    let card = `
    <div class="movie-card" data-id="${movie.imdbID}">
      <img src="${movie.Poster}">
      <h3>${movie.Title}</h3> 
      <p>${movie.Year}</p>
      <button class="save-btn" data-id="${movie.imdbID}">Save</button>
    </div>
    `;
    resultContainer.innerHTML += card;
  });
}

searchButton.addEventListener("click", movieSearch);

resultContainer.addEventListener("click", async function(e) {

  if (e.target.classList.contains("save-btn")) {
    let movieId = e.target.dataset.id;
    let movieToSave = currentResults.find(m => m.imdbID === movieId);

    
    if (!movieToSave) {
      return;
    }

    let storedWatchlist = localStorage.getItem("watchlist");
    let watchlist;
    if (storedWatchlist) {
      watchlist = JSON.parse(storedWatchlist);
    } else {
      watchlist = [];
    }

    let alreadySaved = watchlist.some(m => m.imdbID === movieId);
    if (alreadySaved) {
      showToast("Already in watchlist");
      return;
    }

    watchlist.push(movieToSave);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    showToast("Successfully added");
    return;
  }
 
  let clickedMovie = e.target.closest(".movie-card");
  let movieId = clickedMovie.dataset.id;

  let detailUrl = baseUrl.replace("&s=", "&i=") + movieId;
  let detailData = await fetch(detailUrl);
  let detailResult = await detailData.json();

  if (detailResult.Response === "False") {
    showToast("Couldn't load movie details");
    return;
  }

  modalBody.innerHTML = `
    <h2>${detailResult.Title} (${detailResult.Year})</h2>
    <p><strong>Genre:</strong> ${detailResult.Genre}</p>
    <p><strong>Released:</strong> ${detailResult.Released}</p>
    <p><strong>Runtime:</strong> ${detailResult.Runtime}</p>
    <p><strong>Director:</strong> ${detailResult.Director}</p>
    <p><strong>Writer:</strong> ${detailResult.Writer}</p>
    <p><strong>Actors:</strong> ${detailResult.Actors}</p>
    <p><strong>Plot:</strong> ${detailResult.Plot}</p>
    <p><strong>Language:</strong> ${detailResult.Language}</p>
    <p><strong>Country:</strong> ${detailResult.Country}</p>
    <p><strong>Awards:</strong> ${detailResult.Awards}</p>
    <p><strong>IMDb Rating:</strong> ${detailResult.imdbRating}</p>
    <p><strong>Box Office:</strong> ${detailResult.BoxOffice}</p>
  `;

  modalOverlay.style.display = "flex";
});

closeModal.addEventListener("click", function () {
  modalOverlay.style.display = "none";
});

resultTab.addEventListener("click", function () {
  resultContainer.style.display = "grid";
  watchlistContainer.style.display = "none";
});

watchlistTab.addEventListener("click", function () {
  watchlistContainer.style.display = "grid";
  resultContainer.style.display = "none";

  let local = localStorage.getItem("watchlist");
  let raw;
  if (local) {
    raw = JSON.parse(local);
  } else {
    raw = [];
  }

  watchlistContainer.innerHTML = "";

  raw.forEach(function(movie) {
    let card = `
    <div class="movie-card" data-id="${movie.imdbID}">
      <img src="${movie.Poster}">
      <h3>${movie.Title}</h3>
      <p>${movie.Year}</p>
      <button class="remove-btn" data-id="${movie.imdbID}">Remove</button>
    </div>
    `;
    watchlistContainer.innerHTML += card;
  });
});

watchlistContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("remove-btn")) {
    let movieId = e.target.dataset.id;
 
    let local = localStorage.getItem("watchlist");
    let raw;
    if (local) {
      raw = JSON.parse(local);
    } else {
      raw = [];
    }

    let updatedWatchlist = raw.filter(m => m.imdbID !== movieId);

    localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));

    watchlistTab.click();
  }
});

searchInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    movieSearch();
  }
});