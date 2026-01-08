import { coinManager } from "./coin-manager.js";
import {Coin} from "./coin.js";

async function main() {
    const coins:Coin[] = await coinManager.getCoinList();
    console.log(coins);
}

main();