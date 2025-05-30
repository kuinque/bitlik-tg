// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Parse user_id from query string
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user_id');
if (!userId) {
    console.error('user_id is required');
}

// Global user state
const userState = { userId };

// Set theme colors based on Telegram theme
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#000000');
document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#FFFFFF');
document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#8E8E93');
document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#3390EC');
document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#3390EC');
document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#FFFFFF');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching logic
    const tabs = document.querySelectorAll('.tab-bar .tab');
    const mainContent = document.getElementById('main-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            showTabContent(this.dataset.tab);
        });
    });

    // Close button handler
    const closeBtn = document.getElementById('close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            tg.close();
        });
    }

    // Initialize the default tab
    showTabContent('wallet');

    // Chart range tab logic
    document.querySelectorAll('.chart-range-tabs button').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.chart-range-tabs button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadCoinChartData('bitcoin', this.dataset.range);
        });
    });
    // Инициализация графика по умолчанию
    loadCoinChartData('bitcoin', '1D');
});

// Map tabs to header titles
const titleMap = {
    wallet: 'Wallet',
    trade: 'Trade',
    earn: 'Earn',
    history: 'History'
};

function showTabContent(tab) {
    const mainContent = document.getElementById('main-content');
    // Update header title
    const headerTitle = document.querySelector('.header-bar .title');
    if (headerTitle) headerTitle.textContent = titleMap[tab] || '';
    
    switch(tab) {
        case 'wallet':
            renderWalletTab();
            break;
        case 'trade':
            renderTradeTab();
            break;
        case 'earn':
            mainContent.innerHTML = `
                <div class="page-content">
                    <h2>Earn</h2>
                    <p>Earning features coming soon...</p>
                </div>`;
            break;
        case 'history':
            renderHistoryTab();
            break;
    }
}

