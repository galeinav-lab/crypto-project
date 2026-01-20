import { Coin } from "./coin.js";
import { CoinInfo } from "./coin-info.js";
class CoinManager {
    constructor() {
        this.coinList = [];
        this.infoCache = new Map();
        this.CACHE_TTL_MS = 2 * 60 * 1000;
        this.infoInFlight = new Map();
        this.listCache = null;
        this.LIST_TTL_MS = 2 * 60 * 1000;
    }
    async getCoinList() {
        if (this.listCache) {
            const age = Date.now() - this.listCache.savedAt;
            if (age < this.LIST_TTL_MS) {
                return this.listCache.coins;
            }
        }
        const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1");
        if (response.ok) {
            const data = await response.json();
            this.coinList = data.map((c) => new Coin(c.id, c.name, c.symbol));
            this.listCache = {
                coins: this.coinList,
                savedAt: Date.now()
            };
            return this.coinList;
        }
        else {
            alert("Too many requests, try again later.");
            throw new Error("Could not fetch coins.");
        }
    }
    async getCoinInfo(id) {
        const cached = this.infoCache.get(id);
        if (cached) {
            const age = Date.now() - cached.savedAt;
            if (age < this.CACHE_TTL_MS) {
                return cached.info;
            }
        }
        const inFlight = this.infoInFlight.get(id);
        if (inFlight) {
            return inFlight;
        }
        const request = (async () => {
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
            if (!response.ok) {
                if (response.status === 429) {
                    console.log(response.status);
                    alert("Rate limit exceeded. Try again later.");
                    throw new Error("Rate limit exceeded. Please wait.");
                }
                throw new Error("Failed to fetch coin info");
            }
            const data = await response.json();
            const imageUrl = data.image?.thumb ?? "";
            const usd = data.market_data?.current_price?.usd ?? 0;
            const eur = data.market_data?.current_price?.eur ?? 0;
            const ils = data.market_data?.current_price?.ils ?? 0;
            const info = new CoinInfo(imageUrl, usd, eur, ils);
            this.infoCache.set(id, {
                info,
                savedAt: Date.now()
            });
            return info;
        })();
        this.infoInFlight.set(id, request);
        try {
            return await request;
        }
        finally {
            this.infoInFlight.delete(id);
        }
    }
}
export const coinManager = new CoinManager();
