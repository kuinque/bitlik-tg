# Telegram Web App

A simple Telegram Web App built with Python Flask and python-telegram-bot.

## Setup

1. Create a new Telegram bot using [@BotFather](https://t.me/botfather) and get your bot token.

2. Create a `.env` file in the root directory and add your bot token:
```
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

3. Install the required dependencies:
```bash
pip install -r requirements.txt
```

4. Run the application:
```bash
python app.py
```

## Features

- Basic Flask web application
- Telegram bot integration
- Web App template with Telegram Web App SDK
- Environment variable configuration
- Example API endpoint

## Development

The application consists of:
- `app.py`: Main application file
- `templates/index.html`: Web App template
- `requirements.txt`: Python dependencies
- `.env`: Environment variables (create this file)

## Web App Integration

To integrate this with Telegram:

1. Create a new bot using [@BotFather](https://t.me/botfather)
2. Use the `/newapp` command to create a new Web App
3. Set the Web App URL to your deployed application URL
4. Update the Web App URL in `app.py` with your actual URL

## Security Notes

- Never commit your `.env` file
- Keep your bot token secure
- Use HTTPS in production 