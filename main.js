const b = require("./helpers/binance");
const ta = require("./helpers/ta");

async function main({
  asset,
  symbol,
  interval,
  slowDonchianPeriod,
  fastDonchianPeriod,
  atrPeriod,
  rsiPeriod,
  rsiUpper,
  rsiLower,
  entryPercentage,
  portion,
}) {
  const [positions, balance, ohlc] = await Promise.all([
    b.findPositions({ symbol }),
    b.getBalance(asset),
    b.getCandles({
      symbol,
      interval,
      limit: slowDonchianPeriod + 10,
    }),
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

  const close = ohlc[ohlc.length - 1].close;

  if (noPosition) {
    const atrs = ta.atr({ input: ohlc, period: atrPeriod });
    const rsis = ta.rsi({ input: ohlc, period: rsiPeriod });
    const rsi = rsis[rsis.length - 1];
    const atr = atrs[atrs.length - 1];
    const longCondition = rsi > rsiUpper;
    const shortCondition = rsi < rsiLower;
    const longStop = close - atr;
    const shortStop = close + atr;
    const quantity = parseFloat((balance * entryPercentage) / close);
    if (longCondition) {
      await b.longPosition({ symbol, quantity, sl: longStop });
    }
    if (shortCondition) {
      await b.shortPosition({ symbol, quantity, sl: shortStop });
    }
  } else {
    if (LongPosition) {
      const quantity = Math.abs(parseFloat(LongPosition?.positionAmt));
      if (close < donchianChannelsFast.lower) {
        await b.closeLong({ symbol, quantity, portion });
      }
      if (close < donchianChannelsSlow.lower) {
        await b.closeLong({ symbol, quantity });
        await b.cancelAllOpenOrders({ symbol });
      }
    }
    if (ShortPosition) {
      const quantity = Math.abs(parseFloat(ShortPosition?.positionAmt));
      if (close > donchianChannelsFast.upper) {
        await b.closeShort({ symbol, quantity, portion });
      }
      if (close > donchianChannelsSlow.upper) {
        await b.closeShort({ symbol, quantity });
        await b.cancelAllOpenOrders({ symbol });
      }
    }
  }
}

module.exports = main;
