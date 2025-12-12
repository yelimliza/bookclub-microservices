const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;
function requireUser(req, res, next) {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        req.user = jwt.verify(token, SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}
function requireAdmin(req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'No user' });
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    next();
}
module.exports = { requireUser, requireAdmin };
