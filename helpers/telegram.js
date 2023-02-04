const TelegramBot = require("node-telegram-bot-api");
const { telegram } = require("../config");

const bot = new TelegramBot(telegram.token);

function sendMessage(text = "", options = {}) {
  bot.sendMessage(telegram.chatId, text, options);
}
module.exports = { sendMessage };
