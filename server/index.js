const express = require('express');
const socketio = require('socket.io');

const router = require('./router');

const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
app.use(cors());

const io = socketio(server, {
  cors: {
    origin: "your origin",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// socket connects with the client
io.on('connection', (socket) => {
  socket.on('join', ({ name, room }) => {
    console.log(name, room)
  });
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

app.use(router);
app.use(cors());
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
