import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import BackButton from "../components/BackButton";
import "../styles/App.css";
import "../styles/Animations.css";
import "../styles/Multiplayer.css";

export default function Multiplayer() {
  const [isLeaving, setIsLeaving] = useState(false);
  const [selectedButton, setSelectedButton] = useState(null);
  const navigate = useNavigate();

  const buttons = [
    { label: "Register", path: "/register" },
    { label: "Login", path: "/login" }
  ];

  const handleBack = () => {
    setIsLeaving(true);
    setTimeout(() => navigate("/"), 800);
  };

  const handleSelect = (index) => {
    setSelectedButton(index);
  };

  // Animation Variants (Same as Singleplayer)
  const panelVariants = {
    enter: { y: ["-100%", "10%", "0%"], transition: { duration: 1, ease: [0.5, 0.07, 0.78, 0.335] } },
    exit: { y: ["0%", "5%", "-150%"], transition: { duration: 0.8, ease: "easeIn" } },
    selected: { y: ["0%", "5%", "-200%"], transition: { duration: 1.5, ease: [0.6, 0.07, 0.78, 0.335] } },
    fade: { opacity: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };


  return (
    <div className="menu-container">
      <motion.div 
        className="panel multiplayer-panel"
        variants={panelVariants}
        initial={{ y: "-100%" }}
        animate={isLeaving ? "exit" : "enter"}
      >
        <div className="multiplayer-container" style={{
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          gap: "50px", 
          height: "100vh",
          position: "relative"
        }}>
          {buttons.map((button, index) => (
            <motion.div 
              key={index} 
              className="difficulty-panel"
              variants={panelVariants}
              animate={selectedButton === index ? "selected" : selectedButton !== null ? "fade" : "enter"}
              onAnimationComplete={() => {
                if (selectedButton === index) {
                  navigate(buttons[index].path);
                }
              }}
            >
              <motion.button
                className="multiplayer-button"
                whileHover={{ scale: 1.05, filter: "brightness(1.2)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(index)}
              >
                {button.label}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <BackButton setIsLeaving={setIsLeaving} handleBack={handleBack} />
    </div>
  );
}