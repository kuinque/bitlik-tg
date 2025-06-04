# Refactored imports for better readability and maintainability
import os
import sys
import threading
import asyncio
import requests
from flask import Flask, render_template, request
from telegram import Update, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes

# Add the project root directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import configurations and routes
from config.config import TELEGRAM_BOT_TOKEN, FLASK_HOST, FLASK_PORT
from src.api.wallet_routes import wallet_bp
from src.api.coins_routes import coins_api
# Import the blueprint factory function instead of the blueprint object
from src.api.user_routes import create_user_blueprint

from src.controllers.user_controller import UserController
from src.services.user_service import UserService

# Initialize Flask app
app = Flask(__name__)

# Initialize persistent services and controllers
user_service = UserService()
# We don't need to instantiate the UserController here anymore
# user_controller = UserController(user_service=user_service)

# Register blueprints (user_bp will now use the persistent controller)
app.register_blueprint(wallet_bp, url_prefix='/api')
app.register_blueprint(coins_api)

# Use the blueprint factory function to create and register the user blueprint
user_bp = create_user_blueprint(user_service)
app.register_blueprint(user_bp, url_prefix='/api')

# Telegram bot command handler
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send a message with a button that opens the web app."""
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

# Flask route for the main page
@app.route('/')
def index():
    """Render the main page of the web app."""
    return render_template('index.html')

# Flask route for the profile page
@app.route('/profile')
def profile():
    """Render the profile page."""
    return render_template('profile.html')

# Flask route to proxy user data from another service
@app.route('/proxy-users')
def proxy_users():
    try:
        response = requests.get('http://localhost:3000/api/users')
        return response.json(), response.status_code
    except requests.RequestException as e:
        return {'error': str(e)}, 500

# Function to run the Flask app
def run_flask():
    """Run the Flask app."""
    app.run(host=FLASK_HOST, port=FLASK_PORT)

# Function to run the Telegram bot
async def run_bot():
    """Run the Telegram bot."""
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    await application.initialize()
    await application.start()
    await application.run_polling()

# Main function to start both Flask and Telegram bot
def main():
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.start()
    asyncio.run(run_bot())

if __name__ == '__main__':
    main()