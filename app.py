# Import required libraries
from flask import Flask, request, jsonify, render_template
from telegram import Update, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes
import os
from dotenv import load_dotenv
import threading
import asyncio
from config.config import TELEGRAM_BOT_TOKEN, FLASK_HOST, FLASK_PORT
from src.api.wallet_routes import wallet_bp  # new import for wallet routes

# Load environment variables from .env file
load_dotenv()

# Initialize Flask application
app = Flask(__name__)
app.register_blueprint(wallet_bp, url_prefix='/api')  # register wallet routes

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

# Telegram bot command handler
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Handle the /start command in Telegram.
    Sends a welcome message with a button to open the web app.
    """
    # Get the current URL and include user ID
    webapp_url = request.host_url.rstrip('/')
    user_id = update.effective_user.id
    app_url = f"{webapp_url}/?user_id={user_id}"
    await update.message.reply_text(
        "Welcome to Telegram Wallet! Click the button below to open your wallet:",
        reply_markup={
            "inline_keyboard": [[
                {"text": "Open Wallet", "web_app": WebAppInfo(url=app_url)}
            ]]
        }
    )

@app.route('/')
def index():
    """Render the main page of the web app."""
    return render_template('index.html')

def run_flask():
    """Run the Flask application in a separate thread."""
    app.run(host=FLASK_HOST, port=FLASK_PORT)

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