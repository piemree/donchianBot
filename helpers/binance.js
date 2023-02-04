const { USDMClient } = require("binance");
const moment = require("moment");
const config = require("../config");
const telegram = require("./telegram");

const client = new USDMClient({
  api_key: config.API_KEY,
  api_secret: config.API_SECRET,
  baseUrl: config.baseUrl,
});


async function getBalance(asset = "USDT") {
  const balance = await client.getBalance();
  return parseFloat(balance.find((b) => b.asset === asset).balance);
}

async function getCandles({ symbol, interval, limit }) {
  const klines = await client.getKlines({
    symbol,
    interval,
    limit,
  });
  klines.pop();
  const candles = klines.map((kline, i, arr) => {
    return {
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
      time: moment(kline[0]).format("YYYY-MM-DD HH:mm:ss"),
    };
  });

  return candles;
}
async function longPosition({ symbol, sl, quantity }) {
  const result = await client.submitMultipleOrders([
    {
      symbol: symbol,
      side: "BUY",
      type: "MARKET",
      quantity: quantity.toFixed(3),
    },
    {
      symbol: symbol,
      side: "SELL",
      type: "STOP_MARKET",
      quantity: quantity.toFixed(3),
      stopPrice: sl.toFixed(1),
    },
  ]);

  telegram.sendMessage(
    `ENTER LONG POSITION WITH STOP LOSS:
    ${JSON.stringify(result, null, 2)}`
  );
}
async function shortPosition({ symbol, sl, quantity }) {
  const result = await client.submitMultipleOrders([
    {
      symbol: symbol,
      side: "SELL",
      type: "MARKET",
      quantity: quantity.toFixed(3),
    },
    {
      symbol: symbol,
      side: "BUY",
      type: "STOP_MARKET",
      quantity: quantity.toFixed(3),
      stopPrice: sl.toFixed(1),
    },
  ]);
  telegram.sendMessage(
    `ENTER SHORT POSITION WITH STOP LOSS:
    ${JSON.stringify(result, null, 2)}`
  );
}
async function closeLong({ symbol, quantity, portion = 1 }) {
  if (portion < 1) {
    const result = await client.submitNewOrder({
      symbol: symbol,
      side: "SELL",
      type: "MARKET",
      quantity: (quantity * portion).toFixed(3),
    });
    telegram.sendMessage(
      `LONG POSITION CLOSED PARTIALLY (${portion * 100}%):
      ${JSON.stringify(result, null, 2)}`
    );
  } else {
    const result = await client.submitNewOrder({
      symbol: symbol,
      side: "SELL",
      type: "MARKET",
      quantity: quantity,
    });

    telegram.sendMessage(
      `LONG POSITION CLOSED:
      ${JSON.stringify(result, null, 2)}`
    );
  }
}
async function closeShort({ symbol, quantity, portion = 1 }) {
  if (portion < 1) {
    const result = await client.submitNewOrder({
      symbol: symbol,
      side: "BUY",
      type: "MARKET",
      quantity: (quantity * portion).toFixed(3),
    });
    telegram.sendMessage(
      `SHORT POSITION CLOSED PARTIALLY (${portion * 100}%):
      ${JSON.stringify(result, null, 2)}`
    );
  } else {
    const result = await client.submitNewOrder({
      symbol: symbol,
      side: "BUY",
      type: "MARKET",
      quantity: quantity,
    });

    telegram.sendMessage(
      `SHORT POSITION CLOSED:
      ${JSON.stringify(result, null, 2)}`
    );
  }
}
async function cancelAllOpenOrders({ symbol }) {
  return await client.cancelAllOpenOrders({ symbol: symbol });
}
async function findPositions({ symbol }) {
  const positions = await client.getPositions({ symbol });
  let LongPosition = positions.find(
    (p) => p.positionAmt > 0 && p.symbol == symbol
  );
  let ShortPosition = positions.find(
    (p) => p.positionAmt < 0 && p.symbol == symbol
  );
  return { LongPosition, ShortPosition };
}

module.exports = {
  getBalance,
  getCandles,
  longPosition,
  shortPosition,
  closeLong,
  closeShort,
  cancelAllOpenOrders,
  findPositions,
};
