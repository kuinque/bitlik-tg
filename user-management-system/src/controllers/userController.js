const UserService = require('../services/userService');

class UserController {
    constructor() {
        this.userService = new UserService();
    }

    async createUser(req, res) {
        try {
            const user = await this.userService.registerUser(req.body);
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getUser(req, res) {
        try {
            const user = await this.userService.getUserById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateUser(req, res) {
        try {
            const updatedUser = await this.userService.updateUser(req.params.id, req.body);
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteUser(req, res) {
        try {
            const result = await this.userService.deleteUser(req.params.id);
            if (!result) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async upsertTelegramUser({ telegramId, username, firstName, lastName, photoUrl }) {
        // Check if user exists
        let user = await this.userService.findByTelegramId(telegramId);

        if (user) {
            // Update the existing user
            user.username = username || user.username;
            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.photoUrl = photoUrl || user.photoUrl;
            await user.save();
        } else {
            // Create new user
            user = await this.userService.createUser({
                telegramId,
                username,
                firstName,
                lastName,
                photoUrl,
            });
        }

        return user;
    }
}

module.exports = UserController;