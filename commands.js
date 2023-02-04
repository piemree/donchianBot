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

function restartCommands(id) {
  bot.sendMessage(id, "Restarting commands...");
  exec("pm2 restart commands && pm2 save", (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(id, "Failed to restart commands.");
    } else {
      bot.sendMessage(id, "Commands Restarted Successfully.");
    }
  });
}

function sendHelp(id) {
  bot.sendMessage(
    id,
`<b>Available commands:</b>

<code>/stop</code> Stop bot
<code>/start</code> Start bot
<code>/restart</code> Restart bot
<code>/restart-commands</code> Restart commands
<code>/delete</code> Delete bot
<code>/init</code>  Initialize bot
<code>/pull</code> Pull repository
<code>/balance</code> Get balance
<code>/positions</code> Get positions
<code>/help</code> Show available commands`,
    { parse_mode: "HTML" }
  );
}

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
    case "/restart-commands":
      restartCommands(id);
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
