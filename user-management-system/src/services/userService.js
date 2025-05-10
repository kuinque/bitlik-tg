class UserService {
    constructor(userModel) {
        this.userModel = userModel;
    }

    async registerUser(userData) {
        // Validate user data
        // Save user to the database
        const user = new this.userModel(userData);
        return await user.save();
    }

    async authenticateUser(email, password) {
        // Find user by email
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
        // Validate password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            throw new Error('Invalid password');
        }
        return user;
    }

    async getUserById(userId) {
        return await this.userModel.findById(userId);
    }

    async updateUser(userId, updateData) {
        return await this.userModel.findByIdAndUpdate(userId, updateData, { new: true });
    }

    async deleteUser(userId) {
        return await this.userModel.findByIdAndDelete(userId);
    }
}

export default UserService;