// Wallet tab rendering
function renderWalletTab() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="segmented-control">
            <button class="segment segment-wallet active">Wallet</button>
            <button class="segment segment-cex">CEX</button>
        </div>
        <div class="wallet-content">
            <div class="balance-section">
                <div class="balance-label">Wallet Balance</div>
                <div class="balance-amount" id="balance">Loading...</div>
            </div>
            <div class="wallet-actions-row">
                <div class="wallet-action-card">
                    <div class="wallet-action-icon-bg">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#3390EC" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 7V21"/><path d="M7 14l7-7 7 7"/></svg>
                    </div>
                    <div class="wallet-action-label">Send</div>
                </div>
                <div class="wallet-action-card">
                    <div class="wallet-action-icon-bg">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#3390EC" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="14" cy="14" r="9"/><path d="M14 10v8"/><path d="M10 14h8"/></svg>
                    </div>
                    <div class="wallet-action-label">Add Crypto</div>
                </div>
                <div class="wallet-action-card">
                    <div class="wallet-action-icon-bg">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#3390EC" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14h10"/><path d="M14 9l5 5-5 5"/></svg>
                    </div>
                    <div class="wallet-action-label">Exchange</div>
                </div>
                <div class="wallet-action-card">
                    <div class="wallet-action-icon-bg">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#3390EC" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="8" width="16" height="12" rx="3"/><path d="M10 12h8"/><path d="M10 16h8"/></svg>
                    </div>
                    <div class="wallet-action-label">P2P Market</div>
                </div>
            </div>
            <div id="main-currencies-card"></div>
            <div id="trending-section"></div>
        </div>
    `;
    
    // Segmented control logic
    const walletTab = document.querySelector('.segment-wallet');
    const cexTab = document.querySelector('.segment-cex');
    walletTab.addEventListener('click', function() {
        walletTab.classList.add('active');
        cexTab.classList.remove('active');
        document.querySelector('.wallet-content').style.display = '';
    });
    cexTab.addEventListener('click', function() {
        cexTab.classList.add('active');
        walletTab.classList.remove('active');
        document.querySelector('.wallet-content').style.display = 'none';
        tg.showPopup({
            title: 'CEX',
            message: 'Available soon',
            buttons: [{type: 'ok'}]
        });
    });

    // Load balance data
    loadBalance();
    // Load main currencies and trending
    renderMainCurrencies();
    renderTrendingSection();
}

// Основные валюты (пример: USDT, TON, BTC)
function renderMainCurrencies() {
    const el = document.getElementById('main-currencies-card');
    fetch('/api/coins').then(res => res.json()).then(data => {
        // Используем image из CoinGecko (как во вкладке trade)
        const mainCoins = [
            { symbol: 'usdt', name: 'Dollars', color: '#4cc47a' },
            { symbol: 'ton', name: 'Toncoin', color: '#3390EC' },
            { symbol: 'btc', name: 'Bitcoin', color: '#f7931a' }
        ];
        const coinsMap = Object.fromEntries(data.map(c => [c.symbol.toLowerCase(), c]));
        el.innerHTML = `
        <div class="main-currencies-card">
            ${mainCoins.map(mc => {
                const c = coinsMap[mc.symbol];
                const icon = c && c.image ? c.image : '/static/img/default-coin.svg';
                return `<div class="main-currency-row">
                    <img src="${icon}" class="main-currency-icon" style="background:${mc.color}10;" onerror="this.src='/static/img/default-coin.svg'">
                    <div>
                        <div class="main-currency-title">${mc.name}</div>
                        <div class="main-currency-rate">
                            ${c ? '₽' + (c.current_price * (c.symbol === 'usdt' ? 82.49 : 1)).toLocaleString(undefined, {maximumFractionDigits: 2}) : '-'}
                            <span class="main-currency-change ${c && c.price_change_percentage_24h < 0 ? 'negative' : 'positive'}">
                                ${c ? (c.price_change_percentage_24h >= 0 ? '↑' : '↓') + ' ' + Math.abs(c.price_change_percentage_24h).toFixed(2) + '%' : ''}
                            </span>
                        </div>
                    </div>
                    <div class="main-currency-balance">
                        ₽0.00<br><span class="main-currency-ticker">0 ${c ? c.symbol.toUpperCase() : ''}</span>
                    </div>
                </div>`;
            }).join('<hr class="main-currency-divider">')}
        </div>`;
    });
}

// Trending секция
function renderTrendingSection() {
    const el = document.getElementById('trending-section');
    fetch('/api/coins').then(res => res.json()).then(data => {
        // Топ-4 по росту
        const trending = [...data].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 4);
        el.innerHTML = `
        <div class="trending-section">
            <div class="trending-header">
                <span>TRENDING</span>
                <a href="#" class="trending-more">MORE</a>
            </div>
            <div class="trending-grid">
                ${trending.map((coin, i) => `
                <div class="trending-card">
                    <img src="${coin.image}" class="trending-icon">
                    <div class="trending-title">${coin.symbol.toUpperCase()}</div>
                    <canvas id="spark-${i}" class="trending-sparkline"></canvas>
                    <div class="trending-growth ${coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                        ${coin.price_change_percentage_24h >= 0 ? '↑' : '↓'} ${Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </div>
                    <div class="trending-price">₽${coin.current_price.toLocaleString()}</div>
                </div>
                `).join('')}
            </div>
        </div>`;
        // Мини-графики (sparklines) — используем market_chart из кэша
        trending.forEach((coin, i) => {
            const prices = coin.market_chart ? coin.market_chart.map(p => p[1]) : [];
            if (!prices.length) return;
            const ctx = document.getElementById(`spark-${i}`).getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: { labels: prices, datasets: [{ data: prices, borderColor: '#34C759', backgroundColor: 'rgba(52,199,89,0.06)', pointRadius: 0, borderWidth: 2, fill: false, tension: 0.3 }] },
                options: {
                    plugins: { legend: { display: false }, tooltip: { enabled: false } },
                    scales: { x: { display: false }, y: { display: false } },
                    elements: { line: { borderCapStyle: 'round' } },
                    responsive: false,
                    maintainAspectRatio: false,
                    animation: false,
                }
            });
        });
        // Переход по кнопке MORE
        const moreBtn = el.querySelector('.trending-more');
        if (moreBtn) {
            moreBtn.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelector('.tab[data-tab="trade"]').click();
            });
        }
    });
}

function renderTradeTab() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="trade-section">
            <div class="trade-tabs">
                <button class="trade-tab active" data-tab="all">All</button>
                <button class="trade-tab" data-tab="gainers">Top Gainers</button>
                <button class="trade-tab" data-tab="losers">Top Losers</button>
            </div>
            <div class="trade-list" id="trade-list">Loading...</div>
        </div>
    `;

    let coins = [];
    let currentTab = 'all';

    fetch('/api/coins')
        .then(res => res.json())
        .then(data => {
            coins = data;
            renderCoinsList();
        });

    function renderCoinsList() {
        let filtered = coins;
        if (currentTab === 'gainers') {
            filtered = [...coins].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 8);
        } else if (currentTab === 'losers') {
            filtered = [...coins].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 8);
        }
        const list = filtered.map(coin => `
            <div class="trade-coin" data-coin='${JSON.stringify(coin)}'>
                <img class="trade-coin-icon" src="${coin.image}" alt="${coin.symbol}">
                <div class="trade-coin-info">
                    <div class="trade-coin-title">${coin.name}</div>
                    <div class="trade-coin-ticker">${coin.symbol.toUpperCase()}</div>
                </div>
                <div class="trade-coin-price">$${coin.current_price.toLocaleString()}</div>
                <div class="trade-coin-change ${coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                    ${coin.price_change_percentage_24h >= 0 ? '+' : ''}${coin.price_change_percentage_24h.toFixed(2)}%
                </div>
            </div>
        `).join('');
        document.getElementById('trade-list').innerHTML = list;
        // Добавляем обработчик клика на монету
        document.querySelectorAll('.trade-coin').forEach(el => {
            el.addEventListener('click', function() {
                const coin = JSON.parse(this.getAttribute('data-coin'));
                renderCoinDetails(coin);
            });
        });
    }

    document.querySelectorAll('.trade-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.trade-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentTab = this.dataset.tab;
            renderCoinsList();
        });
    });
}

