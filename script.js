// Spotify OAuth Configuration
const SPOTIFY_CLIENT_ID = "277d88e7a20b406f8d0b29111581da38"; // Your Spotify Client ID
const REDIRECT_URI = "https://sorezz13.github.io/spoti-notes/";

    

 // Redirect back to your app's root
const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SCOPES = ["user-read-private", "user-read-email"].join(" "); // Spotify scopes

// Function to Redirect User to Spotify Login
function redirectToSpotifyAuth() {
  const authUrl = `${SPOTIFY_AUTH_URL}?client_id=${SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
  window.location.href = authUrl;
}

// Function to Extract Access Token from URL
function getSpotifyAccessToken() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get("access_token");

  if (accessToken) {
    localStorage.setItem("spotifyAccessToken", accessToken); // Save token locally
    return accessToken;
  }
  return localStorage.getItem("spotifyAccessToken"); // Return saved token if available
}

// Initialize Spotify Authentication
let spotifyAccessToken = getSpotifyAccessToken();
if (!spotifyAccessToken) {
  redirectToSpotifyAuth(); // Prompt user to log in if no token exists
}

// Selectors
const addEntryBtn = document.getElementById("addEntryBtn");
const entryInput = document.getElementById("entry");
const songSearchInput = document.getElementById("songSearch");
const searchSongBtn = document.getElementById("searchSongBtn");
const selectedSongDisplay = document.getElementById("selectedSong");
const ratingStars = document.getElementById("ratingStars");
const entriesContainer = document.getElementById("entries");

// Global Variables
let selectedSong = null;
let songRating = 0;

// Load Entries on Page Load
document.addEventListener("DOMContentLoaded", () => {
  loadEntries();
  setupStarRatings();
  toggleSearchButton(); // Disable search button initially
});

// Function to Search for a Song on Spotify
async function searchSong(query) {
  if (!spotifyAccessToken) {
    console.error("No Spotify Access Token found.");
    return;
  }
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`,
        },
      }
    );

    const data = await response.json();
    if (data.tracks.items.length > 0) {
      const song = data.tracks.items[0];
      return {
        title: song.name,
        artist: song.artists[0].name,
        url: song.external_urls.spotify,
        albumArtwork: song.album.images[0]?.url || "https://via.placeholder.com/100",
        previewUrl: song.preview_url,
      };
    } else {
      alert("No songs found. Please try a different search.");
      return null;
    }
  } catch (error) {
    console.error("Error searching for song:", error);
    alert("Session expired. Please log in again.");
    localStorage.removeItem("spotifyAccessToken");
    redirectToSpotifyAuth();
  }
}

// Event Listener: Search Song Button
searchSongBtn.addEventListener("click", async () => {
  const query = songSearchInput.value.trim();
  if (!query) return alert("Please enter a song name.");

  const song = await searchSong(query);
  if (song) {
    selectedSong = song;
    selectedSongDisplay.innerHTML = `
      🎵 Selected: ${song.title} by ${song.artist}
      <br>
      <img src="${song.albumArtwork}" alt="Album Artwork" style="margin-top: 10px; width: 100px; border-radius: 10px;">
      ${song.previewUrl ? `<br><audio controls src="${song.previewUrl}" style="margin-top: 10px;"></audio>` : '<p style="color: red;">No preview available</p>'}
    `;
  }
});

// Setup Star Ratings
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

// Add New Journal Entry
addEntryBtn.addEventListener("click", () => {
  const text = entryInput.value.trim();
  if (!text) return alert("Please write something before adding an entry.");

  const newEntry = {
    id: Date.now(),
    text,
    date: new Date().toLocaleString(),
    song: selectedSong,
    rating: songRating,
  };

  saveEntryToLocalStorage(newEntry);
  renderEntry(newEntry);

  // Reset inputs
  entryInput.value = "";
  selectedSongDisplay.innerHTML = "";
  songSearchInput.value = "";
  searchSongBtn.disabled = true;
  selectedSong = null;
  songRating = 0;
  updateStarColors();
});

// Save Entry to Local Storage
function saveEntryToLocalStorage(entry) {
  const entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
  entries.push(entry);
  localStorage.setItem("journalEntries", JSON.stringify(entries));
}

// Load Entries from Local Storage
function loadEntries() {
  const entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
  entries.forEach(renderEntry);
}

// Render Journal Entry
function renderEntry(entry) {
  const entryDiv = document.createElement("div");
  entryDiv.classList.add("entry");
  entryDiv.setAttribute("data-id", entry.id);

  const songHTML = entry.song
    ? `<div class="song">
        <img src="${entry.song.albumArtwork}" alt="Album Artwork" style="width: 100px; border-radius: 10px;">
        <p>🎵 <a href="${entry.song.url}" target="_blank" style="color:#1DB954;">${entry.song.title} by ${entry.song.artist}</a></p>
        ${entry.song.previewUrl ? `<audio controls src="${entry.song.previewUrl}"></audio>` : '<p style="color: red;">No preview available</p>'}
      </div>`
    : "";

  entryDiv.innerHTML = `
    <p>${entry.text}</p>
    ${songHTML}
    <p>${generateStarsHTML(entry.rating)}</p>
    <div class="date-time">${entry.date}</div>
    <button class="delete">Delete</button>
  `;

  entryDiv.querySelector(".delete").addEventListener("click", () => {
    deleteEntry(entry.id);
    entryDiv.remove();
  });

  entriesContainer.prepend(entryDiv);
}

// Generate Stars HTML
function generateStarsHTML(rating) {
  return Array.from({ length: 5 }, (_, i) => `<span style="color: ${i < rating ? "#1DB954" : "#ccc"};">★</span>`).join("");
}

// Delete Entry
function deleteEntry(id) {
  let entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
  entries = entries.filter((entry) => entry.id !== id);
  localStorage.setItem("journalEntries", JSON.stringify(entries));
}
