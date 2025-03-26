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

let lobbies = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("sendMessage", (messageData) => {
    const { sender, message } = messageData;
    if (!sender || !message) return; // Ignore invalid messages

    console.log(`Message received from ${sender}: ${message}`);
    socket.broadcast.emit("receiveMessage", messageData);
  });

  socket.on("joinLobby", (lobbyId, username) => {
    if (!username) {
      console.error(`❌ Username missing for socket ${socket.id}`);
      return;
    }
  
    console.log(`✅ User ${username} joined lobby ${lobbyId}`);
    socket.join(lobbyId);
  
    if (!lobbies[lobbyId]) {
      lobbies[lobbyId] = {
        owner: username, // ✅ Set the owner correctly
        players: [],
        gameState: {
          currentQuestionIndex: 0,
          timer: 20,
          questions: [],
          playerScores: {},
        },
      };
    }
  
    if (!lobbies[lobbyId].players.includes(username)) {
      lobbies[lobbyId].players.push(username); // ✅ Store username instead of `null`
    }
  
    console.log(`✅ Updated lobby:`, lobbies[lobbyId]);
    io.to(lobbyId).emit("lobbyUpdate", { ...lobbies[lobbyId] });
  });
  
  

  socket.on("startGame", (data) => {
    const { lobbyId, questions } = data;
    console.log(`Starting game for lobby ${lobbyId}`);
    lobbies[lobbyId].gameState.questions = questions;
    lobbies[lobbyId].gameState.timer = 20;
    lobbies[lobbyId].gameState.currentQuestionIndex = 0;
    lobbies[lobbyId].gameState.playerScores = lobbies[lobbyId].players.reduce((scores, playerId) => {
      scores[playerId] = 0;
      return scores;
    }, {});
    io.to(lobbyId).emit("gameState", lobbies[lobbyId].gameState);
  });

  socket.on("answer", (data) => {
    const { lobbyId, playerId, answer } = data;
    console.log(`Answer received for lobby ${lobbyId} from player ${playerId}`);
    handleAnswer(lobbyId, playerId, answer);
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected.`);
  
    for (const lobbyId in lobbies) {
      if (!lobbies[lobbyId]) continue;
  
      // ✅ Check if the player was the owner
      if (lobbies[lobbyId].owner === socket.id) {
        console.log(`Lobby ${lobbyId} owner disconnected. Disbanding lobby.`);
        delete lobbies[lobbyId];
        io.to(lobbyId).emit("lobbyClosed");
      } else {
        lobbies[lobbyId].players = lobbies[lobbyId].players.filter((playerId) => playerId !== socket.id);
        if (lobbies[lobbyId].players.length === 0) {
          delete lobbies[lobbyId];
        } else {
          io.to(lobbyId).emit("lobbyUpdate", lobbies[lobbyId]);
        }
      }
    }
  });

});

function handleAnswer(lobbyId, playerId, answer) {
  if (!lobbies[lobbyId]) return;

  const gameState = lobbies[lobbyId].gameState;
  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
  const correctAnswer = currentQuestion.choices[currentQuestion.correctAnswerIndex];

  if (answer === correctAnswer) {
    gameState.playerScores[playerId]++;
  }

  gameState.currentQuestionIndex++;
  gameState.timer = 20;

  // ✅ Send the updated game state to ALL players in the lobby
  io.to(lobbyId).emit("gameState", gameState);
}


server.listen(5080, () => {
  console.log("Server running on http://localhost:5080");
});