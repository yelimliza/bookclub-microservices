import express from 'express';

const app = express();
app.use(express.json());

let reviews = [
    { id: 1, bookId: 1, userId: 0, userEmail: 'demo@example.com', rating: 5, comment: 'Великолепно!', createdAt: Date.now() }
];
let idSeq = 2;

app.get('/reviews', (req, res) => {
    const bookId = Number(req.query.bookId);
    let list = reviews.slice().sort((a, b) => b.createdAt - a.createdAt);
    if (Number.isFinite(bookId)) list = list.filter(r => r.bookId === bookId);
    res.json(list);
});

app.post('/reviews', (req, res) => {
    const { bookId, userId, userEmail, rating, comment } = req.body;
    if (!bookId || !comment || !userEmail) return res.status(400).json({ error: 'bookId, comment, userEmail required' });
    const rv = {
        id: idSeq++,
        bookId: Number(bookId),
        userId: Number(userId || 0),
        userEmail: String(userEmail),
        rating: Number(rating || 5),
        comment: String(comment),
        createdAt: Date.now()
    };
    reviews.push(rv);
    res.status(201).json(rv);
});

app.delete('/reviews/:id', (req, res) => {
    const id = Number(req.params.id);
    const idx = reviews.findIndex(r => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'not found' });
    reviews.splice(idx, 1);
    res.json({ success: true });
});

export default app;
