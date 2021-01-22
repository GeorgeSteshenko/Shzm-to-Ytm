require("dotenv").config();
const fs = require("fs");

const url = "https://open.spotify.com/";
let page;

async function login(browser) {
  page = await browser.newPage();
  page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36"
  );

  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: "networkidle2" });
  console.log("Done.\n");

  console.log("Click on the login button...");
  await page.click("button[data-testid='login-button']");
  console.log("Done.\n");

  await page.waitForNavigation({ waitUntil: "networkidle2" });

  // Type username and password...
  console.log("Entering email...");
  await page.type("input[name=username]", process.env.SPOTIFY_USERNAME, {
    delay: 100,
  });
  console.log("Done.\n");

  console.log("Entering password...");
  await page.type("input[name=password]", process.env.SPOTIFY_PASSWORD, {
    delay: 100,
  });

  // Select "Remember me" browser option and then Continue button
  console.log("Uncheck 'Remember me' option...");
  await page.click("input[name=remember]", { delay: 30 });
  console.log("Done.\n");
  await page.click("#login-button");
  console.log("Submitting done.\n");
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  //   await page.close();
}

async function addSongsToPlaylist(browser) {
  console.log(`Navigating to ${url}...`);
  await page.goto(`${url}search`, { waitUntil: "networkidle2" });
  console.log("Done.\n");

  const songs = require("../songs.json");
  const missingSongs = [];

  console.log("Iterating over the songs.json list...\n");
  // Iterate over the whole list of songs
  for (const song of songs) {
    console.log(
      `Searching for the song: ${song}\n\nAdding to the playlist...\n`
    );

    // Clear search field before new entry
    await page.evaluate(
      () =>
        (document.querySelector("input[data-testid='search-input']").value = "")
    );

    // Enter song name into the search field
    await page.type("input[data-testid='search-input']", song, { delay: 50 });
    await page.waitForTimeout(1000);

    // Perform a right click on the top result to open the menu
    const topResult = await page.$$("section[aria-label='Top result'");

    if (!topResult.length) {
      missingSongs.push(song);
      console.log("Song was not found.\nLooking for another one...\n");
    } else {
      await topResult[0].click({ button: "right" });
      await page.waitForTimeout(500);

      // Then click add to playlist menu
      const addToPlaylist = await page.$$("#context-menu-root li");

      if (!addToPlaylist[5]) {
        missingSongs.push(song);

        await page.keyboard.press("Escape");

        await page.waitForTimeout(300);

        console.log("Song was not found.\nLooking for another one...\n");
      } else {
        await addToPlaylist[5].hover();
        await page.waitForTimeout(500);

        // Finally add song to a desired playlist
        const playlistItem = await page.$$(
          "#context-menu-root li div[id*='tippy'] li"
        );
        await playlistItem[1].click();
        await page.waitForTimeout(500);
        console.log("Done.\n");

        await page.waitForTimeout(500);
      }
    }
  }

  // Write missing songs into the spotify-missing-songs.json file
  console.log(
    "Writting missing songs to a spotify-missing-songs.json file...\n"
  );
  fs.writeFileSync(
    "./spotify-missing-songs.json",
    JSON.stringify(missingSongs)
  );
  console.log("Done.\n");

  console.log("All songs have been successfully migrated.");

  await page.close();
}

module.exports = {
  login,
  addSongsToPlaylist,
};
