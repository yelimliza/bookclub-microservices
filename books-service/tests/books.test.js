import request from 'supertest';
import app from '../src/server.js';

describe('Books Service', () => {
    it('lists books', async () => {
        const res = await request(app).get('/books');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('adds a book', async () => {
        const res = await request(app)
            .post('/books')
            .send({ title: 'Новая', author: 'Автор', genre: 'Жанр', year: 2020 });
        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe('Новая');
    });
});
