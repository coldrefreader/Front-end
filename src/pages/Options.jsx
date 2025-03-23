import { motion } from "framer-motion";
import { useState } from "react";
import BackButton from "../components/BackButton";
import "../styles/App.css";
import "../styles/Options.css";
import "../styles/Animations.css";

export default function Options() {
  const [isLeaving, setIsLeaving] = useState(false);
  const [musicVolume, setMusicVolume] = useState(50);
  const [soundEffectsVolume, setSoundEffectsVolume] = useState(50);

  // Panel animation
  const panelVariants = {
    enter: { y: ["-100%", "10%", "0%"], transition: { duration: 1, ease: [0.6, 0.04, 0.78, 0.335] } },
    exit: { y: ["0%", "5%", "-150%"], transition: { duration: 0.8, ease: "easeIn" } }
  };

  return (
    <div className="menu-container">
      <motion.div 
        className="panel options-panel"
        variants={panelVariants}
        initial={{ y: "-100%" }}
        animate={isLeaving ? "exit" : "enter"}
      >
        <div className="option-item">
          <label className="slider-label">
            Music Volume
          </label>
          <div className="slider-container">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={musicVolume} 
              onChange={(e) => setMusicVolume(e.target.value)} 
              className="slider"
            />
            <span className="volume-number">{musicVolume}</span>
          </div>
        </div>
        <div className="option-item">
          <label className="slider-label">
            Sound Effects Volume
          </label>
          <div className="slider-container">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={soundEffectsVolume} 
              onChange={(e) => setSoundEffectsVolume(e.target.value)} 
              className="slider"
            />
            <span className="volume-number">{soundEffectsVolume}</span>
          </div>
        </div>
      </motion.div>
      
      {/* Back button to Index */}
      <BackButton setIsLeaving={setIsLeaving} />
    </div>
  );
}