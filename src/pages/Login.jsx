import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import "../styles/App.css";
import "../styles/Animations.css";
import "../styles/Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
  
    if (!username) newErrors.username = "Username is required";
    if (!password) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    try {
      const response = await fetch("http://localhost:8080/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include", // ✅ Ensures session cookies are sent
      });
  
      if (!response.ok) {
        const data = await response.json();
        setErrors({ server: data.message || "Login failed" });
        return;
      }
  
      console.log("✅ Login successful!");
  
      // ✅ Verify the session by calling /me
      const sessionResponse = await fetch("http://localhost:8080/v1/auth/me", {
        method: "GET",
        credentials: "include",
      });
  
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        console.log("✅ Session verified:", sessionData);
        sessionStorage.setItem("username", sessionData.username);
      } else {
        console.error("❌ Failed to verify session");
      }
  
      setIsLeaving(true);
      setTimeout(() => navigate("/home"), 800);
    } catch (error) {
      console.error("⚠️ Error logging in:", error);
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
    <div className="login-container">
      <motion.div 
        className="login-panel"
        variants={panelVariants}
        initial={{ y: "-100%" }}
        animate={isLeaving ? "exit" : "enter"}
      >
        <form className="login-form" onSubmit={handleSubmit}>
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
          {errors.server && <p className="error">{errors.server}</p>} {/* Display server error */}
          <button type="submit" className="warcraft-button">Login</button>
        </form>
      </motion.div>
      <BackButton setIsLeaving={setIsLeaving} handleBack={handleBack} />
    </div>
  );
}
