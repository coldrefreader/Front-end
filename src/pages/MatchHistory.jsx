import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/MatchHistory.css";

export default function MatchHistory() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [isLeaving, setIsLeaving] = useState(false);
  const [hasSession, setHasSession] = useState(true);
  const [loading, setLoading] = useState(true);

  const panelVariants = {
    enter: { opacity: [0, 1], transition: { duration: 1, ease: "easeOut" } },
    exit: { y: ["0%", "5%", "-150%"], transition: { duration: 0.8, ease: "easeIn" } },
    fade: { opacity: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };
  

  useEffect(() => {
    const fetchMatchHistory = async () => {
      try {
        console.log("📡 Fetching match history...");
        const response = await fetch("http://localhost:8080/v1/match-history", {
          method: "GET",
          credentials: "include",
          cache: "no-cache"
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Match history received:", data);
          setMatches(data);
        } else {
          console.log("❌ No session found, redirecting.");
          sessionStorage.removeItem("username");
          setHasSession(false);
          navigate("/");
        }
      } catch (error) {
        console.error("⚠️ Error fetching match history:", error);
        setHasSession(false);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchMatchHistory();
  }, [navigate]);

  const handleBack = () => {
    setIsLeaving(true);
    setTimeout(() => navigate("/profile"), 800);
  };

  if (!hasSession) return <h2>Redirecting to Index...</h2>;
  if (loading) return <h2>Loading Match History...</h2>;
  if (!matches) return <h2>No match history available.</h2>;

  return (
    <>
      <motion.div 
        className={`match-history-container ${isLeaving ? "leaving" : ""}`}
        variants={panelVariants}
        initial={{ opacity: 0 }} // Start fully transparent
        animate={isLeaving ? "exit" : "enter"}
      >
        <h2>Match History</h2>
        <table className="match-history-table">
          <thead>
            <tr>
              <th>Opponent</th>
              <th>Your Score</th>
              <th>Opponent's Score</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
          {matches.map((match, index) => (
            <tr key={index}>
              <td>{match.opponentUsername || "Unknown"}</td> {/* Fixed opponent name */}
              <td>{match.playerScore}</td> {/* Fixed our score */}
              <td>{match.opponentScore}</td>
              <td className={
                match.result === "VICTORY" ? "win" :
                match.result === "DEFEAT" ? "lose" : "draw"
              }>
                {match.result}
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </motion.div>

      <div className="back-button-container">
        <button className="back-button" onClick={handleBack}>Back</button>
      </div>
    </>
  );
}
