// Spotify API Credentials
const SPOTIFY_CLIENT_ID = "277d88e7a20b406f8d0b29111581da38"; // Replace with your Spotify Client ID
const REDIRECT_URI = "www.leelan.studio/"; // Replace with your app's Redirect URI
let spotifyAccessToken = "";

// Fetch and Display User Name
function fetchUserName() {
  if (!spotifyAccessToken) return;

  fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${spotifyAccessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const userName = data.display_name || "User";
      displayUserName(userName);
    })
    .catch((error) => {
      console.error("Error fetching user profile:", error);
    });
}

function displayUserName(userName) {
  const header = document.querySelector(".header");

  // Remove any existing greeting
  const existingGreeting = header.querySelector("h2");
  if (existingGreeting) {
    existingGreeting.remove();
  }

  const greeting = document.createElement("h2");
  greeting.textContent = `Hi, ${userName}`;
  greeting.style.color = "#1DB954"; // Optional: Style the text
  header.appendChild(greeting);
}

document.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const newAccessToken = params.get("access_token");

  if (newAccessToken) {
    // Store the token and fetch the user's name
    localStorage.setItem("spotifyAccessToken", newAccessToken);
    spotifyAccessToken = newAccessToken;
    connectSpotifyBtn.style.display = "none";
    fetchUserName(); // Fetch and display the user's name
    window.history.replaceState({}, document.title, window.location.pathname);
  } else {
    // Retrieve token from storage
    spotifyAccessToken = localStorage.getItem("spotifyAccessToken");

    if (spotifyAccessToken) {
      connectSpotifyBtn.style.display = "none";
      fetchUserName(); // Fetch and display the user's name
    } else {
      connectSpotifyBtn.style.display = "block";
    }
  }
});

// Other existing functions and event listeners remain unchanged...


// Selectors
const connectSpotifyBtn = document.getElementById("connectSpotifyBtn");
const addEntryBtn = document.getElementById("addEntryBtn");
const entryInput = document.getElementById("entry");
const songSearchInput = document.getElementById("songSearch");
const selectedSongDisplay = document.getElementById("selectedSong");
const ratingStars = document.getElementById("ratingStars");
const entriesContainer = document.getElementById("entries");
const suggestionsContainer = document.createElement("div");
suggestionsContainer.id = "suggestionsContainer";
suggestionsContainer.style.position = "absolute";
suggestionsContainer.style.marginTop = "5px";
suggestionsContainer.style.backgroundColor = "#2e2e2e";
suggestionsContainer.style.color = "#e6e6e6";
suggestionsContainer.style.zIndex = "1000";
suggestionsContainer.style.border = "1px solid #444";
suggestionsContainer.style.borderRadius = "5px";
suggestionsContainer.style.maxHeight = "300px";
suggestionsContainer.style.overflow = "hidden"; // Remove scroll bar
suggestionsContainer.style.display = "none"; // Initially hidden
songSearchInput.parentNode.insertBefore(suggestionsContainer, songSearchInput.nextSibling);

// Adjust width dynamically
function adjustSuggestionsWidth() {
  suggestionsContainer.style.width = `${songSearchInput.offsetWidth}px`;
}

window.addEventListener("resize", adjustSuggestionsWidth);
document.addEventListener("DOMContentLoaded", () => {
  adjustSuggestionsWidth(); // Adjust on load

  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const newAccessToken = params.get("access_token");

  if (newAccessToken) {
    console.log("New Access Token:", newAccessToken);
    localStorage.setItem("spotifyAccessToken", newAccessToken);
    spotifyAccessToken = newAccessToken;
    connectSpotifyBtn.style.display = "none";
    window.history.replaceState({}, document.title, window.location.pathname);
    checkAccessTokenExpiration();
  } else {
    spotifyAccessToken = localStorage.getItem("spotifyAccessToken");
    connectSpotifyBtn.style.display = spotifyAccessToken ? "none" : "block";
    checkAccessTokenExpiration();
  }

  connectSpotifyBtn.addEventListener("click", () => {
    const scopes = "user-read-private user-read-email";
    const authUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${SPOTIFY_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=${encodeURIComponent(scopes)}&show_dialog=true`;
    window.location.href = authUrl;
  });

  setupSongSearch();
  setupStarRatings();
  loadEntries();
});

function checkAccessTokenExpiration() {
  if (spotifyAccessToken) {
    fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${spotifyAccessToken}`,
      },
    })
      .then((response) => {
        if (response.status === 401) {
          console.log("Access token expired");
          localStorage.removeItem("spotifyAccessToken");
          spotifyAccessToken = "";
          connectSpotifyBtn.style.display = "block";
        }
      })
      .catch((error) => {
        console.error("Error verifying access token:", error);
        connectSpotifyBtn.style.display = "block";
      });
  }
}

function setupSongSearch() {
  songSearchInput.addEventListener("input", async () => {
    const query = songSearchInput.value.trim();
    if (query) {
      const suggestions = await fetchSuggestions(query);
      renderSuggestions(suggestions);
    } else {
      suggestionsContainer.innerHTML = "";
      suggestionsContainer.style.display = "none";
    }
  });
}

