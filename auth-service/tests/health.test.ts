const request = require('supertest');

describe('Health Check', () => {
    it('should respond with 200 on /health', async () => {
        const res = await request('http://localhost:4001').get('/health');
        expect(res.status).toBe(200);
    });
});
