from services.user_service import UserService
from models.user import User

class UserController:
    def __init__(self):
        self.user_service = UserService()

    def get_user_profile(self, user_id):
        user = self.user_service.get_user(user_id)
        if user:
            return user.to_dict()
        return None

    def create_or_update_user_profile(self, user_id, avatar_url=None):
        user = self.user_service.create_or_update_user(user_id, avatar_url)
        return user.to_dict()
