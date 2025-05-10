import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')

# Flask Configuration
FLASK_HOST = '0.0.0.0'
FLASK_PORT = 7341
FLASK_DEBUG = True

# Mock Data (for development)
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