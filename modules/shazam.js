const url = "https://www.shazam.com/login/app/fb/myshazam";
const fs = require("fs");

async function loadSongs(browser) {
  const page = await browser.newPage();
  page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36"
  );

  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: "networkidle2" });
  console.log("Done.\n");

  const cookies = require("../fb-cookies.json");

  await page.setCookie(...cookies);

  // Click on Sign in with Facebook button
  console.log("Trying to Log In...");
  await page.click("a.fblogin", { delay: 30 });
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  console.log("Done.\n");

  await page.waitForSelector(".shazams-content.active article ul", {
    timeout: 0,
  });

  // Evaluate script on Shazam page to scroll through the page,
  // lazyload all shazamed songs and save them into the variable
  console.log("Scroll through the page to lazy load all shazams...");
  const result = await page.evaluate(() => {
    return new Promise((resolve, reject) => {
      const scrollSpeed = 5000;
      let items = 0;

      const scrollToBottom = setInterval(() => {
        const itemsList = document.querySelectorAll(
          ".shazams-content ul article"
        );
        const itemsCount = itemsList.length;

        if (itemsCount > items) {
          try {
            window.scrollTo(0, document.body.scrollHeight);
            items = itemsCount;
          } catch (error) {
            reject(error);
          }
        } else {
          clearInterval(scrollToBottom);

          const list = [...itemsList].map((row) => {
            const artist = row.querySelector("[data-track-artist]").innerText;
            const title = row.querySelector("[data-track-title]").innerText;

            return `${artist} ${title}`;
          });

          resolve(list);
        }
      }, scrollSpeed);
    });
  });
  console.log("Done.\n");

  console.log("Filterring for dublications...\n");
  let filteredResult = new Set();
  result.forEach((song) => filteredResult.add(song));
  console.log("Done.\n");

  // Write result into the songs.json file
  console.log("Writting songs to a songs.json file...\n");
  fs.writeFileSync(
    "./songs.json",
    JSON.stringify(Array.from(filteredResult).flat())
  );
  console.log("Done.\n");

  // Close shazam page
  await page.close();
}

module.exports = {
  loadSongs,
};
