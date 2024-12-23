const entriesContainer = document.getElementById("entries");

let selectedSong = null;
let songRating = 0; // Declare globally to track the rating



// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, query, where, doc, } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyCmrSXbK58bsr54OGc9rywXWjL8lfYvufI",
  authDomain: "syncscribe-2de6e.firebaseapp.com",
  projectId: "syncscribe-2de6e",
  storageBucket: "syncscribe-2de6e.firebasestorage.app",
  messagingSenderId: "447987259771",
  appId: "1:447987259771:web:4da231f069f78ea4be45de",
  measurementId: "G-442X8YXXR7"
};
// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(); // Initialize Authentication









// Spotify API Credentials
const SPOTIFY_CLIENT_ID = "277d88e7a20b406f8d0b29111581da38"; // Replace with your Spotify Client ID
const REDIRECT_URI = "https://leelan.studio"; // Replace with your app's Redirect URI
let spotifyAccessToken = "";


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

async function fetchUserName() {
  if (!spotifyAccessToken) {
    console.error("No access token available.");
    return;
  }

  try {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${spotifyAccessToken}`,
      },
    });
    const data = await response.json();
    console.log("Spotify API Response:", data);

    const userName = data.display_name || "User";
    const userId = data.id; // Spotify user ID
    console.log("Fetched User Name:", userName);
    console.log("Fetched User ID:", userId);

    if (userId) {
      localStorage.setItem("spotifyUserId", userId); // Save Spotify user ID
      displayUserName(userName);
    } else {
      console.error("User ID is missing in Spotify response.");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
}


async function fetchSpotifyUserInfo(accessToken) {
  try {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      console.error("Spotify token expired. Please log in again.");
      localStorage.removeItem("spotifyAccessToken");
      spotifyAccessToken = null;
      connectSpotifyBtn.style.display = "block";
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Spotify user info:", error);
    return null;
  }
}



// Selectors
const connectSpotifyBtn = document.getElementById("connectSpotifyBtn");
const addEntryBtn = document.getElementById("addEntryBtn");
const entryInput = document.getElementById("entry");
const songSearchInput = document.getElementById("songSearch");
const selectedSongDisplay = document.getElementById("selectedSong");
const ratingStars = document.getElementById("ratingStars");

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

//handleSpotify
async function handleSpotifySignIn() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const newAccessToken = params.get("access_token");

  if (newAccessToken) {
    localStorage.setItem("spotifyAccessToken", newAccessToken);
    spotifyAccessToken = newAccessToken;

    const userInfo = await fetchSpotifyUserInfo(spotifyAccessToken);
    if (userInfo) {
      const spotifyUserId = userInfo.id;
      localStorage.setItem("spotifyUserId", spotifyUserId); // Store Spotify User ID

      // Ensure Firebase Anonymous Authentication
      await firebaseSignIn();

      displayUserName(userInfo.display_name);
      await loadEntriesFromCloud();

      // Remove the access token from the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      console.error("Failed to fetch Spotify user info.");
    }
  } else {
    console.error("Spotify access token not found in the URL.");
  }
}




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

  connectSpotifyBtn.addEventListener("click", async () => {
    console.log("Connect Spotify button clicked.");
    const scopes = "user-read-private user-read-email";
    const authUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${SPOTIFY_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=${encodeURIComponent(scopes)}&show_dialog=true`;
  
    window.location.href = authUrl;
  });
  

  setupSongSearch();
  setupStarRatings();
  loadEntriesFromCloud();
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

async function firebaseSignIn() {
  try {
      const userCredential = await signInAnonymously(auth);
      console.log("Firebase Anonymous User Signed In:", userCredential.user.uid);
  } catch (error) {
      console.error("Error signing into Firebase:", error);
  }
}





// Add New Entry
addEntryBtn.addEventListener("click", async () => {
  const userId = localStorage.getItem("spotifyUserId");
  if (!userId) {
    return alert("Please connect your Spotify account first.");
  }

  const text = entryInput.value.trim();
  if (!text) return alert("Please write something before adding an entry.");
  if (!selectedSong) return alert("Please select a song from the suggestions.");

  const newEntry = {
    text,
    date: new Date().toLocaleString(),
    song: selectedSong,
    rating: songRating,
  };

  await saveEntryToCloud(newEntry);
  renderEntry(newEntry);

  entryInput.value = "";
  selectedSongDisplay.innerHTML = "";
  songSearchInput.value = "";
  selectedSong = null;
  songRating = 0;
});


async function saveEntryToCloud(entry) {
  const docRef = await addDoc(collection(db, "journalEntries"), {
    ...entry,
    userId, // Lowercase, consistent with Firestore
  });
  

  try {
    const docRef = await addDoc(collection(db, "journalEntries"), {
      ...entry,
      userId, // Tie the entry to the user
    });
    console.log("Entry saved with ID:", docRef.id);
  } catch (error) {
    console.error("Error saving entry:", error);
  }
}


async function loadEntriesFromCloud() {
  const userId = localStorage.getItem("spotifyUserId"); // Retrieve Spotify user ID
  if (!userId) {
    console.error("User ID not available. Please log in.");
    return;
  }

  try {
    const entriesQuery = query(
      collection(db, "journalEntries"),
      where("userId", "==", userId) // Query by userId field
    );

    const querySnapshot = await getDocs(entriesQuery);
    entriesContainer.innerHTML = ""; // Clear existing entries
    querySnapshot.forEach((doc) => {
      renderEntry({ id: doc.id, ...doc.data() }); // Render each entry
    });
  } catch (error) {
    console.error("Error loading entries:", error);
  }
}



async function deleteEntryFromCloud(id) {
  try {
    await deleteDoc(doc(db, "journalEntries", id));
    console.log("Entry deleted: ", id);
  } catch (error) {
    console.error("Error deleting entry: ", error);
  }
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

  entryDiv.querySelector(".delete").addEventListener("click", async () => {
    await deleteEntryFromCloud(entry.id);
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




document.addEventListener("DOMContentLoaded", async () => {
  await handleSpotifySignIn(); // Handle Spotify and Firebase sign-in
});





// Test retrieving data
async function testFirestoreData() {
  try {
    const querySnapshot = await getDocs(collection(db, "journalEntries"));
    querySnapshot.forEach((doc) => {
      console.log(`Document ID: ${doc.id}`);
      console.log("Data:", doc.data());
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Call the test function
testFirestoreData();

