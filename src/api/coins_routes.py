from flask import Blueprint, jsonify
import requests
import time
import threading

coins_api = Blueprint('coins_api', __name__)

coins_cache = {
    'data': None,
    'timestamp': 0
}
CACHE_TTL = 60  # секунд

# Функция для обновления кэша с ретраями
def update_cache_forever():
    url = 'https://api.coingecko.com/api/v3/coins/markets'
    params = {
        'vs_currency': 'usd',
        'order': 'market_cap_desc',
        'per_page': 20,
        'page': 1,
        'sparkline': False
    }
    chart_ranges = {
        '1D': {'days': 1},
        '1W': {'days': 7},
        '1M': {'days': 30},
        '1Y': {'days': 365},
        'ALL': {'days': 'max'}
    }
    while True:
        success = False
        while not success:
            try:
                response = requests.get(url, params=params, timeout=10)
                data = response.json()
                if not isinstance(data, list):
                    raise Exception('Invalid data')
                coins = []
                for c in data:
                    market_chart = {}
                    for key, params_chart in chart_ranges.items():
                        try:
                            chart_url = f'https://api.coingecko.com/api/v3/coins/{c["id"]}/market_chart'
                            chart_resp = requests.get(chart_url, params={'vs_currency': 'usd', 'days': params_chart['days']}, timeout=10)
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
                coins_cache['timestamp'] = time.time()
                success = True
            except Exception as e:
                print(f'[COINS CACHE] Error updating cache: {e}. Retrying in 5s...')
                time.sleep(5)
        time.sleep(CACHE_TTL)

# Запуск обновления кэша в фоне при старте
threading.Thread(target=update_cache_forever, daemon=True).start()

@coins_api.route('/api/coins')
def get_coins():
    if coins_cache['data']:
        return jsonify(coins_cache['data'])
    return jsonify({'error': 'No cached data and CoinGecko unavailable'}), 502 