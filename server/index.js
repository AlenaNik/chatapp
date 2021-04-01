const express = require('express');
const socketio = require('socket.io');

const router = require('./router');

const http = require('http');
const cors = require('cors');

// helper functions
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

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
io.on('connect', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    const { user } = addUser({ id: socket.id, name, room });

    socket.join(user.room);

    socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    let user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name, text: message });

    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if(user) {
      io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    }
  })
});


app.use(router);
app.use(cors());
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
