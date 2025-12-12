const express = require('express');
const router = express.Router();
const db = require('../db/knex');
const { requireUser, requireAdmin } = require('../lib/auth');

router.get('/books', async (req, res) => {
    const rows = await db('books').select('*').orderBy('id', 'desc');
    res.json(rows);
});

router.get('/books/:id', async (req, res) => {
    const b = await db('books').where({ id: req.params.id }).first();
    if (!b) return res.status(404).json({ error: 'Not found' });
    res.json(b);
});

router.post('/books', requireUser, requireAdmin, async (req, res) => {
    const { title, author, description } = req.body;
    if (!title || !author) return res.status(400).json({ error: 'Missing fields' });
    const [book] = await db('books').insert({ title, author, description: description || '' }).returning('*');
    res.json(book);
});

router.put('/books/:id', requireUser, requireAdmin, async (req, res) => {
    const [book] = await db('books').where({ id: req.params.id }).update(req.body).returning('*');
    if (!book) return res.status(404).json({ error: 'Not found' });
    res.json(book);
});

router.delete('/books/:id', requireUser, requireAdmin, async (req, res) => {
    const count = await db('books').where({ id: req.params.id }).del();
    if (!count) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
});

module.exports = router;
