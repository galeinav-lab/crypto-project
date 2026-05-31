# CryptoScope

A small dashboard for browsing the top 100 cryptocurrencies. You can search coins, mark favorites, check prices in USD/EUR/ILS, and open a live candlestick chart per coin.

Built in TypeScript with vanilla DOM and Bootstrap. No framework.

## Live data sources

- [CoinGecko](https://www.coingecko.com/en/api) — coin list and price details
- [CryptoCompare](https://min-api.cryptocompare.com/) — minute-level history and live price for the chart
- [Lightweight Charts](https://tradingview.github.io/lightweight-charts/) for rendering

## Features

- Top 100 coins from CoinGecko's market endpoint
- Search by symbol (live, as you type)
- Favorites with a 5-coin limit, persisted in `localStorage`. If you try to add a 6th, a modal pops up and lets you remove an existing one to make room
- "More Info" expander on each card showing thumbnail + prices in 3 currencies
- Per-coin chart page: 180 minutes of history + a 2-second polling loop that builds the current bar in real time
- About page

## Why the caching

CoinGecko's free tier rate-limits quickly. Two things help:

- `coin-manager.ts` caches both the coin list and per-coin info for 2 minutes
- In-flight requests are de-duped, so spamming "More Info" on the same coin doesn't fire multiple fetches

If a 429 still slips through, the user gets an alert instead of a silent failure.

## Run it

```bash
npm install
npm run build
```

Then open `public/index.html` in a browser. The HTML loads the compiled JS from `../dist/main.js`, so you need to build first.

For development, run `tsc --watch` in one terminal and use any static server (Live Server, `python -m http.server`, etc.) pointed at the project root.

## Project layout

```
src/
  main.ts          entry point, DOM wiring, navigation, favorites modal
  coin-manager.ts  fetch + cache layer (singleton)
  coin-list.ts     in-memory list, search, favorites in localStorage
  coin.ts          Coin model
  coin-info.ts     CoinInfo model (image + prices)
  chart.ts         chart page, history fetch, live polling loop
public/
  index.html
  styles.css
  assets/          background video, icons
```

## Notes / things I'd change

- Search only matches symbol, not name — easy to extend
- The chart polls every 2s using `setInterval`; a WebSocket source would be cleaner but adds complexity
- All DOM is built imperatively. Fine at this scale, but a templating step would help if the UI grows
- Favorites limit (5) is hardcoded in `CoinList`

## Author

Gal Einav — coursework project.
