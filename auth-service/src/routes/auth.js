const express = require('express');
const router = express.Router();
const db = require('../db/knex');
const bcrypt = require('bcrypt');
const { sign, verify } = require('../lib/jwt');

router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
    const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS || 10));
    try {
        const existing = await db('users').where({ email }).first();
        if (existing) return res.status(409).json({ error: 'Email exists' });
        const [user] = await db('users')
            .insert({ name, email, password_hash: hash, role: role === 'admin' ? 'admin' : 'user' })
            .returning(['id', 'name', 'email', 'role']);
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await db('users').where({ email }).first();
    if (!user) return res.status(401).json({ error: 'Invalid' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid' });
    res.json({ token: sign(user), role: user.role });
});

router.get('/me', async (req, res) => {
    try {
        const auth = req.headers.authorization || '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
        if (!token) return res.status(401).json({ error: 'No token' });
        const payload = verify(token);
        const user = await db('users').where({ id: payload.sub }).first();
        if (!user) return res.status(404).json({ error: 'Not found' });
        res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (e) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;
