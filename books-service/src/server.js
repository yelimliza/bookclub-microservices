import express from 'express';

const app = express();
app.use(express.json());

// Each: { id, title, author, description, genre, year, isTop }
let books = [
    { id: 1, title: 'Война и мир', author: 'Лев Толстой', description: 'Эпический роман о судьбах людей на фоне войны.', genre: 'Классика', year: 1869, isTop: true },
    { id: 2, title: 'Преступление и наказание', author: 'Фёдор Достоевский', description: 'Психологический роман о вине и искуплении.', genre: 'Классика', year: 1866, isTop: true },
    { id: 3, title: 'Мастер и Маргарита', author: 'Михаил Булгаков', description: 'Мистический роман о любви, свободе и сатире.', genre: 'Мистика', year: 1967, isTop: true }
];
let idSeq = 4;

app.get('/books', (req, res) => res.json(books));

app.get('/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(b => b.id === id);
    if (!book) return res.status(404).json({ error: 'Not found' });
    res.json(book);
});

app.post('/books', (req, res) => {
    const { title, author, description, genre, year, isTop } = req.body;
    if (!title || !author) return res.status(400).json({ error: 'title and author required' });
    const book = {
        id: idSeq++,
        title,
        author,
        description: description || '',
        genre: genre || 'Не задан',
        year: Number.isFinite(Number(year)) ? Number(year) : null,
        isTop: !!isTop
    };
    books.push(book);
    res.status(201).json(book);
});

app.put('/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const idx = books.findIndex(b => b.id === id);
    if (idx === -1) return res.status(404).json({ error: 'not found' });
    const prev = books[idx];
    const { title, author, description, genre, year, isTop } = req.body;
    const updated = {
        ...prev,
        ...(title !== undefined ? { title } : {}),
        ...(author !== undefined ? { author } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(genre !== undefined ? { genre } : {}),
        ...(year !== undefined ? { year: Number.isFinite(Number(year)) ? Number(year) : null } : {}),
        ...(isTop !== undefined ? { isTop: !!isTop } : {})
    };
    books[idx] = updated;
    res.json(updated);
});

app.post('/books/:id/top', (req, res) => {
    const id = Number(req.params.id);
    const idx = books.findIndex(b => b.id === id);
    if (idx === -1) return res.status(404).json({ error: 'not found' });
    const { isTop } = req.body;
    books[idx].isTop = !!isTop;
    res.json({ success: true, isTop: books[idx].isTop });
});

app.delete('/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const idx = books.findIndex(b => b.id === id);
    if (idx === -1) return res.status(404).json({ error: 'not found' });
    books.splice(idx, 1);
    res.json({ success: true });
});

export default app;
