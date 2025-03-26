import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { io } from "socket.io-client"; // ✅ Import socket.io-client
import "../styles/Animations.css";
import "../styles/JoinLobby.css";

export default function JoinLobby() {
  const navigate = useNavigate();
  const [lobbies, setLobbies] = useState([]);
  const [selectedLobby, setSelectedLobby] = useState(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [socket, setSocket] = useState(null); // ✅ Store socket connection

  const panelVariants = {
    enter: { y: ["-100%", "10%", "0%"], transition: { duration: 1, ease: [0.6, 0.04, 0.78, 0.335] } },
    exit: { y: ["0%", "5%", "-150%"], transition: { duration: 0.8, ease: "easeIn" } }
  };

  useEffect(() => {
    const fetchLobbies = async () => {
      try {
        const response = await fetch("http://localhost:8080/v1/lobbies/list", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) throw new Error("❌ Failed to fetch lobbies.");

        const data = await response.json();
        setLobbies(data);
      } catch (error) {
        console.error("⚠️ Error fetching lobbies:", error);
      }
    };

    fetchLobbies();

    // ✅ WebSocket Connection (Placed Here!)
    const socketInstance = io("http://localhost:5080"); // Connect to WebSocket server
    setSocket(socketInstance); // Store the socket

    // ✅ Listen for Real-Time Updates
    socketInstance.on("lobbyUpdate", (updatedLobbies) => {
      console.log("Updated lobby list received:", updatedLobbies);
      setLobbies(updatedLobbies);
    });

    return () => {
      socketInstance.disconnect(); // Cleanup on unmount
    };
  }, []); // ✅ Runs once when component mounts

  const handleJoinLobby = async () => {
    if (!selectedLobby) return;

    try {
      const response = await fetch(`http://localhost:8080/v1/lobbies/join/${selectedLobby}`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) throw new Error("❌ Failed to join lobby.");

      console.log("✅ Successfully joined lobby:", selectedLobby);
      setIsLeaving(true);
      setTimeout(() => navigate(`/lobby/${selectedLobby}`), 800);
    } catch (error) {
      console.error("⚠️ Error joining lobby:", error);
    }
  };

  const handleLeave = () => {
    setIsLeaving(true);
    setTimeout(() => navigate("/home"), 800);
  };

  return (
    <motion.div
      className={`join-lobby-container ${isLeaving ? "leaving" : ""}`}
      variants={panelVariants}
      initial={{ y: "-100%" }}
      animate={isLeaving ? "exit" : "enter"}
    >
      <h2>Join a Lobby</h2>
      {lobbies.length === 0 ? (
        <p>No lobbies available</p>
      ) : (
        <ul className="lobby-list">
          {lobbies.map((lobby) => (
            <li
              key={lobby.lobbyId}
              className={lobby.players.length === 2 ? "full-lobby" : ""}
              onClick={() => setSelectedLobby(lobby.lobbyId)}
              onDoubleClick={handleJoinLobby}
            >
              Lobby {lobby.lobbyId} ({lobby.players.length}/2)
            </li>
          ))}
        </ul>
      )}
      <div className="button-container">
        <button className="lobby-button" onClick={handleJoinLobby} disabled={!selectedLobby}>
          Join Lobby
        </button>
        <button className="lobby-button" onClick={handleLeave}>Back</button>
      </div>
    </motion.div>
  );
}
