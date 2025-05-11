from flask import Blueprint, jsonify
import requests
import time

coins_api = Blueprint('coins_api', __name__)

coins_cache = {
    'data': None,
    'timestamp': 0
}
CACHE_TTL = 60  # секунд

@coins_api.route('/api/coins')
def get_coins():
    now = time.time()
    if coins_cache['data'] and now - coins_cache['timestamp'] < CACHE_TTL:
        return jsonify(coins_cache['data'])
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

    coins = []
    for c in data:
        # Получаем market_chart (график за 1 день)
        chart_url = f'https://api.coingecko.com/api/v3/coins/{c["id"]}/market_chart'
        chart_params = {'vs_currency': 'usd', 'days': 1}
        chart_resp = requests.get(chart_url, params=chart_params)
        try:
            chart_data = chart_resp.json()
            prices = chart_data.get('prices', [])
        except Exception:
            prices = []
        coins.append({
            'id': c['id'],
            'name': c['name'],
            'symbol': c['symbol'],
            'image': c['image'],
            'current_price': c['current_price'],
            'price_change_percentage_24h': c['price_change_percentage_24h'],
            'market_chart': prices
        })
    coins_cache['data'] = coins
    coins_cache['timestamp'] = now
    return jsonify(coins) 