// Страница подробностей монеты
function renderCoinDetails(coin) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="coin-details-card">
            <button class="back-btn">← Back</button>
            <div class="coin-header">
                <img class="coin-details-icon" src="${coin.image}" alt="${coin.symbol}">
                <div>
                    <div class="coin-details-title">${coin.name}</div>
                    <div class="coin-details-ticker">${coin.symbol.toUpperCase()}</div>
                </div>
                <div class="coin-details-price-block">
                    <div class="coin-details-price">$${coin.current_price.toLocaleString()}</div>
                    <div class="coin-details-change ${coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                        ${coin.price_change_percentage_24h >= 0 ? '+' : ''}${coin.price_change_percentage_24h.toFixed(2)}%
                    </div>
                </div>
            </div>
            <div class="coin-chart-card">
                <canvas id="coinChart" height="120"></canvas>
                <div class="chart-range-tabs">
                    <button data-range="1D" class="active">1D</button>
                    <button data-range="1W">1W</button>
                    <button data-range="1M">1M</button>
                    <button data-range="1Y">1Y</button>
                    <button data-range="ALL">All</button>
                </div>
            </div>
            <div class="coin-balance-block">
                <div class="coin-balance-label">Your ${coin.symbol.toUpperCase()} Balance</div>
                <div class="coin-balance-amount" id="coin-balance">Loading...</div>
            </div>
            <div class="coin-details-actions">
                <button class="buy-btn">Buy</button>
                <button class="sell-btn">Sell</button>
            </div>
            <div class="coin-about-block">
                <div class="coin-about-title">About</div>
                <div class="coin-about-desc" id="coin-about">Loading...</div>
            </div>
        </div>
    `;
    // Назад
    document.querySelector('.back-btn').addEventListener('click', () => renderTradeTab());
    // График: по умолчанию 1D
    let currentRange = '1D';
    function updateChart(range) {
        const chartData = coin.market_chart && coin.market_chart[range] ? coin.market_chart[range] : [];
        const prices = chartData.map(p => p[1]);
        let labels;
        if (range === '1D') {
            labels = chartData.map(p => new Date(p[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
        } else {
            labels = chartData.map(p => new Date(p[0]).toLocaleDateString([], {month: 'short', day: 'numeric'}));
        }
        renderCoinChart(prices, labels);
    }
    updateChart(currentRange);
    // Диапазоны
    document.querySelectorAll('.chart-range-tabs button').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.chart-range-tabs button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentRange = this.dataset.range;
            updateChart(currentRange);
        });
    });
    // Баланс (заглушка)
    document.getElementById('coin-balance').textContent = '$0.00 (0 ' + coin.symbol.toUpperCase() + ')';
    // Описание
    fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById('coin-about').textContent = data.description.en ? data.description.en.split('. ')[0] + '.' : 'No description.';
        });
}

function renderHistoryTab() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="transactions-section">
            <div class="transactions-title">Transaction History</div>
            <div id="transactions-list" class="transactions-list"></div>
        </div>
    `;
    loadTransactionsStyled();
}

