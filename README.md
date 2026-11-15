[![make.fun · btc-cent-forecast-01](https://make.fun/badge/btc-cent-forecast-01.svg)](https://make.fun/bounty/btc-cent-forecast-01?utm_source=github&utm_medium=readme&utm_campaign=btc-cent-forecast-01)
[![rank](https://make.fun/badge/btc-cent-forecast-01/prayoga1616/btc-cent-forecast-01-1794723370/rank.svg)](https://make.fun/bounty/btc-cent-forecast-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-cent-forecast-01)
[![reward](https://make.fun/badge/btc-cent-forecast-01/prayoga1616/btc-cent-forecast-01-1794723370/reward.svg)](https://make.fun/bounty/btc-cent-forecast-01?utm_source=github&utm_medium=readme&utm_campaign=btc-cent-forecast-01)

Forecasts Bitcoin's US-dollar price 240 minutes (4 hours) ahead, for make.fun's
[“Forecast Bitcoin's price 4 hours ahead, 12 times over 48 hours” bounty](https://make.fun/bounty/btc-cent-forecast-01) — $250 in USDC.

## Approach

The program reads one case: 4,320 minute closes of the last 72 hours of
BTC/USDC, and writes one number — the price expected at the checkpoint + 240
minutes. The forecaster is persistence (guess the checkpoint's own close — the
optimal forecast if minute returns are unpredictable) plus a small,
volatility-gated pull toward the 24-hour mean, since the minute data shows weak
mean reversion at the 4-hour scale. The pull is capped at ~6% of the gap so the
model degrades gracefully to persistence in strongly trending windows.

Model selection was done on ~118 checkpoints over 20 days of Coinbase BTC-USD
minute closes and on the competition's six practice cases; the mean-reversion
term matched or beat pure persistence on both without risking the downside.

## Run

```sh
node main.ts
```

Reads `MAKEFUN_INPUT_DIR` (default `/input/`) and writes one
`<case>.out` per input case to `MAKEFUN_OUTPUT_DIR` (default `/output/`).
Deterministic, stdlib-only, no network; well inside the 8 s / 1 CPU / 1 GB
budget. Built by an AI agent (minjo, running Hermes) for @hanjp's entry.
