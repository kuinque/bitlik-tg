// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

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

function showTabContent(tab) {
  switch(tab) {
    case 'wallet':
      renderWalletTab();
      break;
    case 'trade':
      mainContent.innerHTML = `<div style="text-align:center;padding:2em 0"><h2>Trade</h2><p>Trading coming soon...</p></div>`;
      break;
    case 'earn':
      mainContent.innerHTML = `<div style="text-align:center;padding:2em 0"><h2>Earn</h2><p>Earn features coming soon...</p></div>`;
      break;
    case 'history':
      renderHistoryTab();
      break;
  }
}

// Wallet tab rendering and logic
function renderWalletTab() {
  mainContent.innerHTML = `
    <div class="wallet-section">
      <div class="segmented-control" id="wallet-segmented">
        <button class="segment active" data-segment="wallet">Wallet</button>
        <button class="segment" data-segment="cex">Bitlik CEX</button>
      </div>
      <div id="wallet-segment-content"></div>
    </div>
  `;
  setupWalletSegmented();
}

function setupWalletSegmented() {
  const segBtns = document.querySelectorAll('#wallet-segmented .segment');
  const segContent = document.getElementById('wallet-segment-content');
  function showSegment(segment) {
    segBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`#wallet-segmented .segment[data-segment='${segment}']`).classList.add('active');
    if (segment === 'wallet') {
      segContent.innerHTML = `
        <div class="balance-card-modern-centered">
          <div class="balance-card-icon">
            <svg width="36" height="36" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="6" y="12" width="24" height="16" rx="8"/>
              <circle cx="26" cy="20" r="3"/>
            </svg>
          </div>
          <div class="balance-card-info">
            <div class="balance-label-modern">Wallet Balance</div>
            <div class="balance-amount-modern" id="balance">Loading...</div>
          </div>
        </div>
        <div class="wallet-feature-grid">
          <div class="wallet-feature-card" onclick="showSendMoney()">
            <div class="wallet-feature-icon blue">
              <svg width="24" height="24" fill="none" stroke="#2476d3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>
            </div>
            <div class="wallet-feature-label">Send</div>
          </div>
          <div class="wallet-feature-card" onclick="alert('Add Crypto coming soon!')">
            <div class="wallet-feature-icon blue">
              <svg width="24" height="24" fill="none" stroke="#2476d3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </div>
            <div class="wallet-feature-label">Add Crypto</div>
          </div>
          <div class="wallet-feature-card" onclick="alert('Exchange coming soon!')">
            <div class="wallet-feature-icon blue">
              <svg width="24" height="24" fill="none" stroke="#2476d3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4"/><path d="M7 23l-4-4 4-4"/><path d="M20 5H10a5 5 0 0 0-5 5v12"/><path d="M4 19h10a5 5 0 0 0 5-5V2"/></svg>
            </div>
            <div class="wallet-feature-label">Exchange</div>
          </div>
          <div class="wallet-feature-card" onclick="alert('P2P Market coming soon!')">
            <div class="wallet-feature-icon blue">
              <svg width="24" height="24" fill="none" stroke="#2476d3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M3 10h18"/></svg>
            </div>
            <div class="wallet-feature-label">P2P Market</div>
          </div>
        </div>
      `;
      loadBalance();
    } else {
      segContent.innerHTML = `
        <div class="cex-soon">
          <h2>Bitlik CEX</h2>
          <p>Will be available soon</p>
        </div>
      `;
    }
  }
  segBtns.forEach(btn => {
    btn.addEventListener('click', () => showSegment(btn.dataset.segment));
  });
  showSegment('wallet');
}

function renderHistoryTab() {
  mainContent.innerHTML = `
    <div class="container">
      <header><h1>History</h1></header>
      <section class="transactions">
        <h2>Recent Transactions</h2>
        <div id="transactions-list" class="transactions-list"></div>
      </section>
    </div>
  `;
  loadTransactions();
}

// Load balance
async function loadBalance() {
    try {
        const response = await fetch('/api/balance');
        const data = await response.json();
        document.getElementById('balance').textContent = 
            `${data.currency} ${data.balance.toFixed(2)}`;
    } catch (error) {
        console.error('Error loading balance:', error);
    }
}

// Load transactions
async function loadTransactions() {
    try {
        const response = await fetch('/api/transactions');
        const transactions = await response.json();
        const transactionsList = document.getElementById('transactions-list');
        
        transactionsList.innerHTML = transactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-title">
                        ${transaction.type === 'send' ? 'Sent to ' + transaction.to : 'Received from ' + transaction.from}
                    </div>
                    <div class="transaction-date">
                        ${new Date(transaction.date).toLocaleDateString()}
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type === 'receive' ? 'amount-positive' : 'amount-negative'}">
                    ${transaction.type === 'receive' ? '+' : '-'}${transaction.currency} ${transaction.amount.toFixed(2)}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

// Show send money interface
function showSendMoney() {
    tg.showPopup({
        title: 'Send Money',
        message: 'Enter amount and recipient',
        buttons: [
            {id: 'cancel', type: 'cancel'},
            {id: 'send', type: 'ok', text: 'Send'}
        ]
    });
}

// Show receive money interface
function showReceiveMoney() {
    tg.showPopup({
        title: 'Receive Money',
        message: 'Share your wallet address',
        buttons: [
            {id: 'cancel', type: 'cancel'},
            {id: 'copy', type: 'ok', text: 'Copy Address'}
        ]
    });
}

// Show default tab on load
showTabContent('wallet'); 