# Import required libraries
from flask import Flask, request, jsonify, render_template
from telegram import Update, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes
import os
from dotenv import load_dotenv
import threading
import asyncio

# Load environment variables from .env file
load_dotenv()

# Initialize Flask application
app = Flask(__name__)

# Get Telegram Bot Token from environment variables
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')

# Mock user data (to be replaced with database in production)
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
    """
    Handle the /start command in Telegram.
    Sends a welcome message with a button to open the web app.
    """
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
    """Run the Flask application in a separate thread."""
    app.run(host='0.0.0.0', port=7341)

async def run_bot():
    """
    Initialize and run the Telegram bot.
    Sets up command handlers and starts polling for updates.
    """
    # Initialize the bot with the token
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    
    # Add command handler for /start
    application.add_handler(CommandHandler("start", start))
    
    # Initialize and start the bot
    await application.initialize()
    await application.start()
    await application.run_polling()

if __name__ == '__main__':
    # Start Flask in a separate thread to handle web requests
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.start()
    
    # Run the Telegram bot in the main thread
    asyncio.run(run_bot()) 