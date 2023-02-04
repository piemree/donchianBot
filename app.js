const main = require("./main");
const { botConfig } = require("./config");
const { sendMessage } = require("./helpers/telegram");

(async () => {
  try {
    while (true) {
      await main(botConfig);
    }
  } catch (error) {
    console.log(error);
    sendMessage(JSON.stringify(error.body, null, 2));
  }
})();
