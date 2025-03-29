import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import "../styles/MultiplayerLobby.css";
import "../styles/Animations.css";

export default function MultiplayerLobby() {
  const { lobbyId } = useParams();
  const navigate = useNavigate();
  const [lobby, setLobby] = useState(null);
  const [error, setError] = useState("");
  const [isLeaving, setIsLeaving] = useState(false);
  const [socket, setSocket] = useState(null);

  const panelVariants = {
    enter: { y: ["-100%", "10%", "0%"], transition: { duration: 1, ease: [0.6, 0.04, 0.78, 0.335] } },
    exit: { y: ["0%", "5%", "-150%"], transition: { duration: 0.8, ease: "easeIn" } }
  };

  useEffect(() => {
    const socket = io("http://localhost:5080");
    setSocket(socket);

    socket.on("lobbyClosed", () => {
      alert("This lobby has been closed.");
      navigate("/home");
    });
  
    const storedUsername = sessionStorage.getItem("username"); // ✅ Retrieve username
    const storedUserId = sessionStorage.getItem("userId"); // ✅ Retrieve userId
  
    if (!storedUsername) {
      console.error("❌ No username found in session storage.");
      return;
    }
  
    console.log(`Joining lobby ${lobbyId} as ${storedUsername}`);
    socket.emit("joinLobby", lobbyId, storedUsername, storedUserId); // ✅ Pass username correctly
  
    socket.on("lobbyUpdate", (data) => {
      console.log("Lobby update received:", data);
      setLobby(data);
    });
  
    socket.on("gameState", (gameState) => {
      console.log("Game state received:", gameState);
      // Update the lobby state with the received game state
      setLobby((prevLobby) => ({
        ...prevLobby,
        gameState: {
          ...prevLobby.gameState,
          ...gameState,
          questions: gameState.questions, // Ensure questions are included
        },
      }));
      setIsLeaving(true);
      setTimeout(() => navigate(`/game/${lobbyId}`), 800);
    });
    
  
    return () => {
      socket.disconnect();
    };
  }, [lobbyId, navigate]);

  const handleLeave = () => {
    const storedUserId = sessionStorage.getItem("userId");
    if (socket && storedUserId && lobbyId) {
      socket.emit("leaveLobby", lobbyId, storedUserId);
    }
    setIsLeaving(true);
    setTimeout(() => navigate("/home"), 800);
  };
  

  const handleStartGame = async () => {
    try {
      console.log("Starting game for lobby:", lobbyId);
      // 1. Fetch the questions
      const response = await fetch("http://localhost:8080/v1/questions");
      if (!response.ok) throw new Error("❌ Failed to fetch questions.");
      const questions = await response.json();
      console.log("✅ Questions fetched:", questions);
    
      // 2. Create the game session via REST call
      const storedUserId = sessionStorage.getItem("userId");
      const storedUsername = sessionStorage.getItem("username");
      if (!lobby || !lobby.players || lobby.players.length < 2) {
        throw new Error("Opponent not available.");
      }
      // Assuming lobby.players is now an array of objects with userId and username.
      const opponentId = lobby.players[1].userId; // Use the opponent's UUID
    
      const gameSessionPayload = {
        player1Id: storedUserId,
        player2Id: opponentId
      };
    
      const sessionResponse = await fetch("http://localhost:8080/v1/game-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(gameSessionPayload)
      });
      if (!sessionResponse.ok) throw new Error("❌ Failed to create game session.");
      const sessionData = await sessionResponse.json();
      console.log("✅ Game session created:", sessionData);
      // Save the game session ID for later use (e.g., to fetch match results)
      sessionStorage.setItem("gameSessionId", sessionData.gameSessionId);
      socket.emit("storeGameSessionId", { lobbyId, gameSessionId: sessionData.gameSessionId });
    
      // 3. Start the game via socket by emitting the startGame event
      socket.emit("startGame", { lobbyId, questions });
    } catch (error) {
      console.error("⚠️ Error starting game:", error);
      setError(error.message);
    }
  };

  const handleDisbandLobby = async () => {
    try {
      console.log("Disbanding lobby:", lobbyId);
      const response = await fetch(`http://localhost:8080/v1/lobbies/disband/${lobbyId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`❌ Failed to disband lobby. Status: ${response.status}`);
      }

      console.log("✅ Lobby disbanded");
      setIsLeaving(true);
      setTimeout(() => navigate("/home"), 800);
    } catch (error) {
      console.error("⚠️ Error disbanding lobby:", error);
      setError(error.message);
    }
  };

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button className="lobby-button" onClick={handleLeave}>Back</button>
      </div>
    );
  }

  if (!lobby) {
    return <p>Loading...</p>;
  }

  const storedUsername = sessionStorage.getItem("username");
  const isOwner = lobby.owner.username === storedUsername;
  sessionStorage.setItem("isOwner", isOwner ? "true" : "false");

  console.log("Current lobby state:", lobby);
  console.log("Is owner:", isOwner);

  return (
    <motion.div
      className={`multiplayer-lobby ${isLeaving ? "leaving" : ""}`}
      variants={panelVariants}
      initial={{ y: "-100%" }}
      animate={isLeaving ? "exit" : "enter"}
    >
      <h2>Lobby {lobbyId}</h2>
      <div className="lobby-owner">
        <p>Owner: {lobby.owner.username}</p>
      </div>
      <div className="lobby-players">
        {lobby.players.length > 1 ? (
          <p>Player: {lobby.players[1].username}</p>
        ) : (
          <p>Waiting for another player...</p>
        )}
      </div>

      <div className="button-container">
        {isOwner && (
          <>
            {lobby.players.length === 2 && (
              <button className="lobby-button" onClick={handleStartGame}>Start Game</button>
            )}
            <button className="lobby-button" onClick={handleDisbandLobby}>Disband Lobby</button>
          </>
        )}
        {!isOwner && (
          <button className="lobby-button" onClick={handleLeave}>Leave Lobby</button>
        )}
      </div>
    </motion.div>
  );
}