const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors({
  origin: 'http://www.docsai.one', // Replace with your React app's URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

const io = new Server(server, {
  cors: {
    origin: 'http://www.docsai.one', // Replace with your React app's URL
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Client joined room: ${room}`);
  });

  socket.on('document-change', (data) => {
    const { room, delta } = data;
    // console.log("recieved delta", delta);
    // Broadcast the changes to all clients in the room except the sender
    socket.to(room).emit('document-change', delta);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on("cursor-position", (data) => {
    const { room, userId, position, userName } = data;
    socket.to(room).emit("cursor-position", { userId, position, userName });
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});