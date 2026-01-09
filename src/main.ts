import { coinManager } from "./coin-manager.js";
import {Coin} from "./coin.js";
import {CoinList} from "./coin-list.js";

const coinList = new CoinList();

async function renderCoinList() {
    const coins:Coin[] = await coinManager.getCoinList();
    coinList.setCoins(coins);
    const container = document.querySelector<HTMLDivElement>("#coins");

    if (!container) return;

    container.innerHTML = "";

    coins.forEach(coin => {
        const col = document.createElement("div");
        col.className = "col-12 col-md-4";

        const card = document.createElement("div");
        card.className = "card h-100 shadow-sm";

        const body = document.createElement("div");
        body.className = "card-body d-flex flex-column";

        const title = document.createElement("h5");
        title.className = "card-title mb-1";
        title.innerText = coin.name;

        const symbol = document.createElement("div");
        symbol.className = "text-muted small mb-3";
        symbol.innerText = coin.symbol.toUpperCase();

        const btn = document.createElement("button");
        btn.className = "btn btn-outline-primary btn-sm mt-auto";
        btn.innerText = "More Info";
        btn.dataset.coinId = coin.id;

        body.appendChild(title);
        body.appendChild(symbol);
        body.appendChild(btn);

        card.appendChild(body);
        col.appendChild(card);
        container.appendChild(col);
    })
}

renderCoinList();


