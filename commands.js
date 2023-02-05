const TelegramBot = require("node-telegram-bot-api");
const { telegram, botConfig } = require("./config");
const b = require("./helpers/binance");
const exec = require("child_process").exec;

const bot = new TelegramBot(telegram.token, { polling: true });

function stopBot(id) {
  bot.sendMessage(telegram.chatId, "Trade Bot Stopping...");
  exec("pm2 stop bot && pm2 save", (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(telegram.chatId, "Failed to stop Trade Bot.");
    } else {
      bot.sendMessage(telegram.chatId, "Trade Bot Stopped Successfully.");
    }
  });
}

function startBot(id) {
  bot.sendMessage(telegram.chatId, "Trade Bot Starting...");
  exec("pm2 start bot && pm2 save", (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(telegram.chatId, "Failed to start Trade Bot.");
    } else {
      bot.sendMessage(telegram.chatId, "Trade Bot Started Successfully.");
    }
  });
}

function deleteBot(id) {
  bot.sendMessage(telegram.chatId, "Trade Bot Deleting...");
  exec("pm2 delete bot && pm2 save", (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(telegram.chatId, "Failed to delete Trade Bot.");
    } else {
      bot.sendMessage(telegram.chatId, "Trade Bot Deleted Successfully.");
    }
  });
}

function initBot(id) {
  bot.sendMessage(telegram.chatId, "Trade Bot Initializing...");
  exec("pm2 start app.js --name bot && pm2 save", (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(telegram.chatId, "Failed to initialize Trade Bot.");
    } else {
      bot.sendMessage(telegram.chatId, "Trade Bot Initialized Successfully.");
    }
  });
}

function restartBot(id) {
  bot.sendMessage(telegram.chatId, "Trade Bot Restarting...");
  exec("pm2 restart bot && pm2 save", (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(telegram.chatId, "Failed to restart Trade Bot.");
    } else {
      bot.sendMessage(telegram.chatId, "Trade Bot Restarted Successfully.");
    }
  });
}

function getBalance(id) {
  b.getBalance().then((balance) => {
    bot.sendMessage(telegram.chatId, balance);
  });
}

function getPositions(id) {
  b.findPositions({
    symbol: botConfig.symbol,
  })
    .then((status) => {
      if (!status.LongPosition && !status.ShortPosition) {
        bot.sendMessage(id, "No open positions");
        return;
      }
      bot.sendMessage(id, JSON.stringify(status, null, 2));
    })
    .catch((error) => {
      bot.sendMessage(id, JSON.stringify(error.body, null, 2));
    });
}

function pullRepo(id) {
  bot.sendMessage(id, "Pull repository...");
  exec("git pull", (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(id, "Failed to pull.");
    } else {
      bot.sendMessage(id, "Pull Successfully.");
    }
  });
}

function sendHelp(id) {
  bot.getMyCommands().then((commands) => {
    const help = commands.reduce((acc, command) => {
      return acc + `${command.command} - ${command.description}` + "\n";
    }, "");
    bot.sendMessage(id, help);
  });
}
bot.setMyCommands([
  { command: "/balance", description: "Get balance" },
  { command: "/positions", description: "Get positions" },
  { command: "/stop", description: "Stop bot" },
  { command: "/start", description: "Start bot" },
  { command: "/init", description: "Initialize bot" },
  { command: "/restart", description: "Restart bot" },
  { command: "/delete", description: "Delete bot" },
  { command: "/pull", description: "Pull repository" },
  { command: "/help", description: "Show available commands" },
]);

bot.on("message", (msg) => {
  const message = msg.text.toLowerCase().trim();
  const id = msg.chat.id;
  switch (message) {
    case "/stop":
      stopBot(id);
      break;
    case "/start":
      startBot(id);
      break;
    case "/restart":
      restartBot(id);
      break;
    case "/delete":
      deleteBot(id);
      break;
    case "/init":
      initBot(id);
      break;
    case "/pull":
      pullRepo(id);
      break;
    case "/balance":
      getBalance(id);
      break;
    case "/positions":
      getPositions(id);
      break;
    case "/help":
      sendHelp(id);
      break;
    default:
      bot.sendMessage(
        id,
        "Invalid command. Type /help to see available commands."
      );
      break;
  }
});
