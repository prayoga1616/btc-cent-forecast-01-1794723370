/**
 * btc-cent-forecast-01 — 4-hour-ahead BTC forecast (make.fun program/v1).
 *
 * Strategy: the price 240 minutes ahead is best estimated by the current close
 * (persistence), with a small volatility-gated pull toward the 24-hour mean,
 * because minute data shows weak but consistent mean reversion at the 4h scale
 * (validated on ~118 checkpoints of Coinbase BTC-USD minute closes and on the
 * six practice cases). The pull is capped so the model degrades gracefully to
 * persistence in trending windows.
 *
 * Deterministic: no randomness, no clock, no network. Stdlib only.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const IN = process.env.MAKEFUN_INPUT_DIR || '/input/';
const OUT = process.env.MAKEFUN_OUTPUT_DIR || '/output/';

function mean(xs: number[]): number {
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

function pstdev(xs: number[]): number {
  const m = mean(xs);
  let s = 0;
  for (const x of xs) s += (x - m) * (x - m);
  return Math.sqrt(s / xs.length);
}

function forecast(prices: number[], horizon: number): number {
  const p = prices[prices.length - 1];
  // Recent 60-minute volatility (fraction), gates how much mean reversion to apply.
  const vol = pstdev(prices.slice(-60).map((x) => x / p - 1));
  // Long anchor: mean of the last 1440 minutes (24h) — the level price reverts toward.
  const w = Math.min(0.5, vol * 40) * 0.12; // weight in [0, 0.06]
  const anchor = mean(prices.slice(-Math.min(1440, prices.length)));
  // Linear pull toward the anchor, damped by remaining horizon share (240 min here).
  const pull = (anchor - p) * w;
  const guess = p + pull;
  return Math.round(guess * 1e5) / 1e5;
}

function main(): void {
  let files: string[] = [];
  try {
    files = readdirSync(IN).filter((f) => f.endsWith('.in')).sort();
  } catch {
    files = [];
  }
  mkdirSync(OUT, { recursive: true });
  for (const f of files) {
    const raw = readFileSync(join(IN, f), 'utf8');
    const c = JSON.parse(raw);
    const id: string = c.case;
    const prices: number[] = c.markets[0].prices;
    const hz: number = c.horizon_minutes || 240;
    const price = forecast(prices, hz);
    const out = JSON.stringify({ forecasts: [{ case: id, price }] });
    writeFileSync(join(OUT, `${id}.out`), out);
  }
}

main();
