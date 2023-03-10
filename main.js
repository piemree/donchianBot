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
  const atrs = ta.atr({ input: ohlc, period: atrPeriod });
  const rsis = ta.rsi({ input: ohlc, period: rsiPeriod });
  const rsi = rsis[rsis.length - 1];
  const atr = atrs[atrs.length - 1];
  if (noPosition) {
    const entryMas = ta.sma({ input: ohlc, period: entryMaPeriod });
    const entryMa = entryMas[entryMas.length - 1];
    const entryAtrValue = atr * entryAtrMultiplier;
    const entryLongMatr = entryMa + entryAtrValue;
    const entryShortMatr = entryMa - entryAtrValue;
    const longCondition = rsi > rsiUpper && close > entryLongMatr;
    const shortCondition = rsi < rsiLower && close < entryShortMatr;

    const quantity = parseFloat((balance * entryPercentage) / close);
    if (longCondition) {
      await b.longPosition({ symbol, quantity });
    }
    if (shortCondition) {
      await b.shortPosition({ symbol, quantity });
    }
  } else {
    const exitMas = ta.sma({ input: ohlc, period: exitMaPeriod });
    const exitMa = exitMas[exitMas.length - 1];
    const exitAtrValue = atr * exitAtrMultiplier;
    const exitLongMatr = exitMa - exitAtrValue;
    const exitShortMatr = exitMa + exitAtrValue;
    const exitLongCondition = close < exitLongMatr;
    const exitShortCondition = close > exitShortMatr;

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
