export class CoinList {
    constructor() {
        this.coins = [];
        this.filteredCoins = [];
    }
    setCoins(coins) {
        this.coins = coins;
        this.filteredCoins = coins; // ברירת מחדל = הכל
    }
    getCoins() {
        return this.filteredCoins;
    }
    search(term) {
        const value = term.trim().toLowerCase();
        if (!value) {
            this.filteredCoins = this.coins;
            return;
        }
        this.filteredCoins = this.coins.filter(c => c.name.toLowerCase().includes(value) ||
            c.symbol.toLowerCase().includes(value));
    }
    clearSearch() {
        this.filteredCoins = this.coins;
    }
}
