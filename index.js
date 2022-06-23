const express = require('express');
const socket = require('socket.io');

//app setup
const PORT = 7800;
const app = express();

const server = app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});

//static files
app.use(express.static('public'));

//socket setup
const io = socket(server);
try {
  const activeUsers = new Set();
  io.on('connection', (socket) => {
    console.log('socket connection.....!');

    //when new user
    socket.on('new user', function (data) {
      socket.userId = data;
      console.log(socket.userId, 'user ID');
      activeUsers.add(data);
      io.emit('new user', [...activeUsers]);
    });
    //when user left chat
    socket.on('disconnect', () => {
      activeUsers.delete(socket.userId);
      io.emit('user disconnected', socket.userId);
      socket.broadcast.emit(`${socket.userId} left the chat`);
    });
    //when user message
    socket.on('chat message', function (data) {
      io.emit('chat message', data);
    });
    //when user typing
    socket.on('typing', function (data) {
      socket.broadcast.emit('typing', data);
    });
  });
} catch (error) {
  console.error(error);
}
//collection of unique values
