require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { loadStorage } = require("./module/SesionData.js");
const token = process.env.api_bot_tele;
loadStorage();
const botOnText = require("./Hendler/TextHandler.js");
const botOnQuery = require("./Hendler/QueryHandler.js");
const botOnMassage = require("./Hendler/MassageHandler.js");
const cron = require("node-cron");
const path = require('path');
const dbPath = path.join(__dirname, 'db.sqlite');

const bot = new TelegramBot(token, { polling: true });
bot.on("polling_error", err => console.error("Polling error:", err));
bot.on("webhook_error", err => console.error("Webhook error:", err));
bot.on("webhook_error", err => console.error("Webhook error:", err));

cron.schedule(
	"0 1 * * *",
	async () => {
	  try {
	    deleteExpiredData();
		await bot.sendDocument(process.env.OWNER, dbPath, {

        caption: '📦 Backup otomatis database (db.sqlite)',

      });
	  } catch (err) {
	    console.error('Error:', err);
	     console.log(err)
	  }
		
	},
	{
		timezone: "Asia/Jakarta"
	} 
);

botOnText(bot);
botOnQuery(bot);
botOnMassage(bot);
