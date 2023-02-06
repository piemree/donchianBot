const ta = require("technicalindicators");
function donchianChannels({ input = [], period = 20 }) {
  let upper = 0;
  let middle = 0;
  let lower = 0;
  let last = input.slice(-period);

  upper = Math.max(...last.map((d) => d.high));
  lower = Math.min(...last.map((d) => d.low));
  middle = (upper + lower) / 2;

  return {
    upper,
    middle,
    lower,
  };
}

function atr({ input = [], period = 14 }) {
  const high = input.map((d) => d.high);
  const low = input.map((d) => d.low);
  const close = input.map((d) => d.close);
  return ta.atr({
    high,
    low,
    close,
    period,
  });
}

function rsi({ input = [], period = 14 }) {
  const close = input.map((d) => d.close);
  return ta.rsi({
    values: close,
    period,
  });
}

module.exports = {
  donchianChannels,
  atr,
  rsi,
};
