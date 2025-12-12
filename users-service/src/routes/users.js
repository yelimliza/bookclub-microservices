const express = require('express');
const router = express.Router();
const db = require('../db/knex');
const { requireUser } = require('../lib/auth');

router.get('/my/favorites', requireUser, async (req, res) => {
    const rows = await db('favorites')
        .join('books', 'books.id', 'favorites.book_id')
        .select('books.id', 'books.title', 'books.author')
        .where('favorites.user_id', req.user.sub);
    res.json(rows);
});

router.post('/my/favorites', requireUser, async (req, res) => {
    const { bookId } = req.body;
    await db('favorites').insert({ user_id: req.user.sub, book_id: Number(bookId) }).onConflict(['user_id','book_id']).ignore();
    res.json({ ok: true });
});

router.get('/my/read', requireUser, async (req, res) => {
    const rows = await db('read_items')
        .join('books', 'books.id', 'read_items.book_id')
        .select('books.id', 'books.title', 'books.author')
        .where('read_items.user_id', req.user.sub);
    res.json(rows);
});

router.post('/my/read', requireUser, async (req, res) => {
    const { bookId } = req.body;
    await db('read_items').insert({ user_id: req.user.sub, book_id: Number(bookId) }).onConflict(['user_id','book_id']).ignore();
    res.json({ ok: true });
});

module.exports = router;
