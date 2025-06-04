from flask import Blueprint, jsonify
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

liquid_pools_bp = Blueprint('liquid_pools', __name__)

# Sample hardcoded liquid pool data
sample_liquid_pools = [
    {
        "id": "usdt-rub-pool",
        "name": "USDT/RUB Pool",
        "description": "Provide liquidity for USDT and Russian Ruble pair.",
        "apy": "12.5%",
        "tokens": ["USDT", "RUB"]
    },
    {
        "id": "btc-usdt-pool",
        "name": "BTC/USDT Pool",
        "description": "Earn yield by providing Bitcoin and USDT.",
        "apy": "8.0%",
        "tokens": ["BTC", "USDT"]
    },
    {
        "id": "eth-usdt-pool",
        "name": "ETH/USDT Pool",
        "description": "Supply Ethereum and USDT to this pool.",
        "apy": "10.2%",
        "tokens": ["ETH", "USDT"]
    }
]

@liquid_pools_bp.route('/api/liquid_pools', methods=['GET'])
def get_liquid_pools():
    logging.info("Received GET request for liquid pools")
    return jsonify(sample_liquid_pools), 200 