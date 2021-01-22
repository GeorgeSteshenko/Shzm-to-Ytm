const readlineSync = require("readline-sync");
require("dotenv").config();

const url = "https://stackoverflow.com/users/login?ssrc=head";

async function login(browser) {
  const page = await browser.newPage();

  page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36"
  );

  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: "networkidle2" });
  console.log("Done.\n");

  console.log("Click on the login button...");
  await page.click("button[data-provider='google']");
  console.log("Done.\n");

  await page.waitForNavigation({ waitUntil: "networkidle2" });

  // Type username and password...
  console.log("Entering email...");
  await page.type("input[type=email]", process.env.GGL_USERNAME, {
    delay: 100,
  });
  console.log("Done.\n");

  await page.keyboard.press("Enter");
  await page.waitForTimeout(2000);

  console.log("Entering password...");
  await page.type("input[type=password]", process.env.GGL_PASSWORD, {
    delay: 200,
  });
  await page.waitForTimeout(1000);
  console.log("Done.\n");

  await page.keyboard.press("Enter");
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  // Pass google TFAuth into the terminal promt
  let gglTFAuthCode = await readlineSync.question(
    "Please, provide auth code: ",
    {
      hideEchoBack: true,
    }
  );

  console.log("\nEntering Google TFAuth code...");
  await page.type("input[type=tel]", gglTFAuthCode, { delay: 100 });
  console.log("Done.\n");

  await page.waitForTimeout(300);
  await page.keyboard.press("Enter");
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  await page.close();
}

module.exports = {
  login,
};
