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
    try:
        response = requests.get(url, params=params)
        data = response.json()
    except Exception:
        # Если не удалось получить новые данные, возвращаем старый кэш
        if coins_cache['data']:
            return jsonify(coins_cache['data'])
        return jsonify({'error': 'Invalid response from CoinGecko'}), 502

    if not isinstance(data, list):
        if coins_cache['data']:
            return jsonify(coins_cache['data'])
        return jsonify({'error': 'CoinGecko API error', 'details': data}), 502

    chart_ranges = {
        '1D': {'days': 1},
        '1W': {'days': 7},
        '1M': {'days': 30},
        '1Y': {'days': 365},
        'ALL': {'days': 'max'}
    }
    coins = []
    for c in data:
        market_chart = {}
        for key, params_chart in chart_ranges.items():
            try:
                chart_url = f'https://api.coingecko.com/api/v3/coins/{c["id"]}/market_chart'
                chart_resp = requests.get(chart_url, params={'vs_currency': 'usd', 'days': params_chart['days']})
                chart_data = chart_resp.json()
                market_chart[key] = chart_data.get('prices', [])
            except Exception:
                market_chart[key] = []
        coins.append({
            'id': c['id'],
            'name': c['name'],
            'symbol': c['symbol'],
            'image': c['image'],
            'current_price': c['current_price'],
            'price_change_percentage_24h': c['price_change_percentage_24h'],
            'market_chart': market_chart
        })
    coins_cache['data'] = coins
    coins_cache['timestamp'] = now
    return jsonify(coins) 