import app from './server.js';

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
    console.log(`Auth service running on ${PORT}`);
});
