require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const cron = require("node-cron");

// 🔗 Target URL
const URL = "https://shop.royalchallengers.com/ticket";

// 📁 File to store previous data
const FILE = "previous.txt";

// 📲 Telegram config (from .env)
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// 📩 Send Telegram Message
async function sendTelegramMessage(message) {
  const apiUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

  try {
    await axios.post(apiUrl, {
      chat_id: CHAT_ID,
      text: message,
    });
    console.log("📩 Telegram message sent!");
  } catch (error) {
    console.error("❌ Telegram error:", error.message);
  }
}

// 🔍 Extract important content from page
function extractImportantData(html) {
  const $ = cheerio.load(html);

  // You can refine this selector later
  return $("body").text().replace(/\s+/g, " ").trim();
}

// 🔄 Check for changes
async function checkChanges() {
  try {
    console.log("🔍 Checking for updates...");

    const { data } = await axios.get(URL);
    const newContent = extractImportantData(data);

    let oldContent = "";
    if (fs.existsSync(FILE)) {
      oldContent = fs.readFileSync(FILE, "utf-8");
    }

    if (true) {
      console.log("🚨 Change detected!");

      await sendTelegramMessage(
        `🚨 RCB Ticket Update!

Tickets page changed!
Check now: ${URL}`
      );
    }

    fs.writeFileSync(FILE, newContent);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

// ⏱ Run every 30 seconds
cron.schedule("*/30 * * * * *", checkChanges);

console.log("🚀 RCB Ticket Monitor Started...");