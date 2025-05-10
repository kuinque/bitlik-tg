// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

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

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadBalance();
    loadTransactions();
}); 