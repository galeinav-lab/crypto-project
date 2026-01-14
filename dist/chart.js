let activeSection = "list";
let chart = null;
let candleSeries = null;
let liveTimer = null;
let currentSymbol = null;
let coinsSection = null;
let chartSection = null;
let tvChartEl = null;
let backToListBtn = null;
let chartTitleEl = null;
let onBackToList = null;
export function initChartPage(options) {
    coinsSection = document.querySelector(options.coinsSectionSelector);
    chartSection = document.querySelector(options.chartSectionSelector);
    tvChartEl = document.querySelector(options.chartContainerSelector);
    backToListBtn = document.querySelector(options.backButtonSelector);
    chartTitleEl = document.querySelector(options.titleSelector);
    onBackToList = options.onBackToList;
    if (backToListBtn) {
        backToListBtn.onclick = () => {
            showList();
            onBackToList?.();
        };
    }
}
export function showList() {
    activeSection = "list";
    stopLive();
    if (coinsSection)
        coinsSection.style.display = "flex";
    if (chartSection)
        chartSection.style.display = "none";
}
export function showChart() {
    activeSection = "chart";
    if (coinsSection)
        coinsSection.style.display = "none";
    if (chartSection)
        chartSection.style.display = "block";
}
export async function openSingleCoinChart(symbol) {
    currentSymbol = symbol.toUpperCase();
    showChart();
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (chartTitleEl)
        chartTitleEl.textContent = `${currentSymbol} / USD`;
    if (!tvChartEl)
        return;
    tvChartEl.innerHTML = "";
    const LW = window.LightweightCharts;
    if (!LW) {
        throw new Error("LightweightCharts is not loaded. Check index.html script tag.");
    }
    chart = LW.createChart(tvChartEl, {
        height: 420,
        layout: {
            background: { color: "transparent" },
            textColor: "#ffffff",
        },
        grid: {
            vertLines: { color: "rgba(255,255,255,0.08)" },
            horzLines: { color: "rgba(255,255,255,0.08)" },
        },
        rightPriceScale: { borderColor: "rgba(255,255,255,0.15)" },
        timeScale: { borderColor: "rgba(255,255,255,0.15)" },
        crosshair: { mode: 1 },
    });
    candleSeries = chart.addSeries(window.LightweightCharts.CandlestickSeries);
    const history = await fetchMinuteHistory(currentSymbol, 180);
    candleSeries.setData(history);
    chart.timeScale().fitContent();
    startLive(currentSymbol);
}
async function fetchMinuteHistory(symbol, limit) {
    const url = `https://min-api.cryptocompare.com/data/v2/histominute?fsym=${symbol}&tsym=USD&limit=${limit}`;
    const response = await fetch(url);
    const json = await response.json();
    const data = json?.Data?.Data || [];
    return data.map((c) => ({
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
    }));
}
async function fetchCurrentPrice(symbol) {
    const url = `https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USD`;
    const res = await fetch(url);
    const json = await res.json();
    const price = json?.USD;
    return typeof price === "number" ? price : null;
}
let currentBar = null;
let currentBarTime = null;
function startLive(symbol) {
    stopLive();
    currentBar = null;
    currentBarTime = null;
    liveTimer = window.setInterval(async () => {
        try {
            if (activeSection !== "chart")
                return;
            if (currentSymbol !== symbol)
                return;
            const price = await fetchCurrentPrice(symbol);
            if (price === null)
                return;
            const nowSec = Math.floor(Date.now() / 1000);
            const barTime = Math.floor(nowSec / 60) * 60;
            if (currentBarTime === null || currentBarTime !== barTime) {
                currentBarTime = barTime;
                const open = currentBar?.close ?? price;
                currentBar = {
                    time: barTime,
                    open,
                    high: price,
                    low: price,
                    close: price,
                };
                candleSeries.update(currentBar);
                return;
            }
            if (!currentBar)
                return;
            currentBar.high = Math.max(currentBar.high, price);
            currentBar.low = Math.min(currentBar.low, price);
            currentBar.close = price;
            candleSeries.update(currentBar);
        }
        catch (e) {
            console.log("Live update failed", e);
        }
    }, 2000);
}
function stopLive() {
    if (liveTimer !== null) {
        clearInterval(liveTimer);
        liveTimer = null;
    }
}
