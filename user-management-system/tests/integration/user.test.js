const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');

describe('User API Integration Tests', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should create a new user', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'password123'
            });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.username).toBe('testuser');
    });

    it('should get a user by ID', async () => {
        const user = await request(app)
            .post('/api/users')
            .send({
                username: 'testuser2',
                email: 'testuser2@example.com',
                password: 'password123'
            });

        const response = await request(app).get(`/api/users/${user.body.user._id}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.username).toBe('testuser2');
    });

    it('should update a user', async () => {
        const user = await request(app)
            .post('/api/users')
            .send({
                username: 'testuser3',
                email: 'testuser3@example.com',
                password: 'password123'
            });

        const response = await request(app)
            .put(`/api/users/${user.body.user._id}`)
            .send({
                username: 'updateduser'
            });
        expect(response.status).toBe(200);
        expect(response.body.user.username).toBe('updateduser');
    });

    it('should delete a user', async () => {
        const user = await request(app)
            .post('/api/users')
            .send({
                username: 'testuser4',
                email: 'testuser4@example.com',
                password: 'password123'
            });

        const response = await request(app).delete(`/api/users/${user.body.user._id}`);
        expect(response.status).toBe(204);
    });
});