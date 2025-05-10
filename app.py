from flask import Flask, request, jsonify, render_template
from telegram import Update, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes
import os
from dotenv import load_dotenv
import threading
import asyncio
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Telegram Bot Token
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')

# Mock user data (in a real app, this would be in a database)
MOCK_USER_DATA = {
    "balance": 1000.00,
    "currency": "USD",
    "transactions": [
        {
            "id": 1,
            "type": "receive",
            "amount": 500.00,
            "from": "John Doe",
            "date": "2024-03-20T10:30:00",
            "status": "completed"
        },
        {
            "id": 2,
            "type": "send",
            "amount": 200.00,
            "to": "Jane Smith",
            "date": "2024-03-19T15:45:00",
            "status": "completed"
        }
    ]
}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send a message with a button that opens the web app."""
    # Get the current URL from the request
    webapp_url = request.host_url.rstrip('/')
    
    await update.message.reply_text(
        "Welcome to Telegram Wallet! Click the button below to open your wallet:",
        reply_markup={
            "inline_keyboard": [[
                {
                    "text": "Open Wallet",
                    "web_app": WebAppInfo(url=f"{webapp_url}")
                }
            ]]
        }
    )

@app.route('/')
def index():
    """Render the main page of the web app."""
    return render_template('index.html')

@app.route('/api/balance', methods=['GET'])
def get_balance():
    """Get user's balance."""
    return jsonify({
        "balance": MOCK_USER_DATA["balance"],
        "currency": MOCK_USER_DATA["currency"]
    })

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Get user's transactions."""
    return jsonify(MOCK_USER_DATA["transactions"])

def run_flask():
    """Run the Flask app."""
    app.run(host='0.0.0.0', port=7341)

async def run_bot():
    """Run the Telegram bot."""
    # Initialize the bot
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    
    # Add command handler
    application.add_handler(CommandHandler("start", start))
    
    # Start the bot
    await application.initialize()
    await application.start()
    await application.run_polling()

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    os.makedirs('templates', exist_ok=True)
    
    # Create a basic HTML template
    with open('templates/index.html', 'w') as f:
        f.write('''
<!DOCTYPE html>
<html>
<head>
    <title>Telegram Wallet</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <style>
        :root {
            --tg-theme-bg-color: #ffffff;
            --tg-theme-text-color: #000000;
            --tg-theme-hint-color: #999999;
            --tg-theme-link-color: #2481cc;
            --tg-theme-button-color: #2481cc;
            --tg-theme-button-text-color: #ffffff;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: var(--tg-theme-bg-color);
            color: var(--tg-theme-text-color);
        }

        .container {
            max-width: 100%;
            margin: 0 auto;
            padding: 16px;
        }

        .header {
            text-align: center;
            padding: 20px 0;
        }

        .balance-card {
            background: linear-gradient(135deg, #2481cc, #1a5f8a);
            border-radius: 16px;
            padding: 24px;
            color: white;
            margin-bottom: 24px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .balance-amount {
            font-size: 32px;
            font-weight: bold;
            margin: 8px 0;
        }

        .balance-label {
            font-size: 14px;
            opacity: 0.8;
        }

        .action-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 24px;
        }

        .action-button {
            background-color: var(--tg-theme-button-color);
            color: var(--tg-theme-button-text-color);
            border: none;
            padding: 16px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .action-button:hover {
            opacity: 0.9;
        }

        .transactions {
            background-color: var(--tg-theme-bg-color);
            border-radius: 16px;
            padding: 16px;
        }

        .transactions-header {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
        }

        .transaction-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .transaction-info {
            flex: 1;
        }

        .transaction-title {
            font-weight: 500;
            margin-bottom: 4px;
        }

        .transaction-date {
            font-size: 12px;
            color: var(--tg-theme-hint-color);
        }

        .transaction-amount {
            font-weight: 600;
        }

        .amount-positive {
            color: #4CAF50;
        }

        .amount-negative {
            color: #F44336;
        }

        .icon {
            width: 24px;
            height: 24px;
            margin-right: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Wallet</h1>
        </div>

        <div class="balance-card">
            <div class="balance-label">Total Balance</div>
            <div class="balance-amount" id="balance">$1,000.00</div>
        </div>

        <div class="action-buttons">
            <button class="action-button" onclick="showSendMoney()">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                Send
            </button>
            <button class="action-button" onclick="showReceiveMoney()">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Receive
            </button>
        </div>

        <div class="transactions">
            <div class="transactions-header">Recent Transactions</div>
            <div id="transactions-list">
                <!-- Transactions will be loaded here -->
            </div>
        </div>
    </div>

    <script>
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
    </script>
</body>
</html>
        ''')
    
    # Start Flask in a separate thread
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.start()
    
    # Run the bot in the main thread
    asyncio.run(run_bot()) 