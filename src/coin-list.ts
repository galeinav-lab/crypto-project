import {Coin} from "./coin";

export class CoinList {
    private coins: Coin[] = [];
    private filteredCoins: Coin[] = [];

    setCoins(coins: Coin[]) {
        this.coins = coins;
        this.filteredCoins = coins; // ברירת מחדל = הכל
    }

    getCoins(): Coin[] {
        return this.filteredCoins;
    }

    search(term: string) {
        const value = term.trim().toLowerCase();

        if (!value) {
            this.filteredCoins = this.coins;
            return;
        }

        this.filteredCoins = this.coins.filter(c =>
            c.name.toLowerCase().includes(value) ||
            c.symbol.toLowerCase().includes(value)
        );
    }

    clearSearch() {
        this.filteredCoins = this.coins;
    }
}