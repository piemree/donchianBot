const main = require("./main");
const config = require("./config");
const { sendMessage } = require("./helpers/telegram");

// create while loop that run every 5 seconds and run the main function

(async () => {
  while (true) {
    console.log("Running main function");
    main(config.botConfig).catch((error) => {
      const today = new Date().toLocaleString();
      console.log(today, error);
      sendMessage(JSON.stringify(error, null, 2));
    });
    await sleep(5000);
  }

  // sleep function
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
})();
