import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let lobbies = {};
let disconnectTimeouts = {}; // Global map for pending disconnect removals

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // --- JOIN LOBBY HANDLER ---
  socket.on("joinLobby", (lobbyId, username, userId) => {
    if (!username || !userId) {
      console.error(`❌ Username or User ID missing for socket ${socket.id}`);
      return;
    }
    console.log(`✅ User ${username} (${userId}) joining lobby ${lobbyId}`);
    socket.join(lobbyId);
    socket.userInfo = { lobbyId, username, userId };

    // If there is a pending disconnect removal for this user, cancel it.
    if (disconnectTimeouts[userId]) {
      clearTimeout(disconnectTimeouts[userId]);
      delete disconnectTimeouts[userId];
      console.log(`Cleared pending disconnect removal for user ${username}`);
    }

    if (!lobbies[lobbyId]) {
      // Create new lobby with this user as owner and add them to players.
      lobbies[lobbyId] = {
        owner: { userId, username },
        players: [{ userId, username }],
        gameState: {
          currentQuestionIndex: 0,
          timer: 20,
          questions: [],
          playerScores: {},
        },
      };
      console.log(`Lobby ${lobbyId} created with owner ${username}`);
    } else {
      // Lobby exists.
      // If the joining user is the owner, update owner info and ensure they're in players.
      if (lobbies[lobbyId].owner && lobbies[lobbyId].owner.userId === userId) {
        lobbies[lobbyId].owner = { userId, username };
        if (!lobbies[lobbyId].players.find((p) => p.userId === userId)) {
          lobbies[lobbyId].players.push({ userId, username });
          console.log(`Owner ${username} re‑added to players for lobby ${lobbyId}`);
        }
      } else {
        // For non-owners, add them if not already present.
        if (!lobbies[lobbyId].players.find((p) => p.userId === userId)) {
          lobbies[lobbyId].players.push({ userId, username });
          console.log(`User ${username} added to players for lobby ${lobbyId}`);
        }
      }
    }
    console.log(`Lobby ${lobbyId} players after join:`, JSON.stringify(lobbies[lobbyId].players));
    io.to(lobbyId).emit("lobbyUpdate", { ...lobbies[lobbyId] });
    io.emit("lobbyListUpdate", Object.values(lobbies));
    if (lobbies[lobbyId].gameState && lobbies[lobbyId].gameState.questions.length > 0) {
      socket.emit("gameState", lobbies[lobbyId].gameState);
    }
  });

  // --- CREATE LOBBY HANDLER ---
  socket.on("createLobby", (lobbyId, ownerUsername, ownerUserId) => {
    console.log(`Lobby created: ${lobbyId} by ${ownerUsername} (${ownerUserId})`);
    lobbies[lobbyId] = {
      owner: { userId: ownerUserId, username: ownerUsername },
      players: [{ userId: ownerUserId, username: ownerUsername }],
      gameState: {
        currentQuestionIndex: 0,
        timer: 20,
        questions: [],
        playerScores: {},
      },
    };
    io.emit("lobbyListUpdate", Object.values(lobbies));
  });

  // --- STORE GAME SESSION ID HANDLER ---
  socket.on("storeGameSessionId", ({ lobbyId, gameSessionId }) => {
    if (lobbies[lobbyId]) {
      lobbies[lobbyId].gameSessionId = gameSessionId;
      console.log(`Stored gameSessionId ${gameSessionId} for lobby ${lobbyId}`);
      io.emit("lobbyListUpdate", Object.values(lobbies));
    }
  });

  // --- START GAME HANDLER ---
  socket.on("startGame", (data) => {
    const { lobbyId, questions } = data;
    console.log(`Starting game for lobby ${lobbyId}`);
    if (!lobbies[lobbyId]) {
      console.error("❌ Lobby does not exist:", lobbyId);
      return;
    }
    // Build playerScores using usernames as keys.
    const scores = {};
    lobbies[lobbyId].players.forEach((player) => {
      scores[player.username] = 0;
    });
    lobbies[lobbyId].gameState = {
      currentQuestionIndex: 0,
      timer: 20,
      questions: questions,
      playerScores: scores,
    };
    // Optionally, mark the lobby as started to prevent disconnects from disbanding it.
    lobbies[lobbyId].gameStarted = true;
    io.to(lobbyId).emit("gameState", lobbies[lobbyId].gameState);
    console.log("✅ Game state sent:", lobbies[lobbyId].gameState);
  });

  // --- ANSWER HANDLER ---
  socket.on("answer", (data) => {
    const { lobbyId, username, answer } = data;
    console.log(`Answer received for lobby ${lobbyId} from user ${username}`);
    handleAnswer(lobbyId, username, answer);
  });

  // --- EXPLICIT LEAVE LOBBY HANDLER ---
  socket.on("leaveLobby", (lobbyId, userId) => {
    if (lobbies[lobbyId]) {
      if (lobbies[lobbyId].owner.userId === userId) {
        console.log(`Lobby ${lobbyId} owner leaving. Disbanding lobby.`);
        io.to(lobbyId).emit("lobbyClosed");
        delete lobbies[lobbyId];
      } else {
        lobbies[lobbyId].players = lobbies[lobbyId].players.filter((p) => p.userId !== userId);
        console.log(`User ${userId} removed via explicit leave. Updated players:`, lobbies[lobbyId].players);
        io.to(lobbyId).emit("lobbyUpdate", { ...lobbies[lobbyId] });
      }
      io.emit("lobbyListUpdate", Object.values(lobbies));
    }
  });

  // --- DISCONNECT HANDLER WITH GRACE PERIOD ---
  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected.`);
    if (socket.userInfo) {
      const { lobbyId, userId, username } = socket.userInfo;
      // Set a 3-second grace period for disconnect removal
      disconnectTimeouts[userId] = setTimeout(() => {
        if (lobbies[lobbyId]) {
          if (lobbies[lobbyId].owner.userId === userId) {
            console.log(`Lobby ${lobbyId} owner (${username}) disconnected after grace period. Disbanding lobby.`);
            io.to(lobbyId).emit("lobbyClosed");
            delete lobbies[lobbyId];
          } else {
            lobbies[lobbyId].players = lobbies[lobbyId].players.filter((p) => p.userId !== userId);
            console.log(`User ${userId} removed after disconnect grace period. Updated players:`, lobbies[lobbyId].players);
            io.to(lobbyId).emit("lobbyUpdate", { ...lobbies[lobbyId] });
          }
          io.emit("lobbyListUpdate", Object.values(lobbies));
        }
        delete disconnectTimeouts[userId];
      }, 3000);
    }
  });
});

// --- ANSWER HANDLER FUNCTION ---
function handleAnswer(lobbyId, username, answer) {
  if (!lobbies[lobbyId]) return;
  const gameState = lobbies[lobbyId].gameState;
  if (!gameState.currentAnswers) {
    gameState.currentAnswers = {};
  }
  if (gameState.currentAnswers[username] !== undefined) {
    console.log(`User ${username} already answered for this question.`);
    return;
  }
  gameState.currentAnswers[username] = answer;
  if (Object.keys(gameState.currentAnswers).length === lobbies[lobbyId].players.length) {
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    const correctAnswer = currentQuestion.choices[currentQuestion.correctAnswerIndex];
    for (const player of lobbies[lobbyId].players) {
      if (gameState.currentAnswers[player.username] === correctAnswer) {
        gameState.playerScores[player.username] = (gameState.playerScores[player.username] || 0) + 1;
      }
    }
    gameState.currentAnswers = {};
    gameState.currentQuestionIndex++;
    gameState.timer = 20;
    if (gameState.currentQuestionIndex >= gameState.questions.length) {
      io.to(lobbyId).emit("gameOver", { ...gameState, gameSessionId: lobbies[lobbyId].gameSessionId });
    } else {
      io.to(lobbyId).emit("gameState", gameState);
    }
  }
}

server.listen(5080, () => {
  console.log("Server running on http://localhost:5080");
});
