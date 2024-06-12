module.exports = {
  API_KEY: process.env.API_KEY,
  API_SECRET: process.env.API_SECRET,
  baseUrl: "https://fapi.binance.com",
  telegram: {
    chatId: process.env.TELEGRAM_CHAT_ID,
    token: process.env.TELEGRAM_TOKEN,
  },
  botConfig: {
    asset: "USDT",
    symbol: "ETHUSDT",
    interval: "1h",
    atrPeriod: 14,
    rsiPeriod: 14,
    rsiUpper: 70,
    rsiLower: 30,
    entryMaPeriod: 3,
    exitMaPeriod: 40,
    entryAtrMultiplier: 2,
    exitAtrMultiplier: 2,
    entryPercentage: 0.50,
  },
};
