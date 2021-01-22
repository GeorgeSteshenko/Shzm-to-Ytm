const url = "https://music.youtube.com/";
const fs = require("fs");

async function addSongsToPlaylist(browser) {
  const page = await browser.newPage();
  page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36"
  );

  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: "networkidle2" });
  console.log("Done.\n");

  const songs = require("../songs.json");
  const missingSongs = [];

  console.log("Iterating over the songs.json list...\n");
  // Iterate over the whole list of songs
  for (const song of songs) {
    // Convert each song (Artist name + title) to a query string
    const songQuery = encodeURIComponent(song)
      .replace(/'/g, "%27")
      .replace(/%20/g, "+");

    console.log(
      `Searching for the song: ${song}\n\nAdding to the playlist...\n`
    );
    // Navigate to the page using search query string URL
    await page.goto(`${url}search?q=${songQuery}`, {
      waitUntil: "networkidle2",
    });

    // Perform a right click on the top result to open the menu
    const topResult = await page.$$("ytmusic-responsive-list-item-renderer");

    if (!topResult.length) {
      missingSongs.push(song);
      console.log("Song was not found.\nLooking for another one...\n");
    } else {
      await topResult[0].click({ button: "right" });
      await page.waitForTimeout(500);

      // Then click add to playlist menu
      const addToPlaylist = await page.$x(
        "//yt-formatted-string[contains(text(), 'Add to playlist')]"
      );
      await addToPlaylist[0].click();
      await page.waitForTimeout(500);

      // Finally add song to a desired playlist
      const playlistItem = await page.$(
        "button[aria-label='My shazams Private']"
      );
      await playlistItem.click();
      console.log("Done.\n");

      await page.waitForTimeout(2000);
    }
  }

  // Write missing songs into the ytm-missing-songs.json file
  console.log("Writting missing songs to a ytm-missing-songs.json file...\n");
  fs.writeFileSync("./ytm-missing-songs.json", JSON.stringify(missingSongs));
  console.log("Done.\n");

  console.log("All songs have been successfully migrated.");

  await page.close();
}

module.exports = {
  addSongsToPlaylist,
};
