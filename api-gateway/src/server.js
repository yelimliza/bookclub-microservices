import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

const BOOKS_URL = process.env.BOOKS_URL || 'http://books-service:8003';
const AUTH_URL = process.env.AUTH_URL || 'http://auth-service:8001';
const USERS_URL = process.env.USERS_URL || 'http://users-service:8002';
const REVIEWS_URL = process.env.REVIEWS_URL || 'http://reviews-service:8004';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

function decodeJwt(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
        return JSON.parse(payloadJson);
    } catch { return null; }
}

app.use((req, res, next) => {
    const token = req.cookies.token || null;
    let user = null;
    if (token) {
        const p = decodeJwt(token);
        if (p) user = { id: p.sub, email: p.email, role: p.role || 'user' };
    }
    res.locals.user = user;
    res.locals.msg = req.cookies.msg || null;
    res.locals.err = req.cookies.err || null;
    if (req.cookies.msg) res.clearCookie('msg');
    if (req.cookies.err) res.clearCookie('err');
    next();
});

app.get('/', async (req, res) => {
    try {
        const r = await fetch(`${BOOKS_URL}/books`);
        const books = await r.json();
        const topBooks = (books || []).filter(b => !!b.isTop);
        res.render('home', { books: topBooks });
    } catch (e) {
        res.render('home', { books: [], error: e.message });
    }
});

app.get('/search', async (req, res) => {
    const q = (req.query.q || '').trim().toLowerCase();
    const genre = (req.query.genre || '').trim().toLowerCase();
    const author = (req.query.author || '').trim().toLowerCase();
    const year = req.query.year ? Number(req.query.year) : null;

    try {
        const r = await fetch(`${BOOKS_URL}/books`);
        let books = await r.json();

        books = books.filter(b => {
            const byQ = q
                ? (String(b.title || '').toLowerCase().includes(q) || String(b.author || '').toLowerCase().includes(q))
                : true;
            const byGenre = genre ? String(b.genre || '').toLowerCase().includes(genre) : true;
            const byAuthor = author ? String(b.author || '').toLowerCase().includes(author) : true;
            const byYear = year ? Number(b.year) === year : true;
            return byQ && byGenre && byAuthor && byYear;
        });

        const genresAll = await (await fetch(`${BOOKS_URL}/books`)).json();
        const genres = Array.from(new Set(genresAll.map(b => b.genre || ''))).filter(Boolean);

        res.render('search', { books, q, genre, author, year, genres });
    } catch (e) {
        res.render('search', { books: [], q, genre, author, year, genres: [], error: e.message });
    }
});

app.get('/book/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const [bookRes, reviewsRes] = await Promise.all([
            fetch(`${BOOKS_URL}/books/${id}`),
            fetch(`${REVIEWS_URL}/reviews?bookId=${id}`)
        ]);
        const book = bookRes.ok ? await bookRes.json() : null;
        const reviews = reviewsRes.ok ? await reviewsRes.json() : [];
        res.render('book', { book, reviews });
    } catch (e) {
        res.render('book', { book: null, reviews: [], error: e.message });
    }
});


app.post('/book/:id/reviews', async (req, res) => {
    const id = Number(req.params.id);
    if (!res.locals.user) {
        res.cookie('err', 'Нужно войти, чтобы оставить комментарий.');
        return res.redirect(`/login?next=/book/${id}`);
    }
    const payload = {
        bookId: id,
        rating: Number(req.body.rating || 5),
        comment: String(req.body.comment || '').trim(),
        userId: res.locals.user.id || 0,
        userEmail: res.locals.user.email
    };
    if (!payload.comment) {
        res.cookie('err', 'Комментарий не должен быть пустым.');
        return res.redirect(`/book/${id}`);
    }
    try {
        const r = await fetch(`${REVIEWS_URL}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!r.ok) {
            const text = await r.text();
            res.cookie('err', `Ошибка добавления комментария: ${text}`);
            return res.redirect(`/book/${id}`);
        }
        res.cookie('msg', 'Комментарий добавлен.');
        res.redirect(`/book/${id}`);
    } catch (e) {
        res.cookie('err', `Ошибка сети: ${e.message}`);
        res.redirect(`/book/${id}`);
    }
});

app.post('/book/:id/want', async (req, res) => {
    const id = Number(req.params.id);
    if (!res.locals.user) {
        res.cookie('err', 'Нужно войти, чтобы добавить в «Хочу прочитать».');
        return res.redirect(`/login?next=/book/${id}`);
    }
    try {
        const r = await fetch(`${USERS_URL}/users/${res.locals.user.id}/shelves/want`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId: id })
        });
        if (!r.ok) {
            const t = await r.text();
            res.cookie('err', `Ошибка добавления: ${t}`);
        } else {
            res.cookie('msg', 'Добавлено в «Хочу прочитать».');
        }
        res.redirect(`/book/${id}`);
    } catch (e) {
        res.cookie('err', `Ошибка сети: ${e.message}`);
        res.redirect(`/book/${id}`);
    }
});

app.post('/book/:id/read', async (req, res) => {
    const id = Number(req.params.id);
    if (!res.locals.user) {
        res.cookie('err', 'Нужно войти, чтобы отметить как «Прочитано».');
        return res.redirect(`/login?next=/book/${id}`);
    }
    try {
        const r = await fetch(`${USERS_URL}/users/${res.locals.user.id}/shelves/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId: id })
        });
        if (!r.ok) {
            const t = await r.text();
            res.cookie('err', `Ошибка добавления: ${t}`);
        } else {
            res.cookie('msg', 'Отмечено как «Прочитано».');
        }
        res.redirect(`/book/${id}`);
    } catch (e) {
        res.cookie('err', `Ошибка сети: ${e.message}`);
        res.redirect(`/book/${id}`);
    }
});

