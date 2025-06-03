class User:
    def __init__(self, user_id, avatar_url=None):
        self.user_id = user_id
        self.avatar_url = avatar_url

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "avatar_url": self.avatar_url
        } 