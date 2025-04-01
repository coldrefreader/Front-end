import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import "../styles/JoinLobby.css";
import "../styles/Animations.css";
import "../styles/App.css";

export default function JoinLobby() {
  const navigate = useNavigate();
  const [lobbies, setLobbies] = useState([]);
  const [selectedLobby, setSelectedLobby] = useState(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [socket, setSocket] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const lobbiesPerPage = 6;

  const panelVariants = {
    enter: { y: ["-100%", "10%", "0%"], transition: { duration: 1, ease: [0.6, 0.04, 0.78, 0.335] } },
    exit: { y: ["0%", "5%", "-150%"], transition: { duration: 0.8, ease: "easeIn" } }
  };

  useEffect(() => {
    const socketInstance = io("http://localhost:5080");
    setSocket(socketInstance);

    socketInstance.on("lobbyClosed", () => {
      alert("This lobby has been closed.");
      navigate("/home");
    });

    socketInstance.on("lobbyListUpdate", (updatedLobbies) => {
      console.log("Updated lobby list received:", updatedLobbies);
      console.log("Socket update - lobby list received:", JSON.stringify(updatedLobbies, null, 2));
      setLobbies(updatedLobbies);
    });

    const fetchLobbies = async () => {
      try {
        const response = await fetch("http://localhost:8080/v1/lobbies/list", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error("❌ Failed to fetch lobbies.");
        const data = await response.json();
        console.log("Fetched lobbies from REST:", JSON.stringify(data, null, 2));
        setLobbies(data);
      } catch (error) {
        console.error("⚠️ Error fetching lobbies:", error);
      }
    };

    fetchLobbies();

    return () => {
      socketInstance.disconnect();
    };
  }, [navigate]);

  const handleNavigation = (path) => {
    setIsLeaving(true);
    setTimeout(() => navigate(path), 800);
  };

  const handleJoinLobby = async () => {
    if (!selectedLobby) return;
    try {
      const response = await fetch(`http://localhost:8080/v1/lobbies/join/${selectedLobby}`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("❌ Failed to join lobby.");
      console.log("✅ Successfully joined lobby:", selectedLobby);
      // Remove the extra socket.emit here if REST already handles joining.
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

  // Pagination and filtering
  const indexOfLastLobby = currentPage * lobbiesPerPage;
  const indexOfFirstLobby = indexOfLastLobby - lobbiesPerPage;
  const currentLobbies = lobbies.slice(indexOfFirstLobby, indexOfLastLobby);
  const filteredLobbies = currentLobbies.filter(lobby => lobby.owner && lobby.players && lobby.players.length > 0);
  const emptySlots = Array.from({ length: lobbiesPerPage - filteredLobbies.length });

  return (
    <>
      <motion.div
        className={`join-lobby-container ${isLeaving ? "leaving" : ""}`}
        variants={panelVariants}
        initial={{ y: "-100%" }}
        animate={isLeaving ? "exit" : "enter"}
      >
        <table>
          <thead>
            <tr>
              <th>Owner</th>
              <th>Lobby ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLobbies.map((lobby) => (
              <tr
                key={lobby.lobbyId} // Unique key
                className={lobby.players.length === 2 ? "full-lobby" : ""}
                onClick={() => setSelectedLobby(lobby.lobbyId)}
              >
                <td>{lobby.owner && lobby.owner.username ? lobby.owner.username : "No owner"}</td>
                <td>{lobby.lobbyId || "N/A"}</td>
                <td>
                  <button onClick={handleJoinLobby} disabled={lobby.players.length === 2}>
                    Join
                  </button>
                </td>
              </tr>
            ))}
            {emptySlots.map((_, index) => (
              <tr key={`empty-${index}`} className="empty-slot">
                <td colSpan="3">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          {Array.from({ length: Math.ceil(lobbies.length / lobbiesPerPage) }, (_, index) => (
            <button key={index + 1} onClick={() => setCurrentPage(index + 1)}>
              {index + 1}
            </button>
          ))}
        </div>
      </motion.div>
      <div className="back-button-container">
        <button className="back-button" onClick={() => handleNavigation("/home")}>Back</button>
      </div>
    </>
  );
}