app.get('/login', (req, res) => res.render('login', { next: req.query.next || '/account' }));
app.get('/register', (req, res) => res.render('register', { next: req.query.next || '/account' }));

app.get('/account', async (req, res) => {
    if (!res.locals.user) {
        res.cookie('err', 'Вы не вошли.');
        return res.redirect('/login');
    }
    let shelves = { wantToRead: [], read: [] };
    let booksIndex = new Map();
    try {
        const [sR, bR] = await Promise.all([
            fetch(`${USERS_URL}/users/${res.locals.user.id}/shelves`),
            fetch(`${BOOKS_URL}/books`)
        ]);
        shelves = await sR.json();
        const books = await bR.json();
        books.forEach(b => booksIndex.set(Number(b.id), { id: b.id, title: b.title, author: b.author, genre: b.genre, year: b.year }));
    } catch {}
    const want = (shelves.wantToRead || []).map(id => booksIndex.get(id) || { id, title: `Книга #${id}` });
    const read = (shelves.read || []).map(id => booksIndex.get(id) || { id, title: `Книга #${id}` });
    res.render('account', { user: res.locals.user, want, read });
});

app.post('/login', async (req, res) => {
    const next = req.body.next || '/account';
    try {
        const r = await fetch(`${AUTH_URL}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: req.body.email, password: req.body.password })
        });
        const data = await r.json();
        if (data.token) {
            res.cookie('token', data.token, { httpOnly: true });
            res.cookie('msg', 'Вы успешно вошли.');
            return res.redirect(next);
        }
        res.cookie('err', 'Ошибка входа.');
        res.redirect('/login');
    } catch (e) {
        res.cookie('err', `Ошибка входа: ${e.message}`);
        res.redirect('/login');
    }
});

app.post('/register', async (req, res) => {
    const next = req.body.next || '/account';
    try {
        const reg = await fetch(`${AUTH_URL}/auth/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: req.body.name, email: req.body.email, password: req.body.password })
        });
        if (!reg.ok) {
            const t = await reg.text();
            res.cookie('err', `Регистрация: ${t}`);
            return res.redirect('/register');
        }
        const loginR = await fetch(`${AUTH_URL}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: req.body.email, password: req.body.password })
        });
        const login = await loginR.json();
        if (login.token) {
            res.cookie('token', login.token, { httpOnly: true });
            res.cookie('msg', 'Регистрация выполнена, вы вошли.');
            return res.redirect(next);
        }
        res.cookie('msg', 'Регистрация выполнена. Войдите.');
        res.redirect('/login');
    } catch (e) {
        res.cookie('err', `Ошибка регистрации: ${e.message}`);
        res.redirect('/register');
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.cookie('msg', 'Вы вышли из аккаунта.');
    res.redirect('/');
});

// ... остальной код gateway выше

// Админ-панель
app.get('/admin', async (req, res) => {
    const user = res.locals.user;
    if (!user || user.role !== 'admin') {
        res.cookie('err', 'Доступ только для администратора.');
        return res.redirect('/');
    }
    try {
        const [usersRes, reviewsRes, booksRes] = await Promise.all([
            fetch(`${AUTH_URL}/auth/users`),
            fetch(`${REVIEWS_URL}/reviews`),
            fetch(`${BOOKS_URL}/books`)
        ]);
        const users = await usersRes.json();
        const reviews = await reviewsRes.json();
        const books = await booksRes.json();
        res.render('admin', { users, reviews, books });
    } catch (e) {
        res.render('admin', { users: [], reviews: [], books: [], error: e.message });
    }
});

// Добавить книгу
app.post('/admin/books/add', async (req, res) => {
    const user = res.locals.user;
    if (!user || user.role !== 'admin') return res.redirect('/');
    const payload = {
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        genre: req.body.genre,
        year: req.body.year ? Number(req.body.year) : null,
        isTop: req.body.isTop === 'true'
    };
    await fetch(`${BOOKS_URL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    res.redirect('/admin');
});

// Обновить книгу
app.post('/admin/books/:id/update', async (req, res) => {
    const user = res.locals.user;
    if (!user || user.role !== 'admin') return res.redirect('/');
    const id = req.params.id;
    const payload = {
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        genre: req.body.genre,
        year: req.body.year ? Number(req.body.year) : null
    };
    await fetch(`${BOOKS_URL}/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    res.redirect('/admin');
});

// Переключить ТОП
app.post('/admin/books/:id/top', async (req, res) => {
    const user = res.locals.user;
    if (!user || user.role !== 'admin') return res.redirect('/');
    const id = req.params.id;
    const isTop = req.body.isTop === 'true';
    await fetch(`${BOOKS_URL}/books/${id}/top`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTop })
    });
    res.redirect('/admin');
});

// Удалить комментарий
app.post('/admin/reviews/:id/delete', async (req, res) => {
    const user = res.locals.user;
    if (!user || user.role !== 'admin') return res.redirect('/');
    const id = req.params.id;
    await fetch(`${REVIEWS_URL}/reviews/${id}`, { method: 'DELETE' });
    res.redirect('/admin');
});

// Забанить пользователя
app.post('/admin/users/:id/ban', async (req, res) => {
    const user = res.locals.user;
    if (!user || user.role !== 'admin') return res.redirect('/');
    const id = req.params.id;
    await fetch(`${AUTH_URL}/auth/ban/${id}`, { method: 'POST' });
    res.redirect('/admin');
});


export default app;
