const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const router = require("./router");
const { addUser, removeUser, getUser, getAllUsersInRoom } = require("./users");

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      name,
      room,
    });

    if (error) {
      return callback(error);
    } else {
      socket.emit("message", {
        user: "Admin",
        text: `Hey ${user.name}, Welcome to ${user.room}`,
      });
      socket.broadcast.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has joined the Room`,
      });
      socket.join(user.room);

      callback();
    }
  });

  socket.on("disconnect", () => {
    console.log("User has left :(");
  });
});

app.use(router);

server.listen(PORT, () => {
  console.log(`Server has started on Port ${PORT}`);
});