async function loadTransactionsStyled() {
    try {
        const response = await fetch(`/api/transactions?user_id=${userId}`);
        const transactions = await response.json();
        const transactionsList = document.getElementById('transactions-list');
        if (!transactions || transactions.length === 0) {
            transactionsList.innerHTML = '<div class="empty-state">No transactions yet</div>';
            return;
        }
        transactionsList.innerHTML = transactions.map(transaction => {
            const isReceive = transaction.type === 'receive';
            const icon = isReceive
                ? `<span class="tx-icon tx-in">&#8593;</span>`
                : `<span class="tx-icon tx-out">&#8595;</span>`;
            const title = isReceive
                ? `Received from <span class="tx-peer">${transaction.from || ''}</span>`
                : `Sent to <span class="tx-peer">${transaction.to || ''}</span>`;
            const date = new Date(transaction.date).toLocaleDateString('en-GB');
            const amount = (isReceive ? '+' : '-') + ' ' + transaction.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
            return `
                <div class="transaction-card">
                    <div class="tx-row">
                        ${icon}
                        <div class="tx-main">
                            <div class="tx-title">${title}</div>
                            <div class="tx-date">${date}</div>
                        </div>
                        <div class="tx-amount ${isReceive ? 'amount-positive' : 'amount-negative'}">${amount}</div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        document.getElementById('transactions-list').innerHTML = '<div class="error-state">Failed to load transactions</div>';
    }
}

// Load balance
async function loadBalance() {
    try {
        const response = await fetch(`/api/balance?user_id=${userId}`);
        const data = await response.json();
        document.getElementById('balance').textContent = 
            `${data.currency} ${data.balance.toFixed(2)}`;
    } catch (error) {
        console.error('Error loading balance:', error);
        document.getElementById('balance').textContent = 'Error loading balance';
    }
}

// Send money UI
async function sendMoneyUI() {
    const amountInput = prompt('Enter amount to send:');
    if (!amountInput) return;
    
    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    const toUser = prompt('Enter recipient:');
    if (!toUser) return;
    
    try {
        const response = await fetch(`/api/send?user_id=${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount,
                to_user: toUser
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Money sent successfully');
            loadBalance();
            if (document.getElementById('transactions-list')) {
                loadTransactionsStyled();
            }
        } else {
            alert(result.error || 'Failed to send money');
        }
    } catch (error) {
        console.error('Error sending money:', error);
        alert('Network error. Please try again later.');
    }
}

// Chart.js integration for coin chart
let coinChart;
async function loadCoinChartData(coinId = 'bitcoin', range = '1D') {
    let days = '1';
    if (range === '1W') days = '7';
    if (range === '1M') days = '30';
    if (range === '1Y') days = '365';
    if (range === 'ALL') days = 'max';
    try {
        const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
        const data = await res.json();
        const prices = data.prices.map(p => p[1]);
        const labels = data.prices.map(p => {
            const d = new Date(p[0]);
            if (range === '1D') return d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            if (range === '1W' || range === '1M') return d.toLocaleDateString([], {month: 'short', day: 'numeric'});
            return d.toLocaleDateString();
        });
        renderCoinChart(prices, labels);
    } catch (e) {
        renderCoinChart([], []);
    }
}

function renderCoinChart(prices, labels) {
    // Для диапазона All: уменьшаем количество точек (например, до 120)
    if (prices.length > 120) {
        const step = Math.ceil(prices.length / 120);
        prices = prices.filter((_, i) => i % step === 0);
        labels = labels.filter((_, i) => i % step === 0);
    }
    const ctx = document.getElementById('coinChart').getContext('2d');
    if (coinChart) coinChart.destroy();
    coinChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: prices,
                borderColor: '#3390EC',
                backgroundColor: 'rgba(51,144,236,0.10)',
                pointRadius: 0,
                borderWidth: 2.5,
                fill: true,
                tension: 0.35,
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false, grid: { display: false } },
                y: { display: false, grid: { display: false } }
            },
            elements: { line: { borderCapStyle: 'round' } },
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { left: 0, right: 0, top: 0, bottom: 36 } },
            backgroundColor: '#23242a',
        }
    });
}