async function fetchSuggestions(query) {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`,
        },
      }
    );
    const data = await response.json();
    return data.tracks.items.map((track) => ({
      title: track.name,
      artist: track.artists[0].name,
      albumArtwork: track.album.images[0]?.url || "https://via.placeholder.com/50",
      url: track.external_urls.spotify,
    }));
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
}

function renderSuggestions(suggestions) {
  if (suggestions.length === 0) {
    suggestionsContainer.style.display = "none";
    return;
  }

  suggestionsContainer.style.display = "block";
  suggestionsContainer.innerHTML = suggestions
    .map(
      (s) => `
        <div class="suggestion-item" style="cursor: pointer; padding: 5px; border-bottom: 1px solid #444; display: flex; align-items: center;">
          <img src="${s.albumArtwork}" alt="Album Artwork" style="width: 50px; vertical-align: middle; margin-right: 10px; border-radius: 5px;">
          <span>${s.title} by ${s.artist}</span>
        </div>
      `
    )
    .join("");

 
 
    const suggestionItems = document.querySelectorAll(".suggestion-item");
  suggestionItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      const selected = suggestions[index];
      selectedSong = selected;
      selectedSongDisplay.innerHTML = `
        <div>
          <img src="${selected.albumArtwork}" alt="Album Artwork" style="width: 100px; border-radius: 10px;">
          <p><a href="${selected.url}" target="_blank" style="color: #1DB954;">${selected.title} by ${selected.artist}</a></p>
          <button id="removeSelectedSong" style="margin-top: 10px; background-color: #ff0000; color: white; padding: 10px; border: none; border-radius: 5px; cursor: pointer; transition: background-color 0.3s;">Remove Selected Song</button>
        </div>
      `;
      suggestionsContainer.innerHTML = "";
      suggestionsContainer.style.display = "none";

      const removeButton = document.getElementById("removeSelectedSong");
      
      removeButton.addEventListener("click", () => {
        selectedSong = null;
        selectedSongDisplay.innerHTML = "";
        songSearchInput.value = "";
      });
    });
  });
}




function setupStarRatings() {
  ratingStars.addEventListener("click", (e) => {
    if (e.target.tagName === "SPAN") {
      songRating = parseInt(e.target.getAttribute("data-value"));
      updateStarColors();
    }
  });
}

function updateStarColors() {
  const stars = ratingStars.querySelectorAll("span");
  stars.forEach((star) => {
    const value = parseInt(star.getAttribute("data-value"));
    star.classList.toggle("active", value <= songRating);
  });
}

// Add New Entry
addEntryBtn.addEventListener("click", () => {
  const text = entryInput.value.trim();
  if (!text) return alert("Please write something before adding an entry.");
  if (!selectedSong) return alert("Please select a song from the suggestions.");

  const newEntry = {
    id: Date.now(),
    text,
    date: new Date().toLocaleString(),
    song: selectedSong,
    rating: songRating,
  };

  saveEntryToLocalStorage(newEntry);
  renderEntry(newEntry);

  entryInput.value = "";
  selectedSongDisplay.innerHTML = "";
  songSearchInput.value = "";
  selectedSong = null;
  songRating = 0;
  updateStarColors();
});

function saveEntryToLocalStorage(entry) {
  const entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
  entries.push(entry);
  localStorage.setItem("journalEntries", JSON.stringify(entries));
}

function loadEntries() {
  const entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
  entries.forEach(renderEntry);
}

function renderEntry(entry) {
  const entryDiv = document.createElement("div");
  entryDiv.classList.add("entry");
  entryDiv.setAttribute("data-id", entry.id);

  const songHTML = entry.song
    ? `
      <div class="song">
        <img src="${entry.song.albumArtwork}" alt="Album Artwork" style="width: 100px; border-radius: 10px;">
        <p><a href="${entry.song.url}" target="_blank" style="color:#1DB954;">${entry.song.title} by ${entry.song.artist}</a></p>
      </div>
    `
    : "";

  entryDiv.innerHTML = `
    <p>${entry.text}</p>
    ${songHTML}
    <p>${generateStarsHTML(entry.rating || 0)}</p>
    <p>${entry.date}</p>
    <button class="delete">Delete</button>
  `;

  entryDiv.querySelector(".delete").addEventListener("click", () => {
    deleteEntry(entry.id);
    entryDiv.remove();
  });

  entriesContainer.prepend(entryDiv);
}

function generateStarsHTML(rating) {
  const maxStars = 5;
  return Array.from({ length: maxStars }, (_, i) =>
    `<span style="color: ${i < rating ? "#1DB954" : "#ccc"}; font-size: 1.2rem;">&#9733;</span>`
  ).join("");
}

function deleteEntry(id) {
  let entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
  entries = entries.filter((entry) => entry.id !== id);
  localStorage.setItem("journalEntries", JSON.stringify(entries));
}
