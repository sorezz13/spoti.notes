// Tab Switching Logic
const journalTab = document.getElementById("journalTab");
const statsTab = document.getElementById("statsTab");
const journalSection = document.getElementById("journalSection");
const statsSection = document.getElementById("statsSection");

journalTab.addEventListener("click", () => toggleTab("journal"));
statsTab.addEventListener("click", () => toggleTab("stats"));

function toggleTab(tab) {
  if (tab === "journal") {
    journalSection.classList.add("active");
    statsSection.classList.remove("active");
    journalTab.classList.add("active");
    statsTab.classList.remove("active");
  } else if (tab === "stats") {
    statsSection.classList.add("active");
    journalSection.classList.remove("active");
    statsTab.classList.add("active");
    journalTab.classList.remove("active");
  }
}

// Top Stats Fetch and Render Logic
const topList = document.getElementById("top-list");
const filterButtons = document.querySelectorAll(".filter");
const timeButtons = document.querySelectorAll(".time");

let currentType = "tracks"; // Default to tracks
let currentTime = "short_term"; // Default to weekly

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentType = button.dataset.type;
    fetchTopStats();
  });
});

timeButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentTime = button.dataset.time;
    fetchTopStats();
  });
});

async function fetchTopStats() {
  if (!spotifyAccessToken) {
    topList.innerHTML = "<li>Please connect your Spotify account to view stats.</li>";
    return;
  }

  const url = `https://api.spotify.com/v1/me/top/${currentType}?time_range=${currentTime}&limit=10`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${spotifyAccessToken}`,
      },
    });
    const data = await response.json();
    renderTopStats(data.items);
  } catch (error) {
    console.error("Error fetching top stats:", error);
    topList.innerHTML = "<li>Error loading data. Please try again later.</li>";
  }
}

function renderTopStats(items) {
  topList.innerHTML = items.map(item => {
    const name = item.name || "Unknown Title";
    const artist = item.artists ? item.artists[0].name : "Unknown Artist";
    return `<li>${name} by ${artist}</li>`;
  }).join("");
}
