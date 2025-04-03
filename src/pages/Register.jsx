import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import "../styles/App.css";
import "../styles/Animations.css";
import "../styles/Register.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLeaving, setIsLeaving] = useState(false);
  const navigate = useNavigate();

  const handleBack = () => {
    setIsLeaving(true);
    setTimeout(() => navigate("/"), 800);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!username) {
      newErrors.username = "Username is required";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      const response = await fetch("http://localhost:8080/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, confirmPassword }),
      });
    
      const data = await response.json();
    
      if (!response.ok) {
        if (data.errors) {
          // If errors is an object, use it directly; if it’s a string, assign it under 'server'
          if (typeof data.errors === "object") {
            setErrors(data.errors);
          } else {
            setErrors({ server: data.errors });
          }
        } else if (data.message) {
          setErrors({ server: data.message });
        } else {
          setErrors({ server: "Registration failed" });
        }
        return;
      }
    
      console.log("Registration successful:", data);
      setIsLeaving(true);
      setTimeout(() => navigate("/login"), 800);
    
    } catch (error) {
      console.error("Error registering:", error);
      setErrors({ server: "Something went wrong. Please try again." });
    }
  };
  
  

  // Animation Variants (Same as Multiplayer)
  const panelVariants = {
    enter: { y: ["-100%", "10%", "0%"], transition: { duration: 1, ease: [0.5, 0.07, 0.78, 0.335] } },
    exit: { y: ["0%", "5%", "-150%"], transition: { duration: 0.8, ease: "easeIn" } },
    fade: { opacity: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  return (
    <div className="register-container">
      <motion.div
        className="register-panel"
        variants={panelVariants}
        initial={{ y: "-100%" }}
        animate={isLeaving ? "exit" : "enter"}
      >
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {errors.username && <p className="error">{errors.username}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
          </div>
          {errors.server && <p className="error">{errors.server}</p>} {/* Display server error */}
          <button type="submit" className="warcraft-button">Register</button>
        </form>
      </motion.div>
      <BackButton setIsLeaving={setIsLeaving} handleBack={handleBack} />
    </div>
  );
}