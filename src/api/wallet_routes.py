from flask import Blueprint, jsonify, request
from ..services.wallet_service import WalletService

wallet_bp = Blueprint('wallet', __name__)
wallet_service = WalletService()

@wallet_bp.route('/balance', methods=['GET'])
def get_balance():
    """Get user's balance."""
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    return jsonify(wallet_service.get_balance(user_id))

@wallet_bp.route('/transactions', methods=['GET'])
def get_transactions():
    """Get user's transactions."""
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    return jsonify(wallet_service.get_transactions(user_id))

@wallet_bp.route('/send', methods=['POST'])
def send_money():
    """Send money to another user."""
    data = request.get_json()
    amount = float(data.get('amount', 0))
    to_user = data.get('to_user')
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    if not amount or not to_user:
        return jsonify({"error": "Amount and recipient are required"}), 400

    success = wallet_service.send_money(user_id, amount, to_user)
    if not success:
        return jsonify({"error": "Insufficient funds"}), 400

    return jsonify({"message": "Money sent successfully"})

@wallet_bp.route('/receive', methods=['POST'])
def receive_money():
    """Receive money from another user."""
    data = request.get_json()
    amount = float(data.get('amount', 0))
    from_user = data.get('from_user')
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    if not amount or not from_user:
        return jsonify({"error": "Amount and sender are required"}), 400

    wallet_service.receive_money(user_id, amount, from_user)
    return jsonify({"message": "Money received successfully"})