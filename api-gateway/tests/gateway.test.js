import request from 'supertest';
import app from '../src/server.js';

describe('API Gateway basic routes', () => {
    it('renders home (without external services mocked)', async () => {
        const res = await request(app).get('/');
        // Even if services are down, should return 200 with rendered page
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('<!DOCTYPE html>');
    });

    it('renders login page', async () => {
        const res = await request(app).get('/login');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('Вход');
    });
});
