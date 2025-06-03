from flask import Blueprint, request, jsonify
from controllers.user_controller import UserController
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

user_bp = Blueprint('user', __name__)
user_controller = UserController()

@user_bp.route('/api/user_profile', methods=['GET'])
def get_user_profile_route():
    user_id = request.args.get('user_id')
    logging.info(f"Received GET request for user_id: {user_id}")
    if not user_id:
        logging.warning("GET request failed: user_id is missing")
        return jsonify({'error': 'user_id is required'}), 400
    profile_data = user_controller.get_user_profile(user_id)
    if profile_data:
        logging.info(f"GET request successful for user_id {user_id}: {profile_data}")
        return jsonify(profile_data), 200
    logging.info(f"GET request failed for user_id {user_id}: User not found")
    return jsonify({'error': 'User not found'}), 404

@user_bp.route('/api/user_profile', methods=['POST'])
def create_or_update_user_profile_route():
    data = request.json
    logging.info(f"Received POST request for user_profile with data: {data}")
    if not data or 'user_id' not in data:
        logging.warning("POST request failed: user_id missing in body")
        return jsonify({'error': 'user_id is required in request body'}), 400
    user_id = data.get('user_id')
    avatar_url = data.get('avatar_url') # This should be None if generating random
    
    profile_data = user_controller.create_or_update_user_profile(user_id, avatar_url)
    logging.info(f"POST request successful for user_id {user_id}: {profile_data}")
    return jsonify(profile_data), 200
