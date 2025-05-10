from flask import Flask, render_template, request
from telegram import Update, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes
import threading
import asyncio
import sys
import os

# Add the project root directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.config import TELEGRAM_BOT_TOKEN, FLASK_HOST, FLASK_PORT
from src.api.wallet_routes import wallet_bp

app = Flask(__name__)
app.register_blueprint(wallet_bp, url_prefix='/api')

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

def run_flask():
    """Run the Flask app."""
    app.run(host=FLASK_HOST, port=FLASK_PORT)

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

def main():
    # Start Flask in a separate thread
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.start()
    
    # Run the bot in the main thread
    asyncio.run(run_bot())

if __name__ == '__main__':
    main() 