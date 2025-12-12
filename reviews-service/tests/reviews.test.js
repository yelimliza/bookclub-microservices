import request from 'supertest';
import app from '../src/server.js';

describe('Reviews Service', () => {
    it('adds a review', async () => {
        const res = await request(app)
            .post('/reviews')
            .send({ bookId: 1, userEmail: 't@e.com', rating: 4, comment: 'ok' });
        expect(res.statusCode).toBe(201);
        expect(res.body.comment).toBe('ok');
    });

    it('lists reviews for a book', async () => {
        const res = await request(app).get('/reviews?bookId=1');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
