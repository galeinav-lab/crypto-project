import { coinManager } from "./coin-manager.js";
import { CoinList } from "./coin-list";
const coinList = new CoinList();
async function main() {
    const coins = await coinManager.getCoinList();
    coinList.setCoins(coins);
}
main();
