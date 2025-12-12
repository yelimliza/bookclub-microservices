import request from 'supertest';
import app from '../src/server.js';

describe('Users Service Shelves', () => {
    it('creates wantToRead entry', async () => {
        const res = await request(app)
            .post('/users/1/shelves/want')
            .send({ bookId: 5 });
        expect(res.statusCode).toBe(201);
        expect(res.body.wantToRead).toContain(5);
    });

    it('creates read entry', async () => {
        const res = await request(app)
            .post('/users/1/shelves/read')
            .send({ bookId: 2 });
        expect(res.statusCode).toBe(201);
        expect(res.body.read).toContain(2);
    });
});
