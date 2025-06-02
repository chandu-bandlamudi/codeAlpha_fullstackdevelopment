const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

console.log("✅ Starting server...");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Simple socket.io test
io.on('connection', (socket) => {
    console.log("A user connected");
    socket.on('disconnect', () => {
        console.log("User disconnected");
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
