import {Coin} from "./coin.js";

class CoinManager {
    coinList: Coin[] = [];

    async getCoinList(): Promise<Coin[]> {
        const response = await
            fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1");
        if (response.ok) {
            const data = await response.json();
            this.coinList = data.map((c: any) => new Coin(c.id, c.name, c.symbol));
            return this.coinList;
        }
        else {
            throw new Error("Something went wrong");
        }
    }
}

export const coinManager = new CoinManager();