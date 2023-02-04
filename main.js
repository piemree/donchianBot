const b = require("./helpers/binance");
const ta = require("./helpers/ta");
let lastTime = "";
async function main({
  asset,
  symbol,
  interval,
  slowDonchianPeriod,
  fastDonchianPeriod,
  atrPeriod,
  entryPercentage,
  portion,
}) {
  const [positions, ohlc, balance] = await Promise.all([
    b.findPositions({ symbol }),
    b.getCandles({ symbol, interval, limit: slowDonchianPeriod + 10 }),
    b.getBalance(asset),
  ]);

  const { LongPosition, ShortPosition } = positions;

  let noPosition = !LongPosition && !ShortPosition;

  const donchianChannelsSlow = ta.donchianChannels({
    input: ohlc,
    period: slowDonchianPeriod,
  });
  const donchianChannelsFast = ta.donchianChannels({
    input: ohlc,
    period: fastDonchianPeriod,
  });
  const atrs = ta.atr({ input: ohlc, period: atrPeriod });

  const close = ohlc[ohlc.length - 1].close;
  const time = ohlc[ohlc.length - 1].time;
  const atr = atrs[atrs.length - 1];


  const longCondition = close > donchianChannelsSlow.upper;
  const shortCondition = close < donchianChannelsSlow.lower;
  const longStop = close - atr;
  const shortStop = close + atr;
  const quantity = (balance * entryPercentage) / close;

  if (noPosition) {
    if (longCondition) {
      await b.longPosition({ symbol, quantity, sl: longStop });
    }
    if (shortCondition) {
      await b.shortPosition({ symbol, quantity, sl: shortStop });
    }
  } else {
    if (LongPosition) {
      const quantity = LongPosition.positionAmt;
      if (close < donchianChannelsFast.lower && time != lastTime) {
        await b.closeLong({ symbol, quantity, portion });
        lastTime = time;
      }
      if (true && time != lastTime) {
        await b.closeLong({ symbol, quantity });
        await b.cancelAllOpenOrders({ symbol });
        lastTime = time;
      }
    }
    if (ShortPosition) {
      const quantity = ShortPosition.positionAmt;
      if (close > donchianChannelsFast.upper && time != lastTime) {
        await b.closeShort({ symbol, quantity, portion });
        lastTime = time;
      }
      if (close > donchianChannelsSlow.upper && time != lastTime) {
        await b.closeShort({ symbol, quantity });
        await b.cancelAllOpenOrders({ symbol });
        lastTime = time;
      }
    }
  }
}

module.exports = main;
