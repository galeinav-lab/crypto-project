import {Coin} from "./coin";

export class CoinList {
    coins: Coin[] = [];

    setCoins(coins: Coin[]) {
        this.coins = coins;
    }
}