const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

function sign(user) {
    return jwt.sign({ sub: user.id, role: user.role, name: user.name }, SECRET, { expiresIn: '7d' });
}
function verify(token) {
    return jwt.verify(token, SECRET);
}

module.exports = { sign, verify };
