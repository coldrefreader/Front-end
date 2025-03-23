import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/MatchResult.css";

// Animation Variants
const panelVariants = {
  enter: { y: ["-100%", "10%", "0%"], transition: { duration: 1, ease: [0.6, 0.07, 0.78, 0.335] } },
  exit: { y: ["0%", "5%", "-150%"], transition: { duration: 0.8, ease: "easeIn" } },
  selected: { y: ["0%", "5%", "-200%"], transition: { duration: 1.5, ease: [0.6, 0.07, 0.78, 0.335] } },
  fade: { opacity: 0, transition: { duration: 0.7, ease: "easeOut" } }
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

  return (
    <>
      <motion.div
        className="match-result-container"
        initial="enter"
        animate={isLeaving ? "exit" : "enter"}
        variants={panelVariants}
      >
        <h2>Match Result</h2>
        <div className="match-result-details">
          <p>Date: {matchResult.date}</p>
          <p>Difficulty: {matchResult.difficulty}</p>
          <p>Player Score: {matchResult.playerScore}</p>
          <p>AI Score: {matchResult.aiScore}</p>
        </div>
      </motion.div>

      {/* Home Button (Not inside animation) */}
      <div className="home-button-container">
        <button className="home-button" onClick={handleHome}>Home</button>
      </div>
    </>
  );
}