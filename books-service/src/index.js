import app from './server.js';

const PORT = process.env.PORT || 8003;
app.listen(PORT, () => {
    console.log(`Books service running on ${PORT}`);
});
