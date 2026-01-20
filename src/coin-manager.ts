import { Coin } from "./coin.js";
import { CoinInfo } from "./coin-info.js";

type CacheEntry = {
    info: CoinInfo;
    savedAt: number;
};

class CoinManager {
    coinList: Coin[] = [];

    private infoCache: Map<string, CacheEntry> = new Map();
    private readonly CACHE_TTL_MS = 2 * 60 * 1000;
    private infoInFlight: Map<string, Promise<CoinInfo>> = new Map();
    private listCache: { coins: Coin[]; savedAt: number } | null = null;
    private readonly LIST_TTL_MS = 2 * 60 * 1000;

    async getCoinList(): Promise<Coin[]> {
        if (this.listCache) {
            const age = Date.now() - this.listCache.savedAt;
            if (age < this.LIST_TTL_MS) {
                return this.listCache.coins;
            }
        }

        const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1");
        if (response.ok) {
            const data = await response.json();
            this.coinList = data.map((c: any) => new Coin(c.id, c.name, c.symbol));

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

    async getCoinInfo(id: string): Promise<CoinInfo> {
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

            const imageUrl: string = data.image?.thumb ?? "";
            const usd: number = data.market_data?.current_price?.usd ?? 0;
            const eur: number = data.market_data?.current_price?.eur ?? 0;
            const ils: number = data.market_data?.current_price?.ils ?? 0;

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
        } finally {
            this.infoInFlight.delete(id);
        }
    }
}

export const coinManager = new CoinManager();

