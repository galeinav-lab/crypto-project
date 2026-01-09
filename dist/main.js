import { coinManager } from "./coin-manager.js";
import { CoinList } from "./coin-list.js";
const coinList = new CoinList();
let openedDetails = null;
async function renderCoinList() {
    const coins = await coinManager.getCoinList();
    coinList.setCoins(coins);
    const container = document.querySelector("#coins");
    if (!container)
        return;
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
        btn.className = "btn btn-outline-primary btn-sm mt-auto more-info-btn";
        btn.innerText = "More Info";
        btn.dataset.coinId = coin.id;
        const details = document.createElement("div");
        details.className = "coin-details mt-3";
        details.style.display = "none";
        body.appendChild(title);
        body.appendChild(symbol);
        body.appendChild(btn);
        card.appendChild(body);
        card.appendChild(details);
        col.appendChild(card);
        container.appendChild(col);
        btn.onclick = async () => {
            if (openedDetails === details) {
                details.style.display = "none";
                openedDetails = null;
                return;
            }
            if (openedDetails && openedDetails !== details) {
                openedDetails.style.display = "none";
            }
            details.style.display = "block";
            openedDetails = details;
            details.innerHTML = "";
            const progress = document.createElement("div");
            progress.className = "progress";
            progress.style.height = "10px";
            const bar = document.createElement("div");
            bar.className = "progress-bar progress-bar-striped progress-bar-animated";
            bar.style.width = "100%";
            progress.appendChild(bar);
            details.appendChild(progress);
            try {
                const info = await coinManager.getCoinInfo(coin.id);
                details.innerHTML = "";
                const box = document.createElement("div");
                box.className = "details-box";
                const row = document.createElement("div");
                row.className = "details-row";
                const img = document.createElement("img");
                img.className = "coin-thumb";
                img.src = info.imageUrl;
                const prices = document.createElement("div");
                prices.className = "prices";
                prices.innerHTML = `
                    <div><strong>USD:</strong> $${info.usd}</div>
                    <div><strong>EUR:</strong> €${info.eur}</div>
                    <div><strong>ILS:</strong> ₪${info.ils}</div>`;
                row.appendChild(img);
                row.appendChild(prices);
                box.appendChild(row);
                details.appendChild(box);
            }
            catch (e) {
                details.innerHTML = "";
                details.innerText = "Failed to load info";
            }
        };
    });
}
renderCoinList();
