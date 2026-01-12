export class CoinList {
    constructor() {
        this.coins = [];
        this.filteredCoins = [];
        this.favoritesKey = "favorites";
        this.maxFavorites = 5;
    }
    setCoins(coins) {
        this.coins = coins;
        this.filteredCoins = coins;
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
    getFavorites() {
        return JSON.parse(localStorage.getItem(this.favoritesKey) || "[]");
    }
    saveFavorites(favorites) {
        localStorage.setItem(this.favoritesKey, JSON.stringify(favorites));
    }
    isFavorite(id) {
        return this.getFavorites().includes(id);
    }
    tryAddFavorite(id) {
        const favorites = this.getFavorites();
        if (favorites.includes(id))
            return true;
        if (favorites.length >= this.maxFavorites)
            return false;
        favorites.push(id);
        this.saveFavorites(favorites);
        return true;
    }
    removeFavorite(id) {
        const favorites = this.getFavorites().filter(x => x !== id);
        this.saveFavorites(favorites);
    }
}
