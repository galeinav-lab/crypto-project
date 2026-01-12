import {Coin} from "./coin";

export class CoinList {
    private coins: Coin[] = [];
    private filteredCoins: Coin[] = [];

    private readonly favoritesKey = "favorites";
    private readonly maxFavorites = 5;

    setCoins(coins: Coin[]) {
        this.coins = coins;
        this.filteredCoins = coins;
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

    getFavorites(): string[] {
        return JSON.parse(localStorage.getItem(this.favoritesKey) || "[]");
    }

    private saveFavorites(favorites: string[]) {
        localStorage.setItem(this.favoritesKey, JSON.stringify(favorites));
    }

    isFavorite(id: string): boolean {
        return this.getFavorites().includes(id);
    }

    tryAddFavorite(id: string): boolean {
        const favorites = this.getFavorites();

        if (favorites.includes(id)) return true;
        if (favorites.length >= this.maxFavorites) return false;

        favorites.push(id);
        this.saveFavorites(favorites);
        return true;
    }

    removeFavorite(id: string) {
        const favorites = this.getFavorites().filter(x => x !== id);
        this.saveFavorites(favorites);
    }
}
