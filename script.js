// Spotify API Credentials
const SPOTIFY_CLIENT_ID = "277d88e7a20b406f8d0b29111581da38";
const SPOTIFY_CLIENT_SECRET = "e70027250ac648eeb1695a6d85f44dc7";
let spotifyAccessToken = "";

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
let songRating = 0; // Rating out of 5 stars

// Load Entries and Spotify Token on Page Load
document.addEventListener("DOMContentLoaded", () => {
  loadEntries();
  getSpotifyAccessToken();
  setupStarRatings();
  toggleSearchButton(); // Initially disable search if empty
});

// Function to Fetch Spotify Access Token
async function getSpotifyAccessToken() {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET),
      },
      body: "grant_type=client_credentials",
    });

    const data = await response.json();
    spotifyAccessToken = data.access_token;
  } catch (error) {
    console.error("Error fetching Spotify access token:", error);
  }
}

// Function to Search for a Song on Spotify
async function searchSong(query) {
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
    return null;
  }
}

// Event Listener: Search for a Song
searchSongBtn.addEventListener("click", async () => {
  const query = songSearchInput.value.trim();
  if (!query) return;

  const song = await searchSong(query);
  if (song) {
    selectedSong = song;
    selectedSongDisplay.innerHTML = `
      ${song.title} by ${song.artist}
      <br>
      <img src="${song.albumArtwork}" alt="Album Artwork" style="margin-top: 10px; width: 100px; border-radius: 10px;">
      ${
        song.previewUrl
          ? `<br><audio controls src="${song.previewUrl}" style="margin-top: 10px;"></audio>`
          : '<p style="color: red;">No preview available</p>'
      }
    `;
  }
});

// Disable Search Button when Input is Empty
function toggleSearchButton() {
  songSearchInput.addEventListener("input", () => {
    searchSongBtn.disabled = songSearchInput.value.trim() === "";
  });
}

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

// Add New Entry
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

  // Reset
  entryInput.value = "";
  selectedSongDisplay.innerHTML = "";
  songSearchInput.value = "";
  searchSongBtn.disabled = true;
  selectedSong = null;
  songRating = 0;
  updateStarColors();
});

// Save to Local Storage
function saveEntryToLocalStorage(entry) {
  const entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
  entries.push(entry);
  localStorage.setItem("journalEntries", JSON.stringify(entries));
}

// Load Entries
function loadEntries() {
  const entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
  entries.forEach(renderEntry);
}

// Generate Stars
function generateStarsHTML(rating) {
  const maxStars = 5;
  return Array.from({ length: maxStars }, (_, i) =>
    `<span style="color: ${i < rating ? "#1DB954" : "#ccc"}; font-size: 1.2rem;">&#9733;</span>`
  ).join("");
}

// Render Entry
function renderEntry(entry) {
  const entryDiv = document.createElement("div");
  entryDiv.classList.add("entry");
  entryDiv.setAttribute("data-id", entry.id);

  const songHTML = entry.song
    ? `
      <div class="song">
        <img src="${entry.song.albumArtwork}" alt="Album Artwork" style="width: 100px; border-radius: 10px;">
        <p><a href="${entry.song.url}" target="_blank" style="color:#1DB954;">${entry.song.title} by ${entry.song.artist}</a></p>
        ${entry.song.previewUrl ? `<audio controls src="${entry.song.previewUrl}"></audio>` : '<p style="color: red;">No preview available</p>'}
      </div>
    `
    : "";

  entryDiv.innerHTML = `
    <p>${entry.text}</p>
    ${songHTML}
    <p>${generateStarsHTML(entry.rating || 0)}</p>
    <div class="date-time">${entry.date}</div>
    <button class="delete">Delete</button>
  `;

  entryDiv.querySelector(".delete").addEventListener("click", () => {
    deleteEntry(entry.id);
    entryDiv.remove();
  });

  entriesContainer.prepend(entryDiv);
}

// Delete Entry
function deleteEntry(id) {
  let entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
  entries = entries.filter((entry) => entry.id !== id);
  localStorage.setItem("journalEntries", JSON.stringify(entries));
}


const REDIRECT_URI = "http://localhost:3000",; // Replace with your app's redirect URI
const SCOPES = ["user-top-read"]; // Permissions needed for user top data

function authorizeSpotifyUser() {
  const authURL = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${SCOPES.join('%20')}`;
  window.location.href = authURL;
}

function extractAccessTokenFromURI() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get("access_token");
}

document.addEventListener("DOMContentLoaded", () => {
  const token = extractAccessTokenFromURI();
  if (token) {
    spotifyAccessToken = token;
  } else {
    authorizeSpotifyUser(); // Redirect if no token
  }
});


async function fetchTopSpotifyData(type, timeRange = "medium_term") {
  try {
    const response = await fetch(`https://api.spotify.com/v1/me/top/${type}?time_range=${timeRange}&limit=10`, {
      headers: {
        Authorization: `Bearer ${spotifyAccessToken}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error(`Error fetching Spotify top ${type}:`, error);
  }
}


async function showTopData() {
  const timeRange = document.getElementById("timeRange").value;

  const topArtists = await fetchTopSpotifyData("artists", timeRange);
  const topTracks = await fetchTopSpotifyData("tracks", timeRange);

  document.getElementById("topArtists").innerHTML = topArtists.items.map(artist => `
    <div>
      <img src="${artist.images[0]?.url || "https://via.placeholder.com/100"}" alt="${artist.name}">
      <p>${artist.name}</p>
    </div>
  `).join("");

  document.getElementById("topSongs").innerHTML = topTracks.items.map(track => `
    <div>
      <img src="${track.album.images[0]?.url || "https://via.placeholder.com/100"}" alt="${track.name}">
      <p>${track.name} by ${track.artists.map(a => a.name).join(", ")}</p>
      <audio controls src="${track.preview_url}"></audio>
    </div>
  `).join("");

  // Add logic for albums if desired
  document.getElementById("spotifyTopModal").classList.add("active");
}

document.getElementById("timeRange").addEventListener("change", showTopData);
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("spotifyTopModal").classList.remove("active");
});


document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", (e) => {
    // Remove 'active' class from all tabs
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    // Add 'active' class to the clicked tab
    e.target.classList.add("active");

    // Hide all tab contents
    document.querySelectorAll(".tab-content").forEach(c => c.classList.add("hidden"));

    // Show the corresponding content
    const target = e.target.id.replace("tab", "top"); // e.g., "tabArtists" -> "topArtists"
    document.getElementById(target).classList.remove("hidden");
  });
});


document.addEventListener("DOMContentLoaded", () => {
  // Close Modal Listener
  document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("spotifyTopModal").classList.remove("active");
  });

  // Tab Switching Listeners
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", (e) => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      e.target.classList.add("active");

      document.querySelectorAll(".tab-content").forEach(c => c.classList.add("hidden"));
      const target = e.target.id.replace("tab", "top");
      document.getElementById(target).classList.remove("hidden");
    });
  });
});

