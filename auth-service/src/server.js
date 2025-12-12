import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

let users = [];
let idSeq = 1;

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

(function seedAdmin() {
    const admin = {
        id: idSeq++,
        name: 'Admin',
        email: 'admin@example.com',
        password: 'secret',
        role: 'admin',
        banned: false
    };
    users.push(admin);
})();

app.post('/auth/register', (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'name, email, password required' });
    }
    const exists = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
    if (exists) {
        return res.status(409).json({ error: 'email already registered' });
    }
    const user = {
        id: idSeq++,
        name: String(name),
        email: String(email).toLowerCase(),
        password: String(password),
        role: role === 'admin' ? 'admin' : 'user',
        banned: false
    };
    users.push(user);
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === String(email).toLowerCase() && u.password === String(password));
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    if (user.banned) return res.status(403).json({ error: 'user banned' });

    const token = jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
    res.json({ token });
});

app.get('/auth/users', (req, res) => {
    res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, banned: !!u.banned })));
});

app.post('/auth/ban/:id', (req, res) => {
    const id = Number(req.params.id);
    const user = users.find(u => u.id === id);
    if (!user) return res.status(404).json({ error: 'not found' });
    user.banned = true;
    res.json({ success: true });
});

export default app;
