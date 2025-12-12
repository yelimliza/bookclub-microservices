import request from 'supertest';
import app from '../src/server.js';

describe('Auth Service', () => {
    it('registers a new user', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ name: 'Test', email: 'test@example.com', password: '123' });
        expect(res.statusCode).toBe(201);
        expect(res.body.email).toBe('test@example.com');
    });

    it('logs in existing user', async () => {
        await request(app)
            .post('/auth/register')
            .send({ name: 'Test2', email: 'test2@example.com', password: '123' });
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'test2@example.com', password: '123' });
        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });
});
