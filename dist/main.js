import { coinManager } from "./coin-manager.js";
import { CoinList } from "./coin-list.js";
import { initChartPage, openSingleCoinChart, showList } from "./chart.js";
const coinList = new CoinList();
let openedDetails = null;
let viewMode = "all";
async function loadCoins() {
    try {
        const coins = await coinManager.getCoinList();
        coinList.setCoins(coins);
        renderCoinList();
    }
    catch (err) {
        alert("Too many requests try again later.");
        console.error(err);
    }
}
async function renderCoinList() {
    let coins = coinList.getFilteredCoins();
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
        const chartBtn = document.createElement("button");
        chartBtn.className = "btn btn-outline-primary btn-sm mt-2";
        chartBtn.innerText = "Chart";
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
                    openFavoritesLimitModal(coin.id);
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
        chartBtn.onclick = async () => {
            await openSingleCoinChart(coin.symbol.toUpperCase());
        };
        titleRow.appendChild(title);
        titleRow.appendChild(star);
        body.appendChild(titleRow);
        body.appendChild(symbol);
        body.appendChild(chartBtn);
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
            catch (err) {
                details.innerHTML = "";
                details.innerText = "Too many requests try again later.";
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
        if (searchInput) {
            searchInput.value = "";
        }
        coinList.clearSearch();
        renderCoinList();
    };
}
if (searchInput) {
    searchInput.addEventListener("input", () => {
        const term = searchInput.value || "";
        coinList.search(term);
        renderCoinList();
    });
}
const homeBtn = document.querySelector("#homeBtn");
const favoritesBtn = document.querySelector("#favoritesBtn");
const aboutBtn = document.querySelector("#aboutBtn");
const aboutSection = document.querySelector("#aboutSection");
const coinsSection = document.querySelector("#coins");
function showPage(page) {
    if (coinsSection)
        coinsSection.style.display = page === "coins" ? "flex" : "none";
    if (aboutSection)
        aboutSection.style.display = page === "about" ? "block" : "none";
    window.scrollTo({ top: 0, behavior: "smooth" });
}
if (homeBtn) {
    homeBtn.onclick = () => {
        showList();
        viewMode = "all";
        renderCoinList();
        showPage("coins");
    };
}
if (favoritesBtn) {
    favoritesBtn.onclick = () => {
        showList();
        viewMode = "favorites";
        renderCoinList();
        showPage("coins");
    };
}
if (aboutBtn) {
    aboutBtn.onclick = () => {
        showPage("about");
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
let pendingFavoriteId = null;
function openFavoritesLimitModal(requestedCoinId) {
    pendingFavoriteId = requestedCoinId;
    const list = document.querySelector("#favoritesModalList");
    if (!list)
        return;
    list.innerHTML = "";
    const favCoins = coinList.getCoins().filter(c => coinList.isFavorite(c.id));
    favCoins.forEach(c => {
        const item = document.createElement("div");
        item.className = "list-group-item";
        const left = document.createElement("div");
        left.innerHTML = `<strong>${c.symbol.toUpperCase()}</strong> <div class="text-muted">(${c.name})</div>`;
        const removeBtn = document.createElement("button");
        removeBtn.className = "btn btn-outline-danger btn-sm";
        removeBtn.innerText = "Remove";
        removeBtn.onclick = () => {
            coinList.removeFavorite(c.id);
            renderCoinList();
            if (pendingFavoriteId) {
                const ok = coinList.tryAddFavorite(pendingFavoriteId);
                if (ok) {
                    pendingFavoriteId = null;
                    renderCoinList();
                    const modalEl = document.getElementById("favoritesLimitModal");
                    const modal = window.bootstrap.Modal.getInstance(modalEl);
                    modal?.hide();
                    document.activeElement?.blur();
                }
                else {
                    openFavoritesLimitModal(pendingFavoriteId);
                }
            }
            else {
                openFavoritesLimitModal(requestedCoinId);
            }
        };
        item.appendChild(left);
        item.appendChild(removeBtn);
        list.appendChild(item);
    });
    const modalEl = document.getElementById("favoritesLimitModal");
    const modal = new window.bootstrap.Modal(modalEl);
    modal.show();
}
loadCoins();
