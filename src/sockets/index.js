const { Server } = require("socket.io");
const { createServer } = require("http");

function initializeSocket(httpServer) {
  const io = new Server(httpServer);
  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = {
  initializeSocket,
};
