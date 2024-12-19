const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Create an express app
const app = express();
const server = http.createServer(app);

// Middleware to serve static files
app.use(express.static('public'));

// Middleware to parse incoming request bodies
app.use(express.json()); // Add this line to handle JSON bodies
app.use(express.urlencoded({ extended: true })); // To handle URL-encoded bodies

// Use CORS to allow communication between different domains (React app)
app.use(cors({
    origin: 'http://localhost:3000',  // Allow React app's URL
    methods: ['GET', 'POST'],          // Allow these methods
    credentials: true                  // Allow cookies to be sent with requests
}));

// Set up Socket.IO
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",  // Allow the React app's URL for WebSocket connections
        methods: ["GET", "POST"]
    }
});

let currentCommentary = "";

// Socket.IO logic
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Send the latest commentary to new clients
    socket.emit('commentaryUpdate', currentCommentary);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// REST endpoint to receive new commentary
app.post('/commentary', (req, res) => {
    const { commentary } = req.body;

    if (!commentary) {
        return res.status(400).send({ error: 'Commentary is required' });
    }

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
