const TelegramBot = require("node-telegram-bot-api");
const { telegram, botConfig } = require("./config");
const b = require("./helpers/binance");
const exec = require("child_process").exec;

const bot = new TelegramBot(telegram.token, { polling: true });

bot.onText(/stop/, (msg) => {
  bot.sendMessage(msg.chat.id, "Trade Bot Stopping...");
  exec("pm2 stop bot && pm2 save", (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(msg.chat.id, "Failed to stop Trade Bot.");
    } else {
      bot.sendMessage(msg.chat.id, "Trade Bot Stopped Successfully.");
    }
  });
});

bot.onText(/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Trade Bot Starting...");
  exec("pm2 start bot && pm2 save", (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(msg.chat.id, "Failed to start Trade Bot.");
    } else {
      bot.sendMessage(msg.chat.id, "Trade Bot Started Successfully.");
    }
  });
});

bot.onText(/delete/, (msg) => {
  bot.sendMessage(msg.chat.id, "Trade Bot Deleting...");
  exec("pm2 delete bot && pm2 save", (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(msg.chat.id, "Failed to delete Trade Bot.");
    } else {
      bot.sendMessage(msg.chat.id, "Trade Bot Deleted Successfully.");
    }
  });
});

bot.onText(/init/, (msg) => {
  bot.sendMessage(msg.chat.id, "Trade Bot Initializing...");
  exec("pm2 start app.js --name bot && pm2 save", (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(msg.chat.id, "Failed to initialize Trade Bot.");
    } else {
      bot.sendMessage(msg.chat.id, "Trade Bot Initialized Successfully.");
    }
  });
});

bot.onText(/restart/, (msg) => {
  bot.sendMessage(msg.chat.id, "Trade Bot Restarting...");
  exec("pm2 restart bot && pm2 save", (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(msg.chat.id, "Failed to restart Trade Bot.");
    } else {
      bot.sendMessage(msg.chat.id, "Trade Bot Restarted Successfully.");
    }
  });
});

bot.onText(/balance/, (msg) => {
  b.getBalance().then((balance) => {
    bot.sendMessage(msg.chat.id, balance);
  });
});

bot.onText(/positions/, (msg) => {
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
});

// fetch repository and restart bot
bot.onText(/update/, (msg) => {
  bot.sendMessage(msg.chat.id, "Fetching repository...");
  exec("git pull", (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(msg.chat.id, "Failed to fetch.");
    } else {
      bot.sendMessage(msg.chat.id, "Fetch Successfully.");
      exec("pm2 restart bot && pm2 save", (error, stdout, stderr) => {
        if (error) {
          bot.sendMessage(msg.chat.id, "Failed to restart Trade Bot.");
        } else {
          bot.sendMessage(msg.chat.id, "Trade Bot Restarted Successfully.");
          exec("pm2 restart commads && pm2 save", (error, stdout, stderr) => {
            if (error) {
              bot.sendMessage(msg.chat.id, "Failed to restart Commads.");
            } else {
              bot.sendMessage(msg.chat.id, "Commads Restarted Successfully.");
            }
          });
        }
      });
    }
  });
});

// send available commands when /help is received
bot.onText(/help/, (msg) => {
  // send as html available commands
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
    <code>/restart</code> - restart trade bot
    <code>/update</code> - update trade bot
    <code>/help</code> - show available commands
    `,
    { parse_mode: "HTML" }
  );
});
