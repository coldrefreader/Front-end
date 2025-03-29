import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/CreateLobby.css";
import "../styles/Animations.css";

export default function CreateLobby() {
  const navigate = useNavigate();
  const [lobbyId, setLobbyId] = useState(null);
  const [error, setError] = useState("");
  const [isLeaving, setIsLeaving] = useState(false);

  const handleNavigation = (path) => {
    setIsLeaving(true);
    setTimeout(() => navigate(path), 800); // Wait for animation before navigating
  };

  // Animation Variants
  const panelVariants = {
    enter: { y: ["-100%", "10%", "0%"], transition: { duration: 1, ease: [0.6, 0.04, 0.78, 0.335] } },
    exit: { y: ["0%", "5%", "-150%"], transition: { duration: 0.8, ease: "easeIn" } }
  };

  const handleCreateLobby = async () => {
    try {
      const response = await fetch("http://localhost:8080/v1/lobbies/create", {
        method: "POST",
        credentials: "include",
      });
      

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Lobby Created:", data);
        setLobbyId(data.lobbyId);
      } else {
        throw new Error("❌ Failed to create lobby.");
      }
    } catch (error) {
      console.error("⚠️ Error:", error);
      setError(error.message);
    }
  };

  const handleLeave = () => {
    setIsLeaving(true);
    setTimeout(() => navigate("/home"), 800); // Navigate to home page
  };

  const handleGoToLobby = () => {
    setIsLeaving(true);
    setTimeout(() => navigate(`/lobby/${lobbyId}`), 800); // Wait for animation before navigating to lobby
  };

  return (
    <motion.div
      className={`create-lobby-container ${isLeaving ? "leaving" : ""}`}
      variants={panelVariants}
      initial={{ y: "-100%" }}
      animate={isLeaving ? "exit" : "enter"}
    >
      <h2>Create Lobby</h2>
      {lobbyId ? (
        <>
          <p className="lobby-id">Lobby Created! ID: {lobbyId}</p>
          <button className="warcraft-button" onClick={handleGoToLobby}>
            Go to Lobby
          </button>
        </>
      ) : (
        <button className="warcraft-button" onClick={handleCreateLobby}>Create</button>
      )}
      {error && <p className="error-message">{error}</p>}
      <button className="warcraft-button" onClick={handleLeave}>Cancel</button>
    </motion.div>
  );
}