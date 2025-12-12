const express = require('express');
const router = express.Router();
const db = require('../db/knex');
const { requireUser } = require('../lib/auth');

router.get('/reviews/book/:bookId', async (req, res) => {
    const rows = await db('reviews').select('*').where({ book_id: Number(req.params.bookId) }).orderBy('id', 'desc');
    res.json(rows);
});

router.post('/reviews', requireUser, async (req, res) => {
    const { bookId, rating, text } = req.body;
    if (!bookId || !rating) return res.status(400).json({ error: 'Missing fields' });
    const [row] = await db('reviews').insert({ user_id: req.user.sub, book_id: Number(bookId), rating: Number(rating), text: text || '' }).returning('*');
    res.json(row);
});

module.exports = router;
