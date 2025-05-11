from flask import Blueprint, jsonify
import requests

coins_api = Blueprint('coins_api', __name__)

@coins_api.route('/api/coins')
def get_coins():
    url = 'https://api.coingecko.com/api/v3/coins/markets'
    params = {
        'vs_currency': 'usd',
        'order': 'market_cap_desc',
        'per_page': 20,
        'page': 1,
        'sparkline': False
    }
    response = requests.get(url, params=params)
    try:
        data = response.json()
    except Exception:
        return jsonify({'error': 'Invalid response from CoinGecko'}), 502

    # Если data не список — ошибка
    if not isinstance(data, list):
        return jsonify({'error': 'CoinGecko API error', 'details': data}), 502

    coins = [{
        'id': c['id'],
        'name': c['name'],
        'symbol': c['symbol'],
        'image': c['image'],
        'current_price': c['current_price'],
        'price_change_percentage_24h': c['price_change_percentage_24h']
    } for c in data]
    return jsonify(coins) 