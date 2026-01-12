import { coinManager } from "./coin-manager.js";
import { CoinList } from "./coin-list.js";
import { initChartPage, openSingleCoinChart, showList } from "./chart.js";
const coinList = new CoinList();
let openedDetails = null;
let viewMode = "all";
async function loadCoins() {
    const coins = await coinManager.getCoinList();
    coinList.setCoins(coins);
    renderCoinList();
}
async function renderCoinList() {
    let coins = coinList.getCoins();
    if (viewMode === "favorites") {
        coins = coins.filter(c => coinList.isFavorite(c.id));
    }
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
        const titleRow = document.createElement("div");
        titleRow.className = "title-row";
        const title = document.createElement("h5");
        title.className = "card-title mb-0";
        title.innerText = coin.name;
        const star = document.createElement("i");
        star.className = "bi bi-star fav-star";
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
        function syncStar() {
            const isFav = coinList.isFavorite(coin.id);
            star.classList.toggle("bi-star", !isFav);
            star.classList.toggle("bi-star-fill", isFav);
            star.classList.toggle("on", isFav);
        }
        syncStar();
        star.onclick = () => {
            const isFav = coinList.isFavorite(coin.id);
            if (!isFav) {
                const ok = coinList.tryAddFavorite(coin.id);
                if (!ok) {
                    alert("You can add up to 5 Favorites");
                    return;
                }
            }
            else {
                coinList.removeFavorite(coin.id);
            }
            syncStar();
            if (viewMode === "favorites") {
                renderCoinList();
            }
        };
        const chartBtn = document.createElement("button");
        chartBtn.className = "btn btn-outline-primary btn-sm mt-2";
        chartBtn.innerText = "Chart";
        chartBtn.onclick = async () => {
            await openSingleCoinChart(coin.symbol.toUpperCase());
        };
        titleRow.appendChild(title);
        titleRow.appendChild(star);
        body.appendChild(titleRow);
        body.appendChild(symbol);
        body.appendChild(btn);
        body.appendChild(chartBtn);
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
const searchInput = document.querySelector("#searchInput");
const searchBtn = document.querySelector("#searchBtn");
const clearBtn = document.querySelector("#clearBtn");
if (searchBtn) {
    searchBtn.onclick = () => {
        const term = searchInput?.value || "";
        coinList.search(term);
        renderCoinList();
    };
}
if (clearBtn) {
    clearBtn.onclick = () => {
        if (searchInput)
            searchInput.value = "";
        coinList.clearSearch();
        renderCoinList();
    };
}
const homeBtn = document.querySelector("#homeBtn");
const favoritesBtn = document.querySelector("#favoritesBtn");
if (homeBtn) {
    homeBtn.onclick = () => {
        showList();
        viewMode = "all";
        renderCoinList();
    };
}
if (favoritesBtn) {
    favoritesBtn.onclick = () => {
        showList();
        viewMode = "favorites";
        renderCoinList();
    };
}
initChartPage({
    coinsSectionSelector: "#coins",
    chartSectionSelector: "#chartSection",
    chartContainerSelector: "#tvChart",
    backButtonSelector: "#backToListBtn",
    titleSelector: "#chartTitle",
    onBackToList: () => {
        renderCoinList();
    },
});
loadCoins();
