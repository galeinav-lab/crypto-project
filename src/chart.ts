type Section = "list" | "chart";

let activeSection: Section = "list";
let chart: any = null;
let candleSeries: any = null;
let liveTimer: number | null = null;
let currentSymbol: string | null = null;

let coinsSection: HTMLDivElement | null = null;
let chartSection: HTMLDivElement | null = null;
let tvChartEl: HTMLDivElement | null = null;
let backToListBtn: HTMLButtonElement | null = null;
let chartTitleEl: HTMLDivElement | null = null;

let onBackToList: (() => void) | null = null;

export function initChartPage(options: {
    coinsSectionSelector: string;
    chartSectionSelector: string;
    chartContainerSelector: string;
    backButtonSelector: string;
    titleSelector: string;
    onBackToList: () => void;
}) {
    coinsSection = document.querySelector<HTMLDivElement>(options.coinsSectionSelector);
    chartSection = document.querySelector<HTMLDivElement>(options.chartSectionSelector);
    tvChartEl = document.querySelector<HTMLDivElement>(options.chartContainerSelector);
    backToListBtn = document.querySelector<HTMLButtonElement>(options.backButtonSelector);
    chartTitleEl = document.querySelector<HTMLDivElement>(options.titleSelector);

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
    if (coinsSection) coinsSection.style.display = "flex";
    if (chartSection) chartSection.style.display = "none";
}

export function showChart() {
    activeSection = "chart";
    if (coinsSection) coinsSection.style.display = "none";
    if (chartSection) chartSection.style.display = "block";
}

export async function openSingleCoinChart(symbol: string) {
    currentSymbol = symbol.toUpperCase();
    showChart();
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (chartTitleEl) chartTitleEl.textContent = `${currentSymbol} / USD`;

    if (!tvChartEl) return;
    tvChartEl.innerHTML = "";

    const LW = (window as any).LightweightCharts;
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

    candleSeries = chart.addSeries((window as any).LightweightCharts.CandlestickSeries);

    const history = await fetchMinuteHistory(currentSymbol, 180);
    candleSeries.setData(history);
    chart.timeScale().fitContent();

    startLive(currentSymbol);
}

async function fetchMinuteHistory(symbol: string, limit: number) {
    const url = `https://min-api.cryptocompare.com/data/v2/histominute?fsym=${symbol}&tsym=USD&limit=${limit}`;
    const response = await fetch(url);
    const json = await response.json();

    const data = json?.Data?.Data || [];
    return data.map((c: any) => ({
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
    }));
}

async function fetchCurrentPrice(symbol: string): Promise<number | null> {
    const url = `https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USD`;
    const res = await fetch(url);
    const json = await res.json();
    const price = json?.USD;
    return typeof price === "number" ? price : null;
}

let currentBar: { time: number; open: number; high: number; low: number; close: number } | null = null;
let currentBarTime: number | null = null;

function startLive(symbol: string) {
    stopLive();
    currentBar = null;
    currentBarTime = null;

    liveTimer = window.setInterval(async () => {
        try {
            if (activeSection !== "chart") return;
            if (currentSymbol !== symbol) return;
            const price = await fetchCurrentPrice(symbol);
            if (price === null) return;
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
            if (!currentBar) return;
            currentBar.high = Math.max(currentBar.high, price);
            currentBar.low = Math.min(currentBar.low, price);
            currentBar.close = price;
            candleSeries.update(currentBar);
        } catch (e) {
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
