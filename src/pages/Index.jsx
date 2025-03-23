import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/App.css";
import "../styles/IndexMenu.css";
import "../styles/Animations.css";

export default function Index() {
  const [isLeaving, setIsLeaving] = useState(false);
  const navigate = useNavigate();

  const buttons = [
    { label: "Singleplayer", path: "/singleplayer" },
    { label: "Multiplayer", path: "/multiplayer" },
    { label: "Options", path: "/options" },
  ];

  // Animation Variants
  const panelVariants = {
    enter: { y: ["-100%", "10%", "0%"], transition: { duration: 1, ease: [0.6, 0.04, 0.78, 0.335] } },
    exit: { y: ["0%", "5%", "-150%"], transition: { duration: 0.8, ease: "easeIn" } }
  };

  const handleNavigation = (path) => {
    setIsLeaving(true);
    setTimeout(() => navigate(path), 800); // Wait for animation before changing page
  };

  return (
    <div className="menu-container">
      <motion.div 
        className="panel index-panel"
        variants={panelVariants}
        initial={{ y: "-100%" }}
        animate={isLeaving ? "exit" : "enter"}
      >
        {buttons.map((button, index) => (
          <MenuButton key={index} label={button.label} onClick={() => handleNavigation(button.path)} />
        ))}
      </motion.div>
    </div>
  );
}

function MenuButton({ label, onClick }) {
  return (
    <motion.button
      className="warcraft-button"
      whileHover={{ scale: 1.05, filter: "brightness(1.2)" }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {label}
    </motion.button>
  );
}
