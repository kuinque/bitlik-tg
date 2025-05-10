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
            mainContent.innerHTML = `
                <div class="page-content">
                    <h2>Trade</h2>
                    <p>Trading features coming soon...</p>
                </div>`;
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
        <div class="wallet-content">
            <div class="balance-section">
                <div class="balance-label">Wallet Balance</div>
                <div class="balance-amount" id="balance">Loading...</div>
            </div>
            
            <div class="action-buttons">
                <div class="action-button" id="send-btn">
                    <div class="action-icon">
                        <svg width="24" height="24" fill="none" stroke="#3390EC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 19V5"/>
                            <path d="M5 12l7-7 7 7"/>
                        </svg>
                    </div>
                    <div class="action-label">Send</div>
                </div>
                
                <div class="action-button" id="add-crypto-btn">
                    <div class="action-icon">
                        <svg width="24" height="24" fill="none" stroke="#3390EC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="16"/>
                            <line x1="8" y1="12" x2="16" y2="12"/>
                        </svg>
                    </div>
                    <div class="action-label">Add Crypto</div>
                </div>
                
                <div class="action-button" id="exchange-btn">
                    <div class="action-icon">
                        <svg width="24" height="24" fill="none" stroke="#3390EC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 1l4 4-4 4"/>
                            <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                            <path d="M7 23l-4-4 4-4"/>
                            <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                        </svg>
                    </div>
                    <div class="action-label">Exchange</div>
                </div>
                
                <div class="action-button" id="p2p-btn">
                    <div class="action-icon">
                        <svg width="24" height="24" fill="none" stroke="#3390EC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                    </div>
                    <div class="action-label">P2P Market</div>
                </div>
            </div>
        </div>
    `;
    
    // Set up action button handlers
    document.getElementById('send-btn').addEventListener('click', sendMoneyUI);
    document.getElementById('add-crypto-btn').addEventListener('click', () => tg.showPopup({
        title: 'Add Crypto',
        message: 'Add Crypto functionality coming soon',
        buttons: [{type: 'ok'}]
    }));
    document.getElementById('exchange-btn').addEventListener('click', () => tg.showPopup({
        title: 'Exchange',
        message: 'Exchange functionality coming soon',
        buttons: [{type: 'ok'}]
    }));
    document.getElementById('p2p-btn').addEventListener('click', () => tg.showPopup({
        title: 'P2P Market',
        message: 'P2P Market functionality coming soon',
        buttons: [{type: 'ok'}]
    }));
    
    // Load balance data
    loadBalance();
}

function renderHistoryTab() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="transactions">
            <h2>Transaction History</h2>
            <div id="transactions-list" class="transactions-list"></div>
        </div>
    `;
    loadTransactions();
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

// Load transactions
async function loadTransactions() {
    try {
        const response = await fetch(`/api/transactions?user_id=${userId}`);
        const transactions = await response.json();
        const transactionsList = document.getElementById('transactions-list');
        
        if (!transactions || transactions.length === 0) {
            transactionsList.innerHTML = '<div class="empty-state">No transactions yet</div>';
            return;
        }
        
        transactionsList.innerHTML = transactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-title">
                        ${transaction.type === 'send' ? `Sent to ${transaction.to || ''}` : `Received from ${transaction.from || ''}`}
                    </div>
                    <div class="transaction-date">
                        ${new Date(transaction.date).toLocaleDateString()}
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type === 'receive' ? 'amount-positive' : 'amount-negative'}">
                    ${transaction.type === 'receive' ? '+' : '-'} ${transaction.amount.toFixed(2)}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading transactions:', error);
        document.getElementById('transactions-list').innerHTML = 
            '<div class="error-state">Failed to load transactions</div>';
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
                loadTransactions();
            }
        } else {
            alert(result.error || 'Failed to send money');
        }
    } catch (error) {
        console.error('Error sending money:', error);
        alert('Network error. Please try again later.');
    }
}