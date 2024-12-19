const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Create an express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Use CORS to allow communication between different domains (React app)
app.use(cors());
app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static('public'));

let currentCommentary = "";

// Handle real-time connections
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Send the latest commentary to new clients
    socket.emit('commentaryUpdate', currentCommentary);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Endpoint to receive new commentary from the dashboard
app.post('/commentary', (req, res) => {
    const { commentary } = req.body;
    currentCommentary = commentary;

    // Broadcast new commentary to all connected clients
    io.emit('commentaryUpdate', commentary);
    res.send({ message: 'Commentary broadcasted successfully' });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
