# spoti.notes

## Description
**spoti.notes** is a modern, minimalistic journal web application that lets users:
- Write daily journal entries.
- Attach their "Song of the Day" by searching Spotify's vast library.
- Rate the selected song with a 5-star rating system.
- Save entries locally on their browser for easy access.

The app features a clean and responsive design with seamless animations and a Spotify-inspired theme.

---

## Features
- 🎵 **Spotify Integration**: Search for songs and attach your "Song of the Day" to each journal entry.
- ⭐ **Song Rating**: Use a 5-star rating system to rate your favorite songs.
- 📝 **Local Storage**: All journal entries are saved in the browser's local storage, ensuring data persistence.
- 🔍 **Responsive UI**: Works smoothly across desktop and mobile devices.
- 🗑️ **Entry Management**: Add and delete entries with ease.

---

## Tech Stack
- **HTML5**: Structure and layout of the app.
- **CSS3**: Styling and animations for a modern, responsive interface.
- **JavaScript (ES6)**: App functionality, Spotify API integration, and local storage management.
- **Spotify Web API**: Fetch song data like title, artist, album artwork, and preview links.

---

## Getting Started

### Prerequisites
- A web browser (Chrome, Firefox, Edge, etc.).
- A local server for development (e.g., VS Code Live Server or any static file server).

### Setting Up Spotify API Credentials
1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Create a new application to get your `Client ID` and `Client Secret`.
3. In your app settings:
   - Add the Redirect URI `http://127.0.0.1:5500/`.
4. Update the `SPOTIFY_CLIENT_ID` in your `script.js` file:
   ```javascript
   const SPOTIFY_CLIENT_ID = "YOUR_SPOTIFY_CLIENT_ID";
   const REDIRECT_URI = "http://127.0.0.1:5500/"; // Replace with your Redirect URI
