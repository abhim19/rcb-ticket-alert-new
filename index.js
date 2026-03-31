require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const cron = require("node-cron");
const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const URL = "https://shop.royalchallengers.com/ticket";
const FILE = "previous.html";

// Extract meaningful content (important!)
function extractImportantData(html) {
  const $ = cheerio.load(html);

  // Customize this selector if needed
  return $("body").text().replace(/\s+/g, " ").trim();
}

async function checkChanges() {
  try {
    console.log("Checking for updates...");

    const { data } = await axios.get(URL);
    const newContent = extractImportantData(data);

    let oldContent = "";
    if (fs.existsSync(FILE)) {
      oldContent = fs.readFileSync(FILE, "utf-8");
    }

    if (oldContent && oldContent !== newContent) {
      console.log("🚨 Change detected!");

      await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: process.env.YOUR_WHATSAPP_NUMBER,
        body: `🚨 RCB Ticket Update!

Tickets page has changed!
Check now: ${URL}`,
      });
    }

    fs.writeFileSync(FILE, newContent);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

// Run every 2 minutes
cron.schedule("*/2 * * * *", checkChanges);

console.log("🚀 Monitoring started...");
body: "Test alert 🚀 RCB monitoring working!"