const main = require("./main");
const config = require("./config");
const { sendMessage } = require("./helpers/telegram");

const { WebsocketClient } = require("binance");

const wsClient = new WebsocketClient({
  api_key: config.API_KEY,
  api_secret: config.API_SECRET,
  beautify: true,
});

wsClient.subscribeKlines(
  config.botConfig.symbol,
  config.botConfig.interval,
  "usdm"
);

wsClient.on("message", (msg) => {
  if (msg?.k?.x || true) {
    main(config.botConfig).catch((error) => {
      const today = new Date().toLocaleString();
      console.log(today, error);
      sendMessage(JSON.stringify(error, null, 2));
    });
  }
});
