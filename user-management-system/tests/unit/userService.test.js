const UserService = require('../../src/services/userService');

describe('UserService', () => {
    let userService;

    beforeEach(() => {
        userService = new UserService();
    });

    describe('registerUser', () => {
        it('should successfully register a user with valid data', async () => {
            const userData = { email: 'test@example.com', password: 'Password123' };
            const result = await userService.registerUser(userData);
            expect(result).toHaveProperty('id');
            expect(result.email).toBe(userData.email);
        });

        it('should throw an error when email is invalid', async () => {
            const userData = { email: 'invalid-email', password: 'Password123' };
            await expect(userService.registerUser(userData)).rejects.toThrow('Invalid email');
        });
    });

    describe('authenticateUser', () => {
        it('should return a token for valid credentials', async () => {
            const userData = { email: 'test@example.com', password: 'Password123' };
            await userService.registerUser(userData);
            const token = await userService.authenticateUser(userData.email, userData.password);
            expect(token).toBeDefined();
        });

        it('should throw an error for invalid credentials', async () => {
            await expect(userService.authenticateUser('wrong@example.com', 'wrongPassword')).rejects.toThrow('Invalid credentials');
        });
    });

    describe('validateUserData', () => {
        it('should return true for valid user data', () => {
            const userData = { email: 'test@example.com', password: 'Password123' };
            const isValid = userService.validateUserData(userData);
            expect(isValid).toBe(true);
        });

        it('should return false for invalid user data', () => {
            const userData = { email: 'invalid-email', password: 'short' };
            const isValid = userService.validateUserData(userData);
            expect(isValid).toBe(false);
        });
    });
});