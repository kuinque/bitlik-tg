# Bitlik Telegram Wallet

A Telegram web app that provides wallet functionality, allowing users to view their balance, send and receive money, and track transactions.

## Project Structure
```
bitlik-tg/
├── app.py                 # Main file with Flask and Telegram bot
├── requirements.txt       # Project dependencies
├── .env                  # Environment variables (bot token)
└── src/
    ├── static/
    │   ├── css/
    │   │   └── style.css    # Web interface styles
    │   └── js/
    │       └── app.js       # Frontend JavaScript
    └── templates/
        └── index.html       # Web app HTML template
```

## Features
- Telegram bot integration
- Web-based wallet interface
- Balance display
- Send and receive money functionality
- Transaction history
- Real-time updates

## Technical Stack
- Python 3.7+
- Flask (Web Framework)
- python-telegram-bot (Telegram Bot API)
- HTML/CSS/JavaScript (Frontend)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment**
   - Create a `.env` file in the project root
   - Add your Telegram bot token:
     ```
     TELEGRAM_BOT_TOKEN=your_bot_token_here
     ```

3. **Set Up Telegram Bot**
   - Create a new bot using [@BotFather](https://t.me/BotFather)
   - Get the bot token and add it to `.env`
   - Set up the web app URL using `/setwebapp` command

4. **Configure ngrok (for development)**
   - Install ngrok from [ngrok.com](https://ngrok.com)
   - Run ngrok to create a tunnel:
     ```bash
     ngrok http 7341
     ```
   - Use the provided HTTPS URL as your web app URL in BotFather

5. **Run the Application**
   ```bash
   python app.py
   ```

## API Endpoints

- `GET /api/balance` - Get user's balance
- `GET /api/transactions` - Get transaction history
- `POST /api/send` - Send money to another user
- `POST /api/receive` - Receive money from another user

## Development Status

### Current Features
- Basic wallet interface
- Balance display
- Transaction history view
- Send/Receive money UI

### Limitations
- Using mock data (no database integration)
- Basic error handling
- No user authentication
- Limited transaction validation

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 