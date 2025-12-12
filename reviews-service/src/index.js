import app from './server.js';

const PORT = process.env.PORT || 8004;
app.listen(PORT, () => {
    console.log(`Reviews service running on ${PORT}`);
});
