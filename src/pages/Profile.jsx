import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [hasSession, setHasSession] = useState(true);

  const panelVariants = {
    enter: { y: ["-100%", "10%", "0%"], transition: { duration: 1, ease: [0.6, 0.07, 0.78, 0.335] } },
    exit: { y: ["0%", "5%", "-150%"], transition: { duration: 0.8, ease: "easeIn" } },
    selected: { y: ["0%", "5%", "-200%"], transition: { duration: 1.5, ease: [0.6, 0.07, 0.78, 0.335] } },
    fade: { opacity: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("🔄 Fetching updated profile data...");
        const response = await fetch("http://localhost:8080/v1/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-cache", // Ensure fresh data
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log("✅ Updated user session found:", data);
          setUser(data);
          sessionStorage.setItem("username", data.username);
        } else {
          console.log("❌ No session found, redirecting.");
          sessionStorage.removeItem("username");
          setHasSession(false);
          navigate("/");
        }
      } catch (error) {
        console.error("⚠️ Error checking session:", error);
        setHasSession(false);
        navigate("/");
      }
    };
  
    checkSession();
  }, [navigate]); // ✅ Runs on mount & after returning from edit

  const handleNavigation = (path) => {
    setIsLeaving(true);
    setTimeout(() => navigate(path), 800);
  };

  if (!hasSession) return <h2>Redirecting to Index...</h2>;
  if (!user) return <h2>Loading Profile...</h2>;

  return (
    <>
      <motion.div 
        className={`profile-container ${isLeaving ? "leaving" : ""}`}
        variants={panelVariants}
        initial={{ y: "-100%" }} // Directly set initial prop
        animate={isLeaving ? "exit" : "enter"}
      >
        <h2>Profile</h2>
        <div className="profile-info">
          <p><strong>Username:</strong> {user?.username || "N/A"}</p>
          <p><strong>Email:</strong> {user?.email || "Not set"}</p>
          <p><strong>First Name:</strong> {user?.firstName || "Not set"}</p>
          <p><strong>Last Name:</strong> {user?.lastName || "Not set"}</p>
        </div>

        <div className="profile-buttons">
          <button className="profile-button" onClick={() => handleNavigation("/edit-profile")}>Edit Profile</button>
          <button className="profile-button" onClick={() => handleNavigation("/match-history")}>Match History</button>
        </div>
      </motion.div>

      <div className="back-button-container">
        <button className="back-button" onClick={() => handleNavigation("/home")}>Back</button>
      </div>
    </>
  );
}