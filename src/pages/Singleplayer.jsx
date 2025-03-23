import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";
import "../styles/Singleplayer.css";
import "../styles/Animations.css";
import BackButton from "../components/BackButton";

export default function Singleplayer() {
  const [isLeaving, setIsLeaving] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const navigate = useNavigate();

  // Difficulty settings with time per question
  const difficulties = [
    { label: "Easy", time: 35, className: "easy-button" },
    { label: "Medium", time: 25, className: "medium-button" },
    { label: "Hard", time: 15, className: "hard-button" }
  ];

  const handleBack = () => {
    setIsLeaving(true);
    setTimeout(() => navigate("/"), 800);
  };

  const handleSelect = (index) => {
    console.log("Selected difficulty:", difficulties[index]); // Debugging
    setSelectedDifficulty(index);
    const { label, time } = difficulties[index];
    setTimeout(() => {
      console.log("Navigating to game...");
      navigate(`/singleplayer-game?difficulty=${label.toLowerCase()}&timer=${time}`);
    }, 1500);
  };

  // Animation Variants
  const panelVariants = {
    enter: { y: ["-100%", "10%", "0%"], transition: { duration: 1, ease: [0.6, 0.07, 0.78, 0.335] } },
    exit: { y: ["0%", "5%", "-150%"], transition: { duration: 0.8, ease: "easeIn" } },
    selected: { y: ["0%", "5%", "-200%"], transition: { duration: 1.5, ease: [0.6, 0.07, 0.78, 0.335] } },
    fade: { opacity: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  return (
    <div className="menu-container">
      <motion.div 
        className="panel singleplayer-panel"
        variants={panelVariants}
        initial={{ y: "-100%" }}
        animate={isLeaving ? "exit" : "enter"}
      >
        <div className="difficulty-container">
          {difficulties.map((difficulty, index) => (
            <motion.div 
              key={index} 
              className="difficulty-panel"
              variants={panelVariants}
              animate={selectedDifficulty === index ? "selected" : selectedDifficulty !== null ? "fade" : "enter"}
            >
              <motion.button
                className={difficulty.className}
                whileHover={{ scale: 1.05, filter: "brightness(1.2)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(index)}
              >
                {difficulty.label}
              </motion.button>
              <p className="difficulty-description">{difficulty.time} seconds per question</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <BackButton setIsLeaving={setIsLeaving} />
    </div>
  );
}
