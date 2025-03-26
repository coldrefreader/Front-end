import { useNavigate } from "react-router-dom";
import Chatbox from "../components/Chatbox";
import "../styles/App.css";
import "../styles/Home.css";
import "../styles/Animations.css";
import { useEffect, useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:8080/v1/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("User session found:", data);
          setUsername(data.username);
          setRole(data.role);
          sessionStorage.setItem("username", data.username); // Store username
        } else {
          console.log("No session found, redirecting to index.");
          sessionStorage.removeItem("username");
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking session:", error);
        navigate("/");
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8080/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        console.log("Logout successful");
        sessionStorage.removeItem("username");
        navigate("/"); // Redirect to index
      } else {
        console.error("Failed to logout");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="home-container">
      <h2>Welcome, {username || "Guest"}!</h2>

      {/* Header Section */}
      <div className="home-header">
        <button className="header-button button-1" onClick={() => navigate("/create-lobby")}>Create Lobby</button>
        <button className="header-button button-2" onClick={() => navigate("/join-lobby")}>Join Lobby</button>
        <button className="header-button button-3" onClick={() => navigate("/leaderboard")}></button>
        <button className="header-button button-4" onClick={() => navigate("/profile")}>Profile</button>
        {role === "ADMIN" && (
          <button className="header-button button-5" onClick={() => navigate("/admin")}>Admin</button>
        )}
      </div>

      {/* Chatbox with username passed */}
      {username && <Chatbox username={username} />}

      {/* Logout Button */}
      <button className="back-button" onClick={handleLogout}>Logout</button>
    </div>
  );
}