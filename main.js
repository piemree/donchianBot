const b = require("./helpers/binance");
const ta = require("./helpers/ta");

async function main({
  asset,
  symbol,
  interval,
  atrPeriod,
  rsiPeriod,
  rsiUpper,
  rsiLower,
  entryMaPeriod,
  exitMaPeriod,
  entryAtrMultiplier,
  exitAtrMultiplier,
  entryPercentage,
}) {
  const [positions, balance, ohlc] = await Promise.all([
    b.findPositions({ symbol }),
    b.getBalance(asset),
    b.getCandles({
      symbol,
      interval,
      limit: entryMaPeriod + exitMaPeriod,
    }),
  ]);

  const { LongPosition, ShortPosition } = positions;

  let noPosition = !LongPosition && !ShortPosition;

  const close = ohlc[ohlc.length - 1].close;

  if (noPosition) {
    const atrs = ta.atr({ input: ohlc, period: atrPeriod });
    const rsis = ta.rsi({ input: ohlc, period: rsiPeriod });
    const entryMas = ta.sma({ input: ohlc, period: entryMaPeriod });
    const exitMas = ta.sma({ input: ohlc, period: exitMaPeriod });
    const rsi = rsis[rsis.length - 1];
    const atr = atrs[atrs.length - 1];
    const entryMa = entryMas[entryMas.length - 1];
    const exitMa = exitMas[exitMas.length - 1];
    const entryAtrValue = atr * entryAtrMultiplier;
    const exitAtrValue = atr * exitAtrMultiplier;
    const entryLongMatr = entryMa + entryAtrValue;
    const entryShortMatr = entryMa - entryAtrValue;
    const exitLongMatr = exitMa - exitAtrValue;
    const exitShortMatr = exitMa + exitAtrValue;

    const longCondition = rsi > rsiUpper && close > entryLongMatr;
    const shortCondition = rsi < rsiLower && close < entryShortMatr;
    const exitLongCondition = close < exitLongMatr;
    const exitShortCondition = close > exitShortMatr;

    const quantity = parseFloat((balance * entryPercentage) / close);
    if (longCondition) {
      await b.longPosition({ symbol, quantity });
    }
    if (shortCondition) {
      await b.shortPosition({ symbol, quantity });
    }
  } else {
    if (LongPosition) {
      const quantity = Math.abs(parseFloat(LongPosition?.positionAmt));
      if (exitLongCondition) {
        await b.closeLong({ symbol, quantity });
      }
    }
    if (ShortPosition) {
      const quantity = Math.abs(parseFloat(ShortPosition?.positionAmt));
      if (exitShortCondition) {
        await b.closeShort({ symbol, quantity });
      }
    }
  }
}

module.exports = main;
