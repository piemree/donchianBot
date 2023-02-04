const TelegramBot = require("node-telegram-bot-api");
const { telegram, botConfig } = require("./config");
const b = require("./helpers/binance");
const exec = require("child_process").exec;

const bot = new TelegramBot(telegram.token, { polling: true });

function stopBot() {
  bot.sendMessage(telegram.chatId, "Trade Bot Stopping...");
  exec("pm2 stop bot && pm2 save", (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(telegram.chatId, "Failed to stop Trade Bot.");
    } else {
      bot.sendMessage(telegram.chatId, "Trade Bot Stopped Successfully.");
    }
  });
}

function startBot() {
  bot.sendMessage(telegram.chatId, "Trade Bot Starting...");
  exec("pm2 start bot && pm2 save", (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(telegram.chatId, "Failed to start Trade Bot.");
    } else {
      bot.sendMessage(telegram.chatId, "Trade Bot Started Successfully.");
    }
  });
}

function deleteBot() {
  bot.sendMessage(telegram.chatId, "Trade Bot Deleting...");
  exec("pm2 delete bot && pm2 save", (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(telegram.chatId, "Failed to delete Trade Bot.");
    } else {
      bot.sendMessage(telegram.chatId, "Trade Bot Deleted Successfully.");
    }
  });
}

function initBot() {
  bot.sendMessage(telegram.chatId, "Trade Bot Initializing...");
  exec("pm2 start app.js --name bot && pm2 save", (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(telegram.chatId, "Failed to initialize Trade Bot.");
    } else {
      bot.sendMessage(telegram.chatId, "Trade Bot Initialized Successfully.");
    }
  });
}

function restartBot() {
  bot.sendMessage(telegram.chatId, "Trade Bot Restarting...");
  exec("pm2 restart bot && pm2 save", (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(telegram.chatId, "Failed to restart Trade Bot.");
    } else {
      bot.sendMessage(telegram.chatId, "Trade Bot Restarted Successfully.");
    }
  });
}

function getBalance() {
  b.getBalance().then((balance) => {
    bot.sendMessage(telegram.chatId, balance);
  });
}

function getPositions() {
  b.findPositions({
    symbol: botConfig.symbol,
  })
    .then((status) => {
      if (!status.LongPosition && !status.ShortPosition) {
        bot.sendMessage(msg.chat.id, "No open positions");
        return;
      }
      bot.sendMessage(msg.chat.id, JSON.stringify(status, null, 2));
    })
    .catch((error) => {
      bot.sendMessage(msg.chat.id, JSON.stringify(error.body, null, 2));
    });
}

function pullRepo() {
  bot.sendMessage(msg.chat.id, "Pull repository...");
  exec("git pull", (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(msg.chat.id, "Failed to pull.");
    } else {
      bot.sendMessage(msg.chat.id, "Pull Successfully.");
    }
  });
}

function restartCommands() {
  bot.sendMessage(msg.chat.id, "Restarting commands...");
  exec("pm2 restart commands && pm2 save", (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(msg.chat.id, "Failed to restart commands.");
    } else {
      bot.sendMessage(msg.chat.id, "Commands Restarted Successfully.");
    }
  });
}

function sendHelp() {
  bot.sendMessage(
    msg.chat.id,
    `
        <b>Available commands:</b>
        <code>/balance</code> - get current balance
        <code>/positions</code> - get current positions
        <code>/start</code> - start trade bot
        <code>/stop</code> - stop trade bot
        <code>/delete</code> - delete trade bot
        <code>/init</code> - initialize trade bot
        <code>/fetch</code> - fetch repository
        <code>/restart</code> - restart trade bot
        <code>/restart-commands</code> - restart commands
        <code>/help</code> - show available commands
        `,
    { parse_mode: "HTML" }
  );
}


bot.on("message", (msg) => {
  switch (msg.text) {
    case "stop":
      stopBot();
      break;
    case "start":
      startBot();
      break;
    case "restart":
      restartBot();
      break;
    case "restart-commands":
      restartCommands();
      break;
    case "delete":
      deleteBot();
      break;
    case "init":
      initBot();
      break;
    case "pull":
      pullRepo();
      break;
    case "balance":
      getBalance();
      break;
    case "positions":
      getPositions();
      break;
    case "help":
      sendHelp();
      break;
    default:
      bot.sendMessage(msg.chat.id, "Invalid command");
      break;
  }
});
