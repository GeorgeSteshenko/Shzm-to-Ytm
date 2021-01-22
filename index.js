const puppeteer = require("puppeteer");

const facebook = require("./modules/facebook");
const googleAuth = require("./modules/google-auth");
const shazam = require("./modules/shazam");
const youtubeMusic = require("./modules/youtube-music");
const spotify = require("./modules/spotify");

(async function main() {
  // Create a browser instance
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  // Check if facebook cookies are saved, if not, then log into facebook
  const cookies = require("./fb-cookies.json");
  if (!Object.keys(cookies).length) await facebook.login(browser);

  // Load all songs. Scroll through the page, save songs to the file
  await shazam.loadSongs(browser);

  // Log into google account with OAuth (workaround google acc login with puppeteer)
  await googleAuth.login(browser);

  // Add saved songs to YouTube Music playlist
  await youtubeMusic.addSongsToPlaylist(browser);

  // Log into Spotify
  await spotify.login(browser);

  // Add saved songs to Spotify playlist
  await spotify.addSongsToPlaylist(browser);

  // Done, close the browser
  await browser.close();
})();
