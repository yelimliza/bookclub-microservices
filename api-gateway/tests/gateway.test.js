import request from 'supertest';
import app from '../src/index.js'; // убедись, что ты экспортируешь express app

describe('API Gateway', () => {
    it('should respond with 200 on /health', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
    });
});
