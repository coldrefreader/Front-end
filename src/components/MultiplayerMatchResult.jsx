import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/MultiplayerMatchResult.css";

const panelVariants = {
  enter: { y: "0%", transition: { duration: 0 } },
  exit: { y: ["0%", "5%", "-150%"], transition: { duration: 0.8, ease: "easeIn" } },
};

export default function MultiplayerMatchResult() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [matchResult, setMatchResult] = useState(null);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8080/v1/game-sessions/${matchId}`, { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        console.log("Match result fetched:", data);
        setMatchResult(data);
      })
      .catch((error) => console.error("Error fetching match result:", error));
  }, [matchId]);

  const handleHome = () => {
    setIsLeaving(true);
    setTimeout(() => navigate("/home"), 800);
  };

  if (!matchResult) return <h2>Loading Match Result...</h2>;

  // Determine the outcome from the perspective of the current user.
  const currentUsername = sessionStorage.getItem("username");
  let outcome = "Draw";
  if (currentUsername === matchResult.player1) {
    outcome =
      matchResult.player1Score > matchResult.player2Score
        ? "Victory"
        : matchResult.player1Score < matchResult.player2Score
        ? "Defeat"
        : "Draw";
  } else if (currentUsername === matchResult.player2) {
    outcome =
      matchResult.player2Score > matchResult.player1Score
        ? "Victory"
        : matchResult.player2Score < matchResult.player1Score
        ? "Defeat"
        : "Draw";
  }

  return (
    <>
      <motion.div
        className="multiplayer-match-result-container"
        initial="enter"
        animate={isLeaving ? "exit" : "enter"}
        variants={panelVariants}
      >
        <h2>{outcome}</h2>
        <div className="multiplayer-match-result-details">
          <p>Date: {matchResult.date}</p>
          <p>
            Host: {matchResult.player1} (Score: {matchResult.player1Score})
          </p>
          <p>
            Opponent: {matchResult.player2} (Score: {matchResult.player2Score})
          </p>
        </div>
      </motion.div>
      <div className="home-button-container">
        <button className="multiplayer-home-button" onClick={handleHome}>
          Home
        </button>
      </div>
    </>
  );
}
