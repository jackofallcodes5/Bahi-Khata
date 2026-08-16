const http = require('http');
const app = require('./app');
const initSocket = require('./src/socket/index');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
