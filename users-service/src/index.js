import app from './server.js';

const PORT = process.env.PORT || 8002;
app.listen(PORT, () => {
    console.log(`Users service running on ${PORT}`);
});
