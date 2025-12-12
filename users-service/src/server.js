import express from 'express';

const app = express();
app.use(express.json());

let shelves = new Map();

function ensureUser(userId) {
    if (!shelves.has(userId)) {
        shelves.set(userId, { wantToRead: [], read: [] });
    }
    return shelves.get(userId);
}

app.get('/users/:id/shelves', (req, res) => {
    const userId = Number(req.params.id);
    const s = ensureUser(userId);
    res.json(s);
});

app.post('/users/:id/shelves/want', (req, res) => {
    const userId = Number(req.params.id);
    const { bookId } = req.body;
    if (!bookId) return res.status(400).json({ error: 'bookId required' });
    const s = ensureUser(userId);
    const bId = Number(bookId);
    if (!s.wantToRead.includes(bId)) s.wantToRead.push(bId);
    res.status(201).json(s);
});

app.post('/users/:id/shelves/read', (req, res) => {
    const userId = Number(req.params.id);
    const { bookId } = req.body;
    if (!bookId) return res.status(400).json({ error: 'bookId required' });
    const s = ensureUser(userId);
    const bId = Number(bookId);
    if (!s.read.includes(bId)) s.read.push(bId);
    res.status(201).json(s);
});

export default app;
