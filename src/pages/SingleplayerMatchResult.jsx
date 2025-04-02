import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/SingleplayerMatchResult.css";

// Animation Variants: Entry is now instant (no movement) so the container is centered at load.
const panelVariants = {
  enter: { y: "0%", transition: { duration: 0 } },
  exit: { y: ["0%", "5%", "-150%"], transition: { duration: 0.8, ease: "easeIn" } },
};

export default function MatchResult() {
  const navigate = useNavigate();
  const [matchResult, setMatchResult] = useState(null);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const matchHistory = JSON.parse(localStorage.getItem("matchHistory")) || [];
    if (matchHistory.length === 0) {
      navigate("/"); // Redirect to index page if no match history
    } else {
      setMatchResult(matchHistory[matchHistory.length - 1]); // Get the latest match result
    }
  }, [navigate]);

  const handleHome = () => {
    setIsLeaving(true);
    setTimeout(() => {
      localStorage.removeItem("matchHistory"); // Clear match history
      navigate("/");
    }, 800);
  };

  if (!matchResult) return <h2>Loading Match Result...</h2>;

  // Determine the outcome based on the scores.
  const outcome =
    matchResult.playerScore > matchResult.aiScore
      ? "Victory"
      : matchResult.playerScore < matchResult.aiScore
      ? "Defeat"
      : "Draw";

  return (
    <>
      <motion.div
        className="singleplayer-match-result-container"
        initial="enter"
        animate={isLeaving ? "exit" : "enter"}
        variants={panelVariants}
      >
        <h2>{outcome}</h2>
        <div className="singleplayer-match-result-details">
          <p>Date: {matchResult.date}</p>
          <p>Difficulty: {matchResult.difficulty}</p>
          <p>Player Score: {matchResult.playerScore}</p>
          <p>AI Score: {matchResult.aiScore}</p>
        </div>
      </motion.div>

      {/* Home Button (Not inside animation) */}
      <div className="home-button-container">
        <button className="singleplayer-home-button" onClick={handleHome}>
          Home
        </button>
      </div>
    </>
  );
}
