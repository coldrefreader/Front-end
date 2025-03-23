import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Change if frontend runs on another port
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("sendMessage", (messageData) => {
    const { sender, message } = messageData;
    if (!sender || !message) return; // Ignore invalid messages

    console.log(`Message received from ${sender}: ${message}`);
    socket.broadcast.emit("receiveMessage", messageData);

    
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected.`);
  });
});

server.listen(5080, () => {
  console.log("WebSocket server running on port 5080");
});
