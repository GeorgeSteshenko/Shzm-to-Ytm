const readlineSync = require("readline-sync");
const fs = require("fs");
require("dotenv").config();

const url = "https://www.fb.com/login/";

async function login(browser) {
  const page = await browser.newPage();

  page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36"
  );

  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: "networkidle2" });
  console.log("Done.\n");

  // Type username and password
  console.log("Entering email...");
  await page.type("#email", process.env.FB_USERNAME, { delay: 30 });
  console.log("Done.\n\nEntering password...");
  await page.type("#pass", process.env.FB_PASSWORD, { delay: 30 });
  console.log("Done.\n");

  // Click login button
  console.log("Trying to Log In...");
  await page.click("#loginbutton");
  console.log("Done.\n");

  // Wait for two factor auth page navigation to finish
  console.log("Navigating to two-factor auth page...");
  await page.waitForNavigation({ waitUntil: "networkidle0" });
  console.log("Done.\n");

  // Pass TFAuth into the terminal promt
  let fbTFAuthCode = await readlineSync.question(
    "Please, provide auth code: ",
    {
      hideEchoBack: true,
    }
  );

  console.log("\nEntering Facebook TFAuth code...");
  await page.type("#approvals_code", fbTFAuthCode, { delay: 100 });
  console.log("Done.\n");

  // Click Continue
  await page.click("button[type=submit]");
  console.log("Submitting done.\n");

  // Wait for last step login page navigation
  console.log("Navigating to the last login step...");
  await page.waitForNavigation({ waitUntil: "networkidle0" });
  console.log("Done.\n");

  // Select "Don't save" browser option and then Continue button
  console.log("Don't save the brower...");
  await page.click("input[value=dont_save]", { delay: 30 });
  console.log("Done.\n");
  await page.click("button[type=submit]");
  console.log("Submitting done.\n");

  await page.waitForNavigation({ waitUntil: "networkidle2" });

  const currentFbCookies = await page.cookies();

  fs.writeFileSync("./fb-cookies.json", JSON.stringify(currentFbCookies));
}

module.exports = {
  login,
};
