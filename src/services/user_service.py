import requests
from models.user import User
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

class UserService:
    def __init__(self):
        self.users = {}
        self.dicebear_api_url = "https://api.dicebear.com/7.x/fun-emoji/svg?seed="
        # Create a fake user for testing
        self.create_or_update_user("fake_user_123", name="Aleksey Nefedov")
        logging.info("UserService: Created fake user 'Aleksey Nefedov' with ID 'fake_user_123'")

    def get_user(self, user_id):
        logging.info(f"UserService: Attempting to get user with user_id: {user_id}")
        user = self.users.get(user_id)
        if user:
            logging.info(f"UserService: Found user {user_id}")
        else:
            logging.info(f"UserService: User {user_id} not found")
        return user

    def create_or_update_user(self, user_id, name=None, avatar_url=None):
        logging.info(f"UserService: Attempting to create or update user {user_id} with provided name: {name} and avatar_url: {avatar_url}")
        if user_id not in self.users:
            # If avatar_url is not provided, generate a random one
            if avatar_url is None:
                avatar_url = f"{self.dicebear_api_url}{user_id}"
                logging.info(f"UserService: Generating random avatar for new user {user_id}: {avatar_url}")
            self.users[user_id] = User(user_id=user_id, name=name, avatar_url=avatar_url)
            logging.info(f"UserService: Created new user {user_id} with name: {name} and avatar: {avatar_url}")
        else:
            logging.info(f"UserService: User {user_id} already exists.")
            # Update name and avatar if provided
            if name is not None:
                self.users[user_id].name = name
                logging.info(f"UserService: Updated name for user {user_id}: {name}")
            if avatar_url is not None:
                self.users[user_id].avatar_url = avatar_url
                logging.info(f"UserService: Updated avatar for user {user_id}: {avatar_url}")
        return self.users[user_